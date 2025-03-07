export enum LocationType {
  "destination",
  "origin"
}

export class Location{
  constructor(public id: string, public postype: LocationType, public lat: number, public lng: number) {
  }
}
