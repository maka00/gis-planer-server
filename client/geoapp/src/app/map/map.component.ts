import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet'
import {Location, LocationType} from '../../shared/models/Location';
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

@Component({
  selector: 'app-map',
  standalone: false,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private destinationMarkers: L.Marker[] = [];

  constructor(private mapControlService: MapControlService) {
  }

  ngOnInit(): void {
    this.mapControlService.getSubject().subscribe((value) => {
      console.log(value)
      if (value === "setClear") {
        this.destinationMarkers.forEach(marker => {
          this.map.removeLayer(marker)
        })
        this.destinationMarkers = []
      } else if (value === "setPoint") {
        this.map.on('click', (event: L.LeafletMouseEvent) => {
          console.log(event)
          let lt: LocationType = LocationType.destination;
          let loc = new Location("1", lt, event.latlng.lat, event.latlng.lng)
          let marker = L.marker(event.latlng)
          marker.addTo(this.map)
          this.destinationMarkers.push(marker)
        })
      } else if (value === "idle") {
        this.map.off('click')
      }
    })
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
}
