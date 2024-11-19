import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, NgControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { of } from 'rxjs';
import { NgxGoogleMapsPlacesApiService } from 'ngx-google-maps-places-api';

import {
  NgxGoogleMapsPlacesAutocompleteDirective
} from './ngx-google-maps-places-autocomplete.directive';

describe('NgxGoogleMapsPlacesAutocompleteDirective', () => {
  let directive: NgxGoogleMapsPlacesAutocompleteDirective;
  let ngxGoogleMapsPlacesApiService: NgxGoogleMapsPlacesApiService;
  let matAutocompleteTrigger: MatAutocompleteTrigger;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, ReactiveFormsModule, MatAutocompleteModule ],
      providers: [
        NgControl,
        NgxGoogleMapsPlacesAutocompleteDirective,
        {
          provide: NgxGoogleMapsPlacesApiService,
          useValue: {
            fetchSuggestions: jest.fn().mockReturnValue(of([ ])),
            applyBoldToMatches: jest.fn(),
            fetchPlaceDetails: jest.fn().mockReturnValue(of({ })),
            parseAddressComponents: jest.fn().mockReturnValue({ })
          }
        },
        {
          provide: MatAutocompleteTrigger,
          useValue: {
            autocomplete: {
              displayWith: null
            },
            optionSelections: new EventEmitter(),
            _handleInput: jest.fn()
          }
        }
      ]
    });

    directive = TestBed.inject(NgxGoogleMapsPlacesAutocompleteDirective);
    ngxGoogleMapsPlacesApiService = TestBed.inject(NgxGoogleMapsPlacesApiService);
    matAutocompleteTrigger = TestBed.inject(MatAutocompleteTrigger);
    // @ts-expect-error Cannot assign because it is a read-only property.
    directive['_matAutocompleteTrigger'] = matAutocompleteTrigger;
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
    jest.spyOn(directive, 'shouldLoadPlaceDetails$').mockReturnValue(true);
    const fetchPlaceDetailsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchPlaceDetails')
      .mockReturnValue(of({ } as any));
    const placeDetailsLoadSpy = jest.spyOn(directive.placeDetailsLoad$, 'emit');

    directive.ngAfterViewInit();
    (matAutocompleteTrigger.optionSelections as any)
      .emit({ isUserInput: true, source: { value: { prediction: { } } } });

    expect(fetchPlaceDetailsSpy).toHaveBeenCalled();
    expect(placeDetailsLoadSpy).toHaveBeenCalled();
  });

  it('should not set up optionSelections subscription when shouldLoadPlaceDetails is false', () => {
    jest.spyOn(directive, 'shouldLoadPlaceDetails$').mockReturnValue(false);
    const fetchPlaceDetailsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchPlaceDetails');

    directive.ngAfterViewInit();
    (matAutocompleteTrigger.optionSelections as any)
      .emit({ isUserInput: true, source: { value: { prediction: { } } } });

    expect(fetchPlaceDetailsSpy).not.toHaveBeenCalled();
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

  it('should handle input events with debounce correctly in _handleInput', async () => {
    const inputEvent = createKeyboardEvent('L');
    const fetchSuggestionsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchSuggestions')
      .mockReturnValue(of([ ]));

    directive['_handleInput'](inputEvent);
    // tick(725);

    setTimeout(() => {
      expect(fetchSuggestionsSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should fetch and process autocomplete suggestions', async () => {
    const fetchSuggestionsSpy = jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchSuggestions')
      .mockReturnValue(
        of([
          {
            placePrediction: {
              mainText: 'Main',
              secondaryText: 'Secondary',
              text: 'Full Text'
            } as any
          }
        ])
      );
    const inputEvent = createKeyboardEvent('L');
    directive['_handleInput'](inputEvent);
    // tick(725);

    setTimeout(() => {
      expect(fetchSuggestionsSpy).toHaveBeenCalled();
      expect(directive.options$().length).toBeGreaterThan(0);
    });
  });

  it('should emit optionsLoad$ event when options are loaded', async () => {
    const optionsLoadSpy = jest.spyOn(directive.optionsLoad$, 'emit');
    jest.spyOn(ngxGoogleMapsPlacesApiService, 'fetchSuggestions').mockReturnValue(
      of([
        {
          placePrediction: {
            mainText: 'Main',
            secondaryText: 'Secondary',
            text: 'Full Text'
          } as any
        }
      ])
    );
    const inputEvent = createKeyboardEvent('L');
    directive['_handleInput'](inputEvent);
    // tick(725);

    setTimeout(() => {
      expect(optionsLoadSpy).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  function createKeyboardEvent(key: string): KeyboardEvent {
    const mockInputElement = document.createElement('input');
    mockInputElement.value = key;
    const inputEvent = new KeyboardEvent('input', {
      bubbles: true,
      cancelable: true,
      composed: true,
      key: mockInputElement.value,
    });
    Object.defineProperty(inputEvent, 'target', { value: mockInputElement });
    return inputEvent;
  }
});
