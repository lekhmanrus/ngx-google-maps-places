import { createSpyFromClass, Spy } from 'jest-auto-spies';

export const initialize = () => {
  const mockPlace = createSpyFromClass(Object as any) as Spy<google.maps.places.Place>;
  mockPlace.fetchFields = jest.fn().mockResolvedValue({ place: { displayName: 'Test Place' } }) as any;
  const mockPlacePrediction = createSpyFromClass(Object as any) as
    Spy<google.maps.places.PlacePrediction>;
  mockPlacePrediction.toPlace = jest.fn().mockReturnValue(mockPlace) as any;
  const mockAutocompleteSuggestion = createSpyFromClass(Object as any) as
    Spy<google.maps.places.AutocompleteSuggestion>;
  mockAutocompleteSuggestion.placePrediction = mockPlacePrediction;

  (window as any).google = {
    maps: {
      places: {
        AutocompleteSessionToken: jest.fn().mockResolvedValue({ })
      },
      importLibrary: jest.fn().mockResolvedValue(Promise.resolve({
        AutocompleteSuggestion: mockAutocompleteSuggestion as any
      } as google.maps.PlacesLibrary))
    }
  };
};
