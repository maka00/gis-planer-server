import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {MapControlService} from '../map-control.service';
import {States} from '../../shared/models/states';
import {DestinationMarker, OriginMarker} from '../map/map.render.utils';

@Component({
  selector: 'app-map-control',
  standalone: false,
  templateUrl: './map-control.component.html',
  styleUrl: './map-control.component.scss'
})


export class MapControlComponent implements OnInit, AfterViewInit {
  public state : States = States.idle;
  @Input() destinationMarkers: DestinationMarker[] = [];
  @Input() originMarker: OriginMarker | null = null;
  public selectedMarker: DestinationMarker | null = null;

  constructor(private mapControlService: MapControlService) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
  }

  startRoute() {
    console.log("Start Route")
    this.mapControlService.updateSubject(States.startRoute);

  }

  setPoint() {
    console.log("Set Point")
    if (this.state !== States.setPoint) {
      this.mapControlService.updateSubject(States.idle);
      this.mapControlService.updateSubject(States.setPoint);
      this.state = States.setPoint;
    } else {
      this.mapControlService.updateSubject(States.idle);
      this.state = States.idle;
    }
  }

  setVehicle() {
    console.log("Set Vehicle")
    if (this.state !== States.setVehicle) {
      this.mapControlService.updateSubject(States.idle);
      this.mapControlService.updateSubject(States.setVehicle);
      this.state = States.setVehicle;
    } else {
      this.mapControlService.updateSubject(States.idle);
      this.state = States.idle;
    }
  }

  setClear() {
    console.log("Set Clear")
    this.mapControlService.updateSubject(States.idle);
    this.mapControlService.updateSubject(States.setClear);
    this.state = States.idle;
  }

  setAbort() {
    console.log("Set Abort")
    this.mapControlService.updateSubject(States.setAbort);
  }

  highlightMarker(marker: DestinationMarker) {
    if (marker.options.color === 'red') {
      marker.setStyle({ color: 'blue' });
      this.selectedMarker = null;
    } else {
      this.destinationMarkers.forEach(m => {
        m.setStyle({color: 'blue'}); // Reset color of all markers
      });
      marker.setStyle({color: 'red'}); // Highlight the clicked marker
      this.selectedMarker = marker;
    }
  }

  canStartRoute(): boolean {
    return this.destinationMarkers.length > 0 && this.originMarker !== null;
  }

  protected readonly States = States;
}
