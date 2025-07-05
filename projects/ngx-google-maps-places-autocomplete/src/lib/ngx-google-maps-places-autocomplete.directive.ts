import { AfterViewInit, Directive, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NgxGoogleMapsPlacesApiService } from 'ngx-google-maps-places-api';
import { debounce, distinctUntilChanged, filter, map, merge, switchMap, tap, timer } from 'rxjs';

import {
  NgxGoogleMapsPlacesAutocompletePlaceDetails
} from './ngx-google-maps-places-autocomplete-place-details.interface';
import {
  NgxGoogleMapsPlacesAutocompleteSuggestion
} from './ngx-google-maps-places-autocomplete-suggestion.interface';

/**
 * Directive that provides Google Maps Places Autocomplete functionality for input fields.
 * It fetches suggestions from the Google Maps Places API and displays them in a Material
 * Autocomplete dropdown.
 * It also provides the ability to fetch detailed place information for the selected suggestion.
 */
@Directive({
  selector: `
    input[matAutocomplete][ngxGoogleMapsPlacesAutocomplete],
    textarea[matAutocomplete][ngxGoogleMapsPlacesAutocomplete]
  `,
  standalone: true,
  host: {
    '(input)': '_handleInput($event)',
  },
  exportAs: 'ngxGoogleMapsPlacesAutocomplete'
})
export class NgxGoogleMapsPlacesAutocompleteDirective implements AfterViewInit {
  /** Determines whether place details should be loaded for the selected autocomplete suggestion. */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly shouldLoadPlaceDetails$ = input(true, { alias: 'shouldLoadPlaceDetails' });
  /** List of fields to be fetched at place details request. */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly fetchFields$ = input<string[] | undefined>(undefined, { alias: 'fetchFields' });
  /**
   * An input property that specifies the options for the Google Maps Places Autocomplete request.
   * This property allows the user to customize the autocomplete request, such as setting the
   * location bias, types of places to return, or other parameters.
   * If this property is not set, the default autocomplete request options will be used.
   * @see https://developers.google.com/maps/documentation/javascript/reference/autocomplete-data#AutocompleteRequest
   */
  public readonly placesAutocompleteRequest$
    = input<Omit<google.maps.places.AutocompleteRequest, 'input'> | undefined>(undefined, {
      // eslint-disable-next-line @angular-eslint/no-input-rename
      alias: 'placesAutocompleteRequest'
    });
  /**
   * An input property that specifies the debounce time (in milliseconds) for the input event
   * that triggers the autocomplete suggestions. If this property is not set, the default
   * debounce time of 725 milliseconds will be used.
   */
  public readonly placesAutocompleteDebounceTime$ = input<number | null>(725, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: 'placesAutocompleteDebounceTime'
  });
  /**
   * An event that is emitted when the options for the autocomplete suggestions have been loaded.
   */
  public readonly optionsLoad$
    // eslint-disable-next-line @angular-eslint/no-output-rename
    = output<NgxGoogleMapsPlacesAutocompleteSuggestion[]>({ alias: 'optionsLoad' });
  /**
   * An event that is emitted when the place details for the selected autocomplete suggestion have
   * been loaded.
   * The emitted value is the place details object, or `null` if the place details could
   * not be loaded.
   */
  public readonly placeDetailsLoad$
    // eslint-disable-next-line @angular-eslint/no-output-rename
    = output<NgxGoogleMapsPlacesAutocompletePlaceDetails | null>({ alias: 'placeDetailsLoad' });
  /**
   * An observable signal that holds the current list of autocomplete suggestions.
   * The suggestions are of type `NgxGoogleMapsPlacesAutocompleteSuggestion[]`.
   */
  public readonly options$ = signal<NgxGoogleMapsPlacesAutocompleteSuggestion[]>([ ]);
  /**
   * An observable signal that holds the current place details for the selected autocomplete
   * suggestion.
   * The place details are of type `NgxGoogleMapsPlacesAutocompletePlaceDetails` or `null` if
   * the place details could not be loaded.
   */
  public readonly placeDetails$ = signal<NgxGoogleMapsPlacesAutocompletePlaceDetails | null>(null);
  /**
   * This service is used to fetch autocomplete suggestions and place details from the Google Maps
   * Places API.
   */
  private readonly _ngxGoogleMapsPlacesApiService = inject(NgxGoogleMapsPlacesApiService);
  /**
   * The MatAutocompleteTrigger instance provides access to the autocomplete functionality
   * associated with the input element that this directive is applied to.
   */
  private readonly _matAutocompleteTrigger = inject(MatAutocompleteTrigger);
  /**
   * A private readonly Subject that emits keyboard events for the input element associated with
   * this directive.
   */
  private readonly _input$ = signal<KeyboardEvent | null>(null);

  constructor() {
    merge(
      toObservable(this._input$)
        .pipe(
          debounce(() => timer(this.placesAutocompleteDebounceTime$() ?? 725)),
          distinctUntilChanged()
        ),
      toObservable(this.placesAutocompleteRequest$).pipe(map(() => this._input$()))
    )
      .pipe(
        filter((event) => event !== null),
        tap((event) => this._matAutocompleteTrigger._handleInput(event)),
        map((event) => event.target as HTMLInputElement),
        filter(Boolean),
        map((target) => target.value),
        tap((value) => {
          if (!value) {
            this.options$.set([ ]);
          }
        }),
        filter((value) => typeof value === 'string' && Boolean(value)),
        // tap((value) => console.log('valueChanges', value)),
        switchMap((value) => this._ngxGoogleMapsPlacesApiService.fetchSuggestions(
          this.placesAutocompleteRequest$()
          ? { ...this.placesAutocompleteRequest$(), input: value }
          : value
        )),
        map((suggestions: google.maps.places.AutocompleteSuggestion[]) => suggestions
          .filter((suggestion) => Boolean(suggestion?.placePrediction))
          .map(({ placePrediction }) => ({
            prediction: placePrediction!,
            formattedMainHtml: this._ngxGoogleMapsPlacesApiService
              .applyBoldToMatches(placePrediction!.mainText),
            formattedSecondaryHtml: this._ngxGoogleMapsPlacesApiService
              .applyBoldToMatches(placePrediction!.secondaryText),
            formattedHtml: this._ngxGoogleMapsPlacesApiService
              .applyBoldToMatches(placePrediction!.text)
          } as NgxGoogleMapsPlacesAutocompleteSuggestion))),
        // tap((predictions) => console.log('predictions', predictions)),
        tap((predictions) => this.options$.set(predictions)),
        tap((predictions) => this.optionsLoad$.emit(predictions)),
        takeUntilDestroyed()
      )
      .subscribe();
    this._matAutocompleteTrigger.optionSelections
      .pipe(
        filter(({ isUserInput }) => isUserInput && this.shouldLoadPlaceDetails$()),
        // tap((value) => console.log('this._matAutocompleteTrigger.optionSelections', value)),
        map((value) => value.source.value as NgxGoogleMapsPlacesAutocompleteSuggestion),
        filter(Boolean),
        switchMap((suggestion) => this._ngxGoogleMapsPlacesApiService
          .fetchPlaceDetails(suggestion.prediction, this.fetchFields$())),
        map((placeDetails) => ({
          place: placeDetails,
          address: this._ngxGoogleMapsPlacesApiService.parseAddressComponents(placeDetails)
        } as NgxGoogleMapsPlacesAutocompletePlaceDetails)),
        // tap((placeDetails) => console.log('placeDetails', placeDetails)),
        tap((placeDetails) => this.placeDetails$.set(placeDetails)),
        tap((predictions) => this.placeDetailsLoad$.emit(predictions)),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  /**
   * Sets the display function for the autocomplete suggestions.
   * This function is called by the Material Autocomplete component to display the text of each
   * suggestion.
   */
  public ngAfterViewInit(): void {
    if (!this._matAutocompleteTrigger.autocomplete.displayWith) {
      this._matAutocompleteTrigger.autocomplete.displayWith = this.displayFn;
    }
  }

  /**
   * Displays the text of a Google Maps Places Autocomplete suggestion.
   * @param suggestion The Google Maps Places Autocomplete suggestion to display.
   * @returns The text of the suggestion, or an empty string if the suggestion is null or does not
   * have a text property.
   */
  public displayFn(suggestion: NgxGoogleMapsPlacesAutocompleteSuggestion): string {
    return suggestion?.prediction?.text?.text || '';
  }

  /**
   * Handles the input event on the input element.
   * @param event The keyboard event that triggered the input.
   */
  private _handleInput(event: KeyboardEvent): void {
    this._input$.set(event);
  }
}
