import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapControlService {

  private controlSubject = new Subject<string>();
  constructor() { }

  getSubject(): Observable<string> {
    return this.controlSubject.asObservable();
  }

  updateSubject(value: string) {
    this.controlSubject.next(value);
  }
}
