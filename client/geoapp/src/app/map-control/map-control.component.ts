import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as feather from 'feather-icons';
import {MapControlService} from '../map-control.service';

@Component({
  selector: 'app-map-control',
  standalone: false,
  templateUrl: './map-control.component.html',
  styleUrl: './map-control.component.scss'
})


export class MapControlComponent implements OnInit, AfterViewInit {
  private state = "idle";

  constructor(private mapControlService: MapControlService) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    feather.replace();
  }

  startRoute() {
    console.log("Start Route")
    this.mapControlService.updateSubject("startRoute");

  }

  setPoint() {
    console.log("Set Point")
    if (this.state !== "setPoint") {
      this.mapControlService.updateSubject("idle");
      this.mapControlService.updateSubject("setPoint");
      this.state = "setPoint";
    } else {
      this.mapControlService.updateSubject("idle");
      this.state = "idle";
    }
  }

  setVehicle() {
    console.log("Set Vehicle")
    if (this.state !== "setVehicle") {
      this.mapControlService.updateSubject("idle");
      this.mapControlService.updateSubject("setVehicle");
    } else {
      this.mapControlService.updateSubject("idle");
      this.state = "idle";
    }
  }

  setClear() {
    console.log("Set Clear")
    this.mapControlService.updateSubject("idle");
    this.mapControlService.updateSubject("setClear");
    this.state = "idle";
  }

  setAbort() {
    console.log("Set Abort")
    this.mapControlService.updateSubject("setAbort");
  }
}
