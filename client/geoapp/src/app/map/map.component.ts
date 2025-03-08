import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet'
import {LocationType} from '../../shared/models/Location';
import {MapControlService} from '../map-control.service';
import {CircleMarkerOptions} from 'leaflet';

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
  private state = "idle";
  constructor(private mapControlService: MapControlService) {
  }

  ngOnInit(): void {
    this.mapControlService.getSubject().subscribe((value) => {
      console.log(value)
      this.changeState(value);
    })
  }

  private changeState(value: string) {
    switch (value) {
      case "startRoute":
        this.getGeoJson()
        console.log("Start Route")
        break;
      case "setPoint":
        this.map.on('click', (event: L.LeafletMouseEvent) => {
          console.log(event)
          this.markerID += 1
          let marker = new DestinationMarker(event.latlng, {radius: 10, id: 'marker-' + this.markerID.toString(), type: LocationType.destination})
          marker.addTo(this.map)
          this.destinationMarkers.push(marker)
        })
        this.state = "setPoint";
        console.log("Set Point")
        L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
        break;
      case "setVehicle":
        console.log("Set Vehicle")
        this.map.on('click', (event: L.LeafletMouseEvent) => {
          console.log(event)
          this.markerID += 1
          let marker = new OriginMarker(event.latlng, {draggable: true, id: 'origin-' + this.markerID.toString(), type: LocationType.origin})
          marker.addTo(this.map)
          this.originMarkers = marker;
          //this.destinationMarkers.push(marker)
        })
        this.state = "setVehicle";
        console.log("Set Vehicle")
        L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
        break;
      case "setClear":
        this.destinationMarkers.forEach(marker => {
          this.map.removeLayer(marker)
        })
        this.destinationMarkers = []
        if (this.originMarkers) {
          this.map.removeLayer(this.originMarkers)
        }
        this.originMarkers = null
        this.markerID = 0;
        break;
      case "setAbort":
        console.log("Set Abort")
        break;
      case "idle":
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
    let result = [];
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
    result.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [this.originMarkers?.getLatLng().lng, this.originMarkers?.getLatLng().lat]
        },
        properties: {
          id: this.originMarkers?.id,
          type: this.originMarkers?.type
        }
    })
    console.log(result);
  }
}
