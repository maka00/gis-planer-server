import * as L from 'leaflet';
import {LocationType} from '../../shared/models/location';
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
export class OriginMarker extends L.Marker{
  public id: string = '';
  public type: LocationType = LocationType.destination;
  constructor(latLng: L.LatLngExpression, options?: CustomMarkerOptions) {
    super(latLng, options);
    this.id = options?.id || '';
    this.type = options?.type || LocationType.destination;
  }
}
interface DestinationMarkerOptions extends L.CircleMarkerOptions {
  id: string;
  type: LocationType;
}
export class DestinationMarker extends L.CircleMarker {
  public id: string = '';
  public type: LocationType = LocationType.destination;
  constructor(latLng: L.LatLngExpression, options: DestinationMarkerOptions) {
    super(latLng, options);
    this.id = options?.id || '';
    this.type = options?.type || LocationType.destination;
  }
}


export class MapRenderUtils {
  // Valhalla gives us a polyline that is encoded in a way that is not standard
  // code taken from https://valhalla.github.io/demos/polyline/
  // description see https://valhalla.github.io/valhalla/decoding/
  static render_route(encoded_route: string, mul: number) {
    let inv : number = 1.0 / mul;
    let decoded : number[][] = [];
    let previous: number[] = [0, 0];
    let i: number = 0;
    //for each byte
    while (i < encoded_route.length) {
      //for each coord (lat, lon)
      let ll = [0, 0]
      for (let j = 0; j < 2; j++) {
        let shift = 0;
        let byte = 0x20;
        //keep decoding bytes until you have this coord
        while (byte >= 0x20) {
          byte = encoded_route.charCodeAt(i++) - 63;
          ll[j] |= (byte & 0x1f) << shift;
          shift += 5;
        }
        //add previous offset to get final value and remember for next one
        ll[j] = previous[j] + (ll[j] & 1 ? ~(ll[j] >> 1) : (ll[j] >> 1));
        previous[j] = ll[j];
      }
      //scale by precision and chop off long coords also flip the positions so
      //its the far more standard lon,lat instead of lat,lon
      decoded.push([ll[1] * inv, ll[0] * inv]);
    }
    //hand back the list of coordinates
    return decoded;
  };
}
