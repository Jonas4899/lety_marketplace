// TypeScript declaration for the custom Google Maps Place Autocomplete web component
// Allows usage of <gmp-place-autocomplete> in JSX

declare namespace JSX {
  interface IntrinsicElements {
    "gmp-place-autocomplete": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      placeholder?: string;
      value?: string;
    };
  }
}

declare module "@googlemaps/extended-component-library/place_autocomplete.js";
