import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {provideHttpClient} from '@angular/common/http';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { MapControlComponent } from './map-control/map-control.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapControlComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
