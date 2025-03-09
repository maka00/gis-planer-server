import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { States } from '../shared/models/states'
@Injectable({
  providedIn: 'root'
})
export class MapControlService {

  private controlSubject = new Subject<States>();
  constructor() { }

  getSubject(): Observable<States> {
    return this.controlSubject.asObservable();
  }

  updateSubject(value: States) {
    this.controlSubject.next(value);
  }
}
