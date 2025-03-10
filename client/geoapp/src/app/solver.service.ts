import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {GeoJSON} from 'leaflet';

@Injectable({
  providedIn: 'root'
})

export class SolverService {

  constructor(private http: HttpClient) { }
  private getStandardOptions() : {headers: HttpHeaders} {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('There is an issue with the client or network ', error.error)
    } else {
      console.error(`Server side error ${error.error}`)
    }
    return throwError(() => new Error('Cannot retrieve token'))
  }

  public solve(data: GeoJSON.FeatureCollection) {
    return this.http.post('/api/v1/solve', data, this.getStandardOptions())
      //.pipe( catchError(this.handleError) );
  }
}

