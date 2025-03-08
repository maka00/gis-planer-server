import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet'
import {LocationType} from '../../shared/models/Location';
import {MapControlService} from '../map-control.service';

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
class CustomMarker extends L.Marker{
  public id: string = '';
  public type: LocationType = LocationType.destination;
  constructor(latLng: L.LatLngExpression, options?: CustomMarkerOptions) {
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
  private destinationMarkers: L.Marker[] = [];
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
          let marker = new CustomMarker(event.latlng, {draggable: true, id: 'marker-' + this.markerID.toString(), type: LocationType.destination})
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
          let marker = new CustomMarker(event.latlng, {draggable: true, id: 'origin-' + this.markerID.toString(), type: LocationType.origin})
          marker.addTo(this.map)
          this.destinationMarkers.push(marker)
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
    const features = this.destinationMarkers.map(marker  => {
      const latLng = marker.getLatLng();
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [latLng.lng, latLng.lat]
        },
        properties: {
          id: (marker.options  as CustomMarker).id,
          type: (marker.options as CustomMarker).type
        }
      };
    });

    console.log(features);
  }
}
