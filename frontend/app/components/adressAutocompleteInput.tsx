import React, { useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { MapPin } from "lucide-react";

interface PlainAddressInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  errorMessage?: string;
  onChange: (value: string) => void;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export function AddressAutocompleteInput({
  label,
  placeholder = "Ingresa una dirección",
  value = "",
  required = false,
  className = "",
  disabled = false,
  errorMessage,
  onChange,
  name,
  onBlur,
}: PlainAddressInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="grid gap-2 relative">
      <Label htmlFor="address-input">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="address-input"
          name={name}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`pl-9 ${className}`}
          aria-invalid={errorMessage ? "true" : "false"}
          autoComplete="off"
        />
      </div>
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
