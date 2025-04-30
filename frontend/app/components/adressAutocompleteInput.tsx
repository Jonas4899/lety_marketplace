import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchPlacePredictions, fetchPlaceDetails } from "~/lib/googlePlaces"; // Assuming path is correct
import { useDebounce } from "~/hooks/useDebounce"; // Import the hook we created
import { cn } from "~/lib/utils"; // For utility class merging

// Define the structure of a prediction
interface PlacePrediction {
  place_id: string;
  description: string;
}

// Define the props for the component
interface AddressAutocompleteInputProps {
  initialValue?: string;
  label?: string;
  placeholder?: string;
  // Callback to pass the selected address string and place_id to the parent form
  onAddressSelect: (
    address: string,
    placeId?: string,
    details?: { lat: number; lng: number }
  ) => void;
  // You might need to pass down form state/control from React Hook Form or similar
  // For example: name: string; control: Control<any>;
  className?: string;
  required?: boolean; // For the input field
  disabled?: boolean;
}

export function AddressAutocompleteInput({
  initialValue = "",
  label = "Address",
  placeholder = "Start typing your address...",
  onAddressSelect,
  className,
  required = false,
}: AddressAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPredictions, setShowPredictions] = useState<boolean>(false);
  const debouncedSearchTerm = useDebounce(inputValue, 500); // 500ms debounce delay
  const containerRef = useRef<HTMLDivElement>(null); // Ref for detecting clicks outside

  // Effect to fetch predictions when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm !== initialValue) {
      // Avoid fetching if value hasn't really changed from initial or selection
      setIsLoading(true);
      setPredictions([]); // Clear previous predictions
      fetchPlacePredictions(debouncedSearchTerm) //
        .then((preds) => {
          setPredictions(preds);
          setShowPredictions(preds.length > 0);
        })
        .catch((error) => {
          console.error("Error fetching place predictions:", error);
          setShowPredictions(false); // Hide predictions on error
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]); // We intentionally don't include initialValue here

  // Handle clicks outside the component to close predictions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPredictions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      if (value) {
        setShowPredictions(true); // Keep showing potentially stale predictions while typing/debouncing
      } else {
        setShowPredictions(false); // Hide if input is cleared
      }
    },
    []
  );

  const handlePredictionClick = useCallback(
    async (prediction: PlacePrediction) => {
      setInputValue(prediction.description); // Update input visually
      setPredictions([]); // Clear predictions
      setShowPredictions(false); // Hide dropdown

      // Optionally fetch details (like coordinates)
      try {
        const details = await fetchPlaceDetails(prediction.place_id); //
        // Pass selected address string, place_id, and details up to parent form
        onAddressSelect(prediction.description, prediction.place_id, {
          lat: details.lat,
          lng: details.lng,
        });
      } catch (error) {
        console.error("Error fetching place details:", error);
        // Still pass the selected description and place_id even if details fail
        onAddressSelect(prediction.description, prediction.place_id);
      }
    },
    [onAddressSelect]
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor="address-input"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id="address-input"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (predictions.length > 0) setShowPredictions(true);
        }} // Show existing predictions on focus if available
        placeholder={placeholder}
        required={required}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" // Example styling - adapt as needed
        autoComplete="off" // Disable browser's built-in autocomplete
        aria-autocomplete="list"
        aria-controls="address-predictions"
      />
      {isLoading && (
        <div className="absolute right-2 top-9 text-xs text-gray-500">
          Loading...
        </div>
      )}

      {showPredictions && predictions.length > 0 && (
        <ul
          id="address-predictions"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handlePredictionClick(prediction)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
              role="option"
              aria-selected={false} // Can enhance with keyboard navigation later
            >
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
