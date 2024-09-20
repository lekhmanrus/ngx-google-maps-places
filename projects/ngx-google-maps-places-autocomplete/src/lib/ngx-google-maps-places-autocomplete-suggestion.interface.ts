/** Represents a suggestion for an autocomplete search in the Google Maps Places API. */
export declare interface NgxGoogleMapsPlacesAutocompleteSuggestion {
  /** Represents a prediction from the Google Maps Places API for an autocomplete search. */
  prediction: google.maps.places.PlacePrediction;
  /** Represents the formatted HTML for the main part of the autocomplete suggestion. */
  formattedMainHtml: string;
  /** Represents the formatted HTML for the secondary part of the autocomplete suggestion. */
  formattedSecondaryHtml: string;
  /** Represents the formatted HTML for the autocomplete suggestion. */
  formattedHtml: string;
};
