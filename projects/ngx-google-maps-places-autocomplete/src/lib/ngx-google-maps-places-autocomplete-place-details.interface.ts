import { AddressModel } from 'ngx-google-maps-places-api';

/** Represents the details of a place returned from the Google Maps Places Autocomplete API. */
export declare interface NgxGoogleMapsPlacesAutocompletePlaceDetails {
  /** Represents the Google Maps Place object returned from the Places Autocomplete API. */
  place: google.maps.places.Place;
  /** Represents the address model parsed from the address components. */
  address: AddressModel | null;
};
