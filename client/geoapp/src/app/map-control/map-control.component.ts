import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as feather from 'feather-icons';
import {MapControlService} from '../map-control.service';
import {States} from '../../shared/models/states';

@Component({
  selector: 'app-map-control',
  standalone: false,
  templateUrl: './map-control.component.html',
  styleUrl: './map-control.component.scss'
})


export class MapControlComponent implements OnInit, AfterViewInit {
  private state : States = States.idle;

  constructor(private mapControlService: MapControlService) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    feather.replace();
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
}
