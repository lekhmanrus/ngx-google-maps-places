import { TestBed } from '@angular/core/testing';
import { Spy, createSpyFromClass } from 'jest-auto-spies';

import { initialize } from '../../../../mocks/jest-google-maps-places';
import { NgxGoogleMapsPlacesApiService } from './ngx-google-maps-places-api.service';

describe('NgxGoogleMapsPlacesApiService', () => {
  let service: NgxGoogleMapsPlacesApiService;
  let mockPlace: Spy<google.maps.places.Place>;
  let mockPlacePrediction: Spy<google.maps.places.PlacePrediction>;
  let mockAutocompleteSuggestion: Spy<google.maps.places.AutocompleteSuggestion>;

  beforeEach(() => {
    initialize();

    TestBed.configureTestingModule({
      providers: [ NgxGoogleMapsPlacesApiService ]
    });
    service = TestBed.inject(NgxGoogleMapsPlacesApiService);

    // mockAutocompleteSuggestion = createSpyFromClass(google.maps.places.AutocompleteSuggestion);
    // mockPlacePrediction = createSpyFromClass(google.maps.places.PlacePrediction);

    mockPlace = createSpyFromClass(Object as any) as Spy<google.maps.places.Place>;
    mockPlace.fetchFields = jest.fn().mockResolvedValue({
      place: { displayName: 'Test Place' }
    }) as any;
    mockPlacePrediction = createSpyFromClass(Object as any) as
      Spy<google.maps.places.PlacePrediction>;
    mockPlacePrediction.toPlace = jest.fn().mockReturnValue(mockPlace) as any;

    mockAutocompleteSuggestion = createSpyFromClass(Object as any) as
      Spy<google.maps.places.AutocompleteSuggestion>;
    mockAutocompleteSuggestion.placePrediction = mockPlacePrediction;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchPlaceDetails', () => {
    it('should return null when suggestionOrPrediction is null', (done) => {
      service.fetchPlaceDetails(null as any).subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });

    it('should call toPlace and fetchFields for AutocompleteSuggestion', (done) => {
      service.fetchPlaceDetails(mockAutocompleteSuggestion).subscribe(() => {
        expect(mockAutocompleteSuggestion.placePrediction?.toPlace).toHaveBeenCalled();
        expect(mockPlace.fetchFields).toHaveBeenCalledWith({ fields: ['addressComponents'] });
        done();
      });
    });

    it('should call toPlace and fetchFields for PlacePrediction', (done) => {
      service.fetchPlaceDetails(mockPlacePrediction).subscribe(() => {
        expect(mockPlacePrediction.toPlace).toHaveBeenCalled();
        expect(mockPlacePrediction.toPlace().fetchFields)
          .toHaveBeenCalledWith({ fields: [ 'addressComponents' ] });
        done();
      });
    });

    it('should call refreshToken after fetching place details', (done) => {
      jest.spyOn(service, 'refreshToken');
      service.fetchPlaceDetails(mockPlacePrediction).subscribe(() => {
        expect(service.refreshToken).toHaveBeenCalled();
        done();
      });
    });

    it('should return the place from the fetched fields', (done) => {
      const mockPlace: google.maps.places.Place = { displayName: 'Test Place' } as any;
      mockPlacePrediction.toPlace = jest.fn().mockReturnValue({
        fetchFields: jest.fn().mockResolvedValue({ place: mockPlace })
      }) as any;

      service.fetchPlaceDetails(mockPlacePrediction).subscribe((result) => {
        expect(result).toEqual(mockPlace);
        done();
      });
    });

    it('should use custom fields when provided', (done) => {
      const customFields = [ 'addressComponents', 'googleMapsURI' ];
      service.fetchPlaceDetails(mockPlacePrediction, customFields).subscribe(() => {
        expect(mockPlacePrediction.toPlace().fetchFields)
          .toHaveBeenCalledWith({ fields: customFields });
        done();
      });
    });
  });
});
