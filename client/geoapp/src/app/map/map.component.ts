import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet'
import {LocationType} from '../../shared/models/location';
import {MapControlService} from '../map-control.service';
import {States} from '../../shared/models/states';
import {SolverService} from '../solver.service';
import {GeoJSON} from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

interface CustomMarkerOptions extends L.MarkerOptions {
  id: string;
  type: LocationType;
}
class OriginMarker extends L.Marker{
  public id: string = '';
  public type: LocationType = LocationType.destination;
  constructor(latLng: L.LatLngExpression, options?: CustomMarkerOptions) {
    super(latLng, options);
    this.id = options?.id || '';
    this.type = options?.type || LocationType.destination;
  }
}
interface DestinationMarkerOptions extends L.CircleMarkerOptions {
  id: string;
  type: LocationType;
}
class DestinationMarker extends L.CircleMarker {
  public id: string = '';
  public type: LocationType = LocationType.destination;
  constructor(latLng: L.LatLngExpression, options: DestinationMarkerOptions) {
    super(latLng, options);
    this.id = options?.id || '';
    this.type = options?.type || LocationType.destination;
  }
}

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private destinationMarkers: DestinationMarker[] = [];
  private originMarkers!: OriginMarker | null;
  private markerID = 0;
  private state : States= States.idle;
  private routeToRender!: GeoJSON | null;
  constructor(private mapControlService: MapControlService, private solverService: SolverService) {
  }

  ngOnInit(): void {
    this.mapControlService.getSubject().subscribe((value) => {
      console.log(value)
      this.changeState(value);
    })
  }

  // Valhalla gives us a polyline that is encoded in a way that is not standard
  // code taken from https://valhalla.github.io/demos/polyline/
  // description see https://valhalla.github.io/valhalla/decoding/
  private render_route(encoded_route: any, mul: any) {
  var inv = 1.0 / mul;
  var decoded = [];
  var previous = [0,0];
  var i = 0;
  //for each byte
  while(i < encoded_route.length) {
    //for each coord (lat, lon)
    var ll = [0,0]
    for(var j = 0; j < 2; j++) {
      var shift = 0;
      var byte = 0x20;
      //keep decoding bytes until you have this coord
      while(byte >= 0x20) {
        byte = encoded_route.charCodeAt(i++) - 63;
        ll[j] |= (byte & 0x1f) << shift;
        shift += 5;
      }
      //add previous offset to get final value and remember for next one
      ll[j] = previous[j] + (ll[j] & 1 ? ~(ll[j] >> 1) : (ll[j] >> 1));
      previous[j] = ll[j];
    }
    //scale by precision and chop off long coords also flip the positions so
    //its the far more standard lon,lat instead of lat,lon
    decoded.push([ll[1] * inv,ll[0] * inv]);
  }
  //hand back the list of coordinates
  return decoded;
  };
  private changeState(value: States) {
    switch (value) {
      case States.startRoute:
        this.getGeoJson()
        console.log("Start Route")
        break;
      case States.setPoint:
        this.map.on('click', (event: L.LeafletMouseEvent) => {
          console.log(event)
          this.markerID += 1
          let marker = new DestinationMarker(event.latlng, {radius: 10, id: 'marker-' + this.markerID.toString(), type: LocationType.destination})
          marker.addTo(this.map)
          this.destinationMarkers.push(marker)
        })
        this.state = States.setPoint;
        console.log("Set Point")
        L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
        break;
      case States.setVehicle:
        console.log("Set Vehicle")
        this.map.on('click', (event: L.LeafletMouseEvent) => {
          console.log(event)
          this.markerID += 1
          let marker = new OriginMarker(event.latlng, {draggable: true, id: 'origin-' + this.markerID.toString(), type: LocationType.origin})
          marker.addTo(this.map)
          this.originMarkers = marker;
        })
        this.state = States.setVehicle;
        console.log("Set Vehicle")
        L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
        break;
      case States.setClear:
        this.destinationMarkers.forEach(marker => {
          this.map.removeLayer(marker)
        })
        this.destinationMarkers = []
        if (this.originMarkers) {
          this.map.removeLayer(this.originMarkers)
        }
        this.originMarkers = null
        if (this.routeToRender) {
          this.map.removeLayer(this.routeToRender)
        }
        this.routeToRender = null;
        this.markerID = 0;
        break;
      case States.setAbort:
        console.log("Set Abort")
        break;
      case States.idle:
        console.log("Idle")
        L.DomUtil.removeClass(this.map.getContainer(), 'crosshair-cursor-enabled');
        this.map.off('click')
        break;
      default:
        console.log("Unknown Command")
        L.DomUtil.removeClass(this.map.getContainer(), 'crosshair-cursor-enabled');
        break;
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [46.623888, 14.307641],
      zoom: 30
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
    tiles.addTo(this.map);
  }

  ngAfterViewInit() {
    this.initMap()
  }

  onClick(event: any) {
    console.log(event)
  }

  private getGeoJson(): void {

    let result : GeoJSON.Feature[] = [];
    for (const marker of this.destinationMarkers) {
      const latLng = marker.getLatLng();
      result.push( {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [latLng.lng, latLng.lat]
        },
        properties: {
          id: marker.id,
          type: marker.type
        }
      });
    }
    if (this.originMarkers) {
      result.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [this.originMarkers.getLatLng().lng, this.originMarkers.getLatLng().lat]
          },
          properties: {
            id: this.originMarkers?.id,
            type: this.originMarkers?.type
          }
      })
    }
    let final : GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: result
    }
    console.log(final);
    this.solverService.solve(final).subscribe((data: any) => {
      console.log(data)
      if (data === null) {
        return
      }
      let full_route: GeoJSON.Feature[] = [];
      for (let i = 0; i < data.trip.legs.length; i++) {
        let path = data.trip.legs[i].shape.replace(/\\\\/g, '\\');
        let route = this.render_route(path, 1e6);
        full_route.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route
          },
          properties: {}
        })
      }
      let json = {
        type: 'FeatureCollection',
        features: full_route
      }
      /*
      let path = data.trip.legs[0].shape.replace(/\\\\/g, '\\');
      let route = this.render_route(path, 1e6);
      console.log(route);
      let json = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route
          },
          properties: {}
        }]
      }
       */
      // @ts-ignore
      let geojson = L.geoJson(json,{ style: function(feature) {
          return {
            fillColor: feature?.properties.fill,
            color: '#9900CC',
            opacity: 0.75,
            weight: 7,
          };
        }
    });
      this.routeToRender = geojson;
      this.routeToRender.addTo(this.map);
    })
  }
}
