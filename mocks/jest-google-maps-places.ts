import { createSpyFromClass, Spy } from 'jest-auto-spies';

// --- TypeScript global declarations for google types and window.google ---
// These interfaces are intentionally empty and used for test mocks only.

declare global {
  interface Window {
    google: unknown;
  }
}

// Dummy classes to satisfy createSpyFromClass signature and index signature
class DummyPlace implements Record<string, unknown> { [key: string]: unknown; }
class DummyPlacePrediction implements Record<string, unknown> { [key: string]: unknown; }
class DummyAutocompleteSuggestion implements Record<string, unknown> { [key: string]: unknown; }

export const initialize = () => {
  const mockPlace = createSpyFromClass(DummyPlace) as unknown as Spy<google.maps.places.Place>;
  // Use 'as unknown' for test mock property assignment
  (mockPlace as { fetchFields: unknown }).fetchFields
    = jest.fn().mockResolvedValue({ place: { displayName: 'Test Place' } });
  const mockPlacePrediction = createSpyFromClass(DummyPlacePrediction) as unknown as
    Spy<google.maps.places.PlacePrediction>;
  (mockPlacePrediction as { toPlace: unknown }).toPlace
    = jest.fn().mockReturnValue(mockPlace);
  const mockAutocompleteSuggestion = createSpyFromClass(DummyAutocompleteSuggestion) as unknown as
    Spy<google.maps.places.AutocompleteSuggestion>;
  (mockAutocompleteSuggestion as { placePrediction: unknown }).placePrediction
    = mockPlacePrediction;

  // Patch only the needed mocks, spread the real google.maps.places if available
  (window as Window).google = {
    maps: {
      places: {
        ...(
          window.google && (window.google as { maps?: { places?: object } }).maps?.places
            ? (window.google as { maps: { places: object } }).maps.places
            : { }
        ),
        AutocompleteSessionToken: jest.fn().mockResolvedValue({ })
      },
      importLibrary: jest.fn().mockResolvedValue(Promise.resolve({
        AutocompleteSuggestion: mockAutocompleteSuggestion
      }))
    }
  };
};
