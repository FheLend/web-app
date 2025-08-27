import React, { useState, useRef } from "react";
import { Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOutsideClick } from "@/hooks/useOutsideClick";

interface SlippageProps {
  slippage: number;
  setSlippage: (value: number) => void;
  className?: string;
}

export function Slippage({ slippage, setSlippage, className }: SlippageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(slippage.toString());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the custom hook to detect clicks outside the dropdown
  useOutsideClick(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  // Predefined slippage values
  const presetValues = [0.1, 0.5, 1.0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric values with up to one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleApply = () => {
    const parsedValue = parseFloat(inputValue);
    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
      setSlippage(parsedValue);
    } else {
      // Reset to current slippage if invalid
      setInputValue(slippage.toString());
    }
    setIsOpen(false);
  };

  const selectPreset = (value: number) => {
    setInputValue(value.toString());
    setSlippage(value);
  };

  return (
    <div className={cn("flex justify-end items-center", className)}>
      <div className="text-sm text-muted-foreground">Slippage</div>
      <div className="relative h-6" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Slippage settings"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg p-3 z-50 w-64 dark:bg-gray-900">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-sm font-medium">Slippage Tolerance</h5>
            </div>

            <div className="flex gap-2 mb-3">
              {presetValues.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={slippage === value ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs",
                    slippage === value
                      ? "bg-cryptic-accent hover:bg-cryptic-accent/90"
                      : ""
                  )}
                  onClick={() => selectPreset(value)}
                >
                  {value}%
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="pr-8 text-sm"
                  placeholder="Custom"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="bg-cryptic-accent hover:bg-cryptic-accent/90"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Your transaction will revert if the price changes unfavorably by
              more than this percentage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
