import {
  AfterViewInit,
  Directive,
  EnvironmentInjector,
  inject,
  input,
  output,
  runInInjectionContext,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { NgxGoogleMapsPlacesApiService } from 'ngx-google-maps-places-api';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';

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
  exportAs: 'ngxGoogleMapsPlacesAutocomplete'
})
export class NgxGoogleMapsPlacesAutocompleteDirective implements AfterViewInit {
  /** Determines whether place details should be loaded for the selected autocomplete suggestion. */
  public readonly shouldLoadPlaceDetails = input(true);
  /** List of fields to be fetched at place details request. */
  public readonly fetchFields = input<string[] | undefined>(undefined);
  /**
   * An event that is emitted when the options for the autocomplete suggestions have been loaded.
   */
  public readonly optionsLoad = output<NgxGoogleMapsPlacesAutocompleteSuggestion[]>();
  /**
   * An event that is emitted when the place details for the selected autocomplete suggestion have
   * been loaded.
   * The emitted value is the place details object, or `null` if the place details could
   * not be loaded.
   */
  public readonly placeDetailsLoad = output<NgxGoogleMapsPlacesAutocompletePlaceDetails | null>();
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
   * A private readonly reference to the NgControl instance that is injected into this directive.
   * The NgControl instance provides access to the form control associated with the input element
   * that this directive is applied to.
   */
  private readonly _control = inject(NgControl);
  /**
   * The MatAutocompleteTrigger instance provides access to the autocomplete functionality
   * associated with the input element that this directive is applied to.
   */
  private readonly _matAutocompleteTrigger = inject(MatAutocompleteTrigger);
  /**
   * The EnvironmentInjector instance provides access to the dependency injection environment for
   * this directive.
   */
  private readonly _injector = inject(EnvironmentInjector);

  /**
   * This method is called after the directive's view has been initialized. It sets up the
   * autocomplete functionality for the input element that this directive is applied to.
   * It subscribes to the `valueChanges` observable of the form control associated with the input
   * element, and uses the `NgxGoogleMapsPlacesApiService` to fetch autocomplete suggestions based on
   * the input value. The fetched suggestions are then emitted through the `optionsLoad` event
   * and stored in the `options$` observable signal.
   * If the `shouldLoadPlaceDetails` flag is set to `true`, the method also sets up a subscription
   * to the `optionSelections` observable of the `MatAutocompleteTrigger` instance. When a user
   * selects an autocomplete suggestion, the method uses the `NgxGoogleMapsPlacesApiService` to fetch
   * the place details for the selected suggestion, and emits the place details through
   * the `placeDetailsLoad` event and stores them in the `placeDetails$` observable signal.
   * The method also sets the `displayWith` function of the `MatAutocompleteTrigger` instance to
   * the `displayFn` method of this directive, which is used to format the display of the
   * autocomplete suggestions.
   */
  public ngAfterViewInit(): void {
    runInInjectionContext(this._injector, () => {
      if (this._control.valueChanges) {
        this._control.valueChanges
          .pipe(
            debounceTime(725),
            distinctUntilChanged(),
            filter((value) => typeof value === 'string'),
            // tap((value) => console.log('valueChanges', value)),
            switchMap((value) => this._ngxGoogleMapsPlacesApiService.fetchSuggestions(value)),
            map((suggestions) => suggestions
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
            tap((predictions) => this.optionsLoad.emit(predictions)),
            takeUntilDestroyed()
          )
          .subscribe();
      }
    });
    if (!this._matAutocompleteTrigger.autocomplete.displayWith) {
      this._matAutocompleteTrigger.autocomplete.displayWith = this.displayFn;
      // console.log('set autocomplete displayWith: ', this.displayFn);
    }
    if (this.shouldLoadPlaceDetails()) {
      runInInjectionContext(this._injector, () => {
        this._matAutocompleteTrigger.optionSelections
          .pipe(
            filter(({ isUserInput }) => isUserInput),
            // tap((value) => console.log('this._matAutocompleteTrigger.optionSelections', value)),
            map((value) => value.source.value as NgxGoogleMapsPlacesAutocompleteSuggestion),
            filter(Boolean),
            switchMap((suggestion) => this._ngxGoogleMapsPlacesApiService
              .fetchPlaceDetails(suggestion.prediction, this.fetchFields())),
            map((placeDetails) => ({
              place: placeDetails,
              address: this._ngxGoogleMapsPlacesApiService.parseAddressComponents(placeDetails)
            } as NgxGoogleMapsPlacesAutocompletePlaceDetails)),
            // tap((placeDetails) => console.log('placeDetails', placeDetails)),
            tap((placeDetails) => this.placeDetails$.set(placeDetails)),
            tap((predictions) => this.placeDetailsLoad.emit(predictions)),
            takeUntilDestroyed()
          )
          .subscribe();
      });
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
}
