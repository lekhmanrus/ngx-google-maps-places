import { NgModule } from '@angular/core';

import {
  NgxGoogleMapsPlacesAutocompleteDirective
} from './ngx-google-maps-places-autocomplete.directive';

const NGX_GOOGLE_MAPS_PLACES_AUTOCOMPLETE_DECLARATIONS = [
  NgxGoogleMapsPlacesAutocompleteDirective
];

@NgModule({
  imports: [ NGX_GOOGLE_MAPS_PLACES_AUTOCOMPLETE_DECLARATIONS ],
  exports: [ NGX_GOOGLE_MAPS_PLACES_AUTOCOMPLETE_DECLARATIONS ]
})
export class NgxGoogleMapsPlacesAutocompleteModule { }
