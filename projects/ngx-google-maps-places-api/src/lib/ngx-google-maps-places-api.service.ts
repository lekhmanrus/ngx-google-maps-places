import { Injectable } from '@angular/core';
import { from, map, Observable, of, share, shareReplay, switchMap, tap } from 'rxjs';

import { AddressKey, AddressModel } from './ngx-google-maps-places.types';

/**
 * Service that provides functionality for interacting with new Google Maps Places API.
 */
@Injectable({
  providedIn: 'root'
})
export class NgxGoogleMapsPlacesApiService {
  /**
   * Lazily imports the Google Maps Places library and provides a shared observable for it.
   * This ensures the library is only loaded once and can be shared across the application.
   */
  private readonly _placesLibrary$ = from(
      google.maps.importLibrary('places') as Promise<google.maps.PlacesLibrary>
    )
    .pipe(
      tap(() => console.info('importLibrary')),
      shareReplay(1)
    );
  /**
   * Stores the current Google Maps Places autocomplete session token.
   * This token is used to associate autocomplete suggestions with a particular session.
   */
  private _token: google.maps.places.AutocompleteSessionToken | undefined;

  /**
   * Refreshes the Google Maps Places autocomplete session token.
   * The session token is used to associate autocomplete suggestions with a particular session.
   * This method creates a new session token and stores it in the `_token` property.
   *
   * @returns The new session token.
   */
  public refreshToken(): google.maps.places.AutocompleteSessionToken {
    this._token = new google.maps.places.AutocompleteSessionToken();
    return this._token;
  }

  /**
   * Fetches autocomplete suggestions from the Google Maps Places API based on the provided request
   * or input string.
   * @param requestOrInput The autocomplete request object or an input string to fetch
   * suggestions for.
   * @returns An observable that emits an array of autocomplete suggestions.
   */
  public fetchSuggestions(
    requestOrInput: google.maps.places.AutocompleteRequest | string
  ): Observable<google.maps.places.AutocompleteSuggestion[]> {
    const request = typeof requestOrInput === 'string' ? { input: requestOrInput } : requestOrInput;
    return this._placesLibrary$
      .pipe(
        switchMap((placesLibrary) => placesLibrary.AutocompleteSuggestion
          .fetchAutocompleteSuggestions({
            ...request,
            sessionToken: this._token || this.refreshToken()
          })
        ),
        map(({ suggestions }) => suggestions),
        share()
      );
  }

  /**
   * Fetches the details of a Google Maps place based on an autocomplete suggestion or
   * place prediction.
   * @param suggestionOrPrediction The autocomplete suggestion or place prediction to fetch
   * details for.
   * @param fields An optional array of fields to fetch for the place.
   * Defaults to `[ 'addressComponents' ]`.
   * @returns An observable that emits the fetched place details, or null if the place prediction
   * is invalid.
   */
  public fetchPlaceDetails(
    suggestionOrPrediction:
      google.maps.places.AutocompleteSuggestion | google.maps.places.PlacePrediction,
    fields = [ 'addressComponents' ]
  ): Observable<google.maps.places.Place | null> {
    const placePrediction = this._isAutocompleteSuggestion(suggestionOrPrediction)
      ? suggestionOrPrediction.placePrediction
      : suggestionOrPrediction
    if (!placePrediction) {
      return of(null);
    }
    return from(placePrediction.toPlace().fetchFields({ fields }))
      .pipe(
        tap(() => this.refreshToken()),
        map(({ place }) => place),
        share()
      );
  }

  /**
   * Parses the address components of a Google Maps place and returns an `AddressModel` object.
   * @param place The Google Maps place object to parse the address components from.
   * @returns An `AddressModel` object containing the parsed address components, or `null` if
   * the place is null or has no address components.
   */
  public parseAddressComponents(place: google.maps.places.Place | null): AddressModel | null {
    if (!place) {
      return null;
    }
    const addressComponents = place.addressComponents;
    if (!addressComponents?.length) {
      return null;
    }
    const addressComponentsMap: AddressModel<string[]> = {
      streetNumber: [ 'street_number'],
      postalCode: [ 'postal_code' ],
      street: [ 'street_address', 'route' ],
      region: [
        'administrative_area_level_1',
        'administrative_area_level_2',
        'administrative_area_level_3',
        'administrative_area_level_4',
        'administrative_area_level_5'
      ],
      city: [
        'locality',
        'sublocality',
        'sublocality_level_1',
        'sublocality_level_2',
        'sublocality_level_3',
        'sublocality_level_4'
      ],
      countryCode: [ 'country' ],
      country: [ 'country' ]
    };

    const addressModel: AddressModel = {
      streetNumber: '',
      postalCode: '',
      street: '',
      region: '',
      city: '',
      countryCode: '',
      country: ''
    };

    for (const addressComponent of addressComponents) {
      for (const mapKey in addressComponentsMap) {
        const key = mapKey as AddressKey;
        const addressComponentMap = addressComponentsMap[key];
        if (addressComponentMap.some((type) => addressComponent.types.includes(type))) {
          if (key === 'countryCode') {
            addressModel[key] = String(addressComponent.shortText);
          } else {
            addressModel[key] = String(addressComponent.longText);
          }
        }
      }
    }

    return addressModel;
  }

  /**
   * Applies bold formatting to the matched text within the provided `FormattableText`.
   * @param formattableText The `FormattableText` object containing the text and match information.
   * @returns The formatted text with the matched portions wrapped in `<b>` tags.
   */
  public applyBoldToMatches(formattableText: google.maps.places.FormattableText | null): string {
    if (!formattableText) {
      return '';
    }

    const { text, matches } = formattableText;
    const chunks: string[] = [ ];
    let lastIndex = 0;

    for (const match of matches) {
      const { startOffset, endOffset } = match;
      // Text before the current match
      chunks.push(text.slice(lastIndex, startOffset));
      // Matched text wrapped in <b> tag
      chunks.push(`<b>${text.slice(startOffset, endOffset)}</b>`);
      // Update lastIndex to the end of the current match
      lastIndex = endOffset;
    };

    // Any remaining text after the last match
    chunks.push(text.slice(lastIndex));

    return chunks.join('');
  }

  /**
   * Determines whether the provided `suggestionOrPrediction` object is an instance of
   * `google.maps.places.AutocompleteSuggestion`.
   * @param suggestionOrPrediction The object to check.
   * @returns `true` if the object is an `AutocompleteSuggestion`, `false` otherwise.
   */
  private _isAutocompleteSuggestion(
    suggestionOrPrediction: google.maps.places.AutocompleteSuggestion | google.maps.places.PlacePrediction
  ): suggestionOrPrediction is google.maps.places.AutocompleteSuggestion {
    return suggestionOrPrediction && Object.hasOwn(suggestionOrPrediction, 'placePrediction');
  }
}
