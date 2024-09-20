import { EventEmitter, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { NgxGoogleMapsPlacesApiService } from 'ngx-google-maps-places-api';

import {
  NgxGoogleMapsPlacesAutocompleteDirective
} from './ngx-google-maps-places-autocomplete.directive';

describe('NgxGoogleMapsPlacesAutocompleteDirective', () => {
  let directive: NgxGoogleMapsPlacesAutocompleteDirective;
  let injector: Injector;
  let ngxGoogleMapsPlacesApiService: NgxGoogleMapsPlacesApiService;
  let matAutocompleteTrigger: MatAutocompleteTrigger;
  let control: AbstractControl;

  beforeEach(() => {
    injector = TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, MatAutocompleteModule ],
      providers: [
        NgControl,
        NgxGoogleMapsPlacesAutocompleteDirective,
        {
          provide: NgxGoogleMapsPlacesApiService,
          useValue: {
            fetchSuggestions: jest.fn(),
            applyBoldToMatches: jest.fn(),
            fetchPlaceDetails: jest.fn(),
            parseAddressComponents: jest.fn()
          }
        },
        {
          provide: MatAutocompleteTrigger,
          useValue: {
            autocomplete: {
              displayWith: null
            },
            optionSelections: new EventEmitter()
          }
        }
      ]
    }).inject(Injector);

    directive = TestBed.inject(NgxGoogleMapsPlacesAutocompleteDirective);
    ngxGoogleMapsPlacesApiService = TestBed.inject(NgxGoogleMapsPlacesApiService);
    matAutocompleteTrigger = TestBed.inject(MatAutocompleteTrigger);
    control = new FormControl();
    // @ts-expect-error Cannot assign because it is a read-only property.
    directive['_control'] = control;
    // @ts-expect-error Cannot assign because it is a read-only property.
    directive['_injector'] = injector;
    // @ts-expect-error Cannot assign because it is a read-only property.
    directive['_matAutocompleteTrigger'] = matAutocompleteTrigger;
  });

  it('should set up valueChanges subscription in ngAfterViewInit', (done) => {
    const fetchSuggestionsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchSuggestions').mockReturnValue(of([ ]));
    const optionsLoadSpy = jest.spyOn(directive.optionsLoad, 'emit');

    directive.ngAfterViewInit();
    control.setValue('test');

    setTimeout(() => {
      expect(fetchSuggestionsSpy).toHaveBeenCalledWith('test');
      expect(optionsLoadSpy).toHaveBeenCalled();
      done();
    }, 2000);
  });

  it('should set displayWith function if not already set', () => {
    directive.ngAfterViewInit();

    expect(matAutocompleteTrigger.autocomplete.displayWith).toBe(directive.displayFn);
  });

  it('should not set displayWith function if already set', () => {
    const customDisplayFn = () => '';
    matAutocompleteTrigger.autocomplete.displayWith = customDisplayFn;

    directive.ngAfterViewInit();

    expect(matAutocompleteTrigger.autocomplete.displayWith).toBe(customDisplayFn);
  });

  it('should set up optionSelections subscription when shouldLoadPlaceDetails is true', () => {
    jest.spyOn(directive, 'shouldLoadPlaceDetails').mockReturnValue(true);
    const fetchPlaceDetailsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchPlaceDetails').mockReturnValue(of({ } as any));
    const placeDetailsLoadSpy = jest.spyOn(directive.placeDetailsLoad, 'emit');

    directive.ngAfterViewInit();
    (matAutocompleteTrigger.optionSelections as any).emit({ isUserInput: true, source: { value: { prediction: {} } } });

    expect(fetchPlaceDetailsSpy).toHaveBeenCalled();
    expect(placeDetailsLoadSpy).toHaveBeenCalled();
  });

  it('should not set up optionSelections subscription when shouldLoadPlaceDetails is false', () => {
    jest.spyOn(directive, 'shouldLoadPlaceDetails').mockReturnValue(false);
    const fetchPlaceDetailsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchPlaceDetails');

    directive.ngAfterViewInit();
    (matAutocompleteTrigger.optionSelections as any).emit({ isUserInput: true, source: { value: { prediction: {} } } });

    expect(fetchPlaceDetailsSpy).not.toHaveBeenCalled();
  });

  it('should filter out non-string values in valueChanges', () => {
    const fetchSuggestionsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchSuggestions').mockReturnValue(of([]));

    directive.ngAfterViewInit();
    control.setValue(123);

    expect(fetchSuggestionsSpy).not.toHaveBeenCalled();
  });

  it('should return empty string when suggestion is null', () => {
    expect(directive.displayFn(null as any)).toBe('');
  });

  it('should return empty string when suggestion.prediction is null', () => {
    const suggestion = { prediction: null };
    expect(directive.displayFn(suggestion as any)).toBe('');
  });

  it('should return empty string when suggestion.prediction.text is null', () => {
    const suggestion = { prediction: { text: null } };
    expect(directive.displayFn(suggestion as any)).toBe('');
  });

  it('should return empty string when suggestion.prediction.text.text is null', () => {
    const suggestion = { prediction: { text: { text: null } } };
    expect(directive.displayFn(suggestion as any)).toBe('');
  });

  it('should return the text when all properties are defined', () => {
    const suggestion = { prediction: { text: { text: 'Test Location' } } };
    expect(directive.displayFn(suggestion as any)).toBe('Test Location');
  });

  it('should handle undefined suggestion', () => {
    expect(directive.displayFn(undefined as any)).toBe('');
  });
});
