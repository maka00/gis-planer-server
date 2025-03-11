import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet'
import {LocationType} from '../../shared/models/location';
import {MapControlService} from '../map-control.service';
import {States} from '../../shared/models/states';
import {SolverService} from '../solver.service';
import {GeoJSON} from 'leaflet';
import {MapRenderUtils, OriginMarker, DestinationMarker} from './map.render.utils';

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  public destinationMarkers: DestinationMarker[] = [];
  public originMarkers: OriginMarker | null = null;
  private markerID = 0;
  private routeToRender!: GeoJSON | null;
  public static opacity = 0.95;

  constructor(private mapControlService: MapControlService, private solverService: SolverService) {
  }

  ngOnInit(): void {
    this.mapControlService.getSubject().subscribe((value) => {
      this.changeState(value);
    })
  }

  private changeState(value: States) {
    switch (value) {
      case States.startRoute:
        this.clearRoute()
        this.getGeoJson()
        console.log("Start Route")
        break;
      case States.setPoint:
        this.map.on('click', (event: L.LeafletMouseEvent) => {
          this.markerID += 1
          let marker = new DestinationMarker(event.latlng, {
            radius: 10,
            id: 'marker-' + this.markerID.toString(),
            type: LocationType.destination
          })
          marker.addTo(this.map)
          this.destinationMarkers.push(marker)
        })
        console.log("Set Point")
        L.DomUtil.addClass(this.map.getContainer(), 'crosshair-cursor-enabled');
        break;
      case States.setVehicle:
        console.log("Set Vehicle")
        this.map.on('click', (event: L.LeafletMouseEvent) => {
          this.markerID += 1
          let marker = new OriginMarker(event.latlng, {
            draggable: true,
            id: 'origin-' + this.markerID.toString(),
            type: LocationType.origin
          })
          marker.addTo(this.map)
          this.originMarkers = marker;
        })
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
        this.clearRoute();
        this.markerID = 0;
        MapComponent.opacity = 0.95;
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

  private clearRoute() {
    if (this.routeToRender) {
      this.map.removeLayer(this.routeToRender)
    }
    this.routeToRender = null;
    MapComponent.opacity = 0.95;
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
  }

  private getGeoJson(): void {

    let result: GeoJSON.Feature[] = [];
    for (const marker of this.destinationMarkers) {
      const latLng = marker.getLatLng();
      result.push({
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
    let final: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: result
    }
    this.solverService.solve(final).subscribe((data: any) => {
      if (data === null) {
        return;
      }
      console.log(data);
      this.sortMarkers(data.plan);
      let json = this.createGeoJsonFeature(data.route);
      this.routeToRender = this.createGeoJsonLayer(json);
      this.routeToRender.addTo(this.map);
    });

  }
  private sortMarkers(order: number[]) {
    let sortedMarkers: DestinationMarker[] = [];
    for (let i = 1; i < order.length; i++) {
      sortedMarkers.push(this.destinationMarkers[order[i]]);
    }
    this.destinationMarkers = sortedMarkers
  }
  private createGeoJsonFeature(data: any): GeoJSON.FeatureCollection {
    let full_route: GeoJSON.Feature[] = [];
    for (let i = 0; i < data.trip.legs.length; i++) {
      let path = data.trip.legs[i].shape.replace(/\\\\/g, '\\');
      let route = MapRenderUtils.render_route(path, 1e6);
      full_route.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route
        },
        properties: {}
      });
    }
    return {
      type: 'FeatureCollection',
      features: full_route
    };
  }

  private createGeoJsonLayer(json: GeoJSON.FeatureCollection): L.GeoJSON {
    return L.geoJson(json, {
      style: function (feature) {
        MapComponent.opacity *= 0.8;
        return {
          fillColor: feature?.properties.fill,
          color: '#9900CC',
          opacity: MapComponent.opacity,
          weight: 7,
        };
      }
    });
  }
}
