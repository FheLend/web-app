export function formatNumber(value: number | string | bigint): string {
  const valueStr = value.toString();

  // If it's a very large number in scientific notation or with many digits
  if (valueStr.includes("e") || valueStr.length > 15) {
    // Convert from BigInt or large string to a human-readable format
    try {
      // If it's a bigint or a string representation of a large integer
      if (typeof value === "bigint" || /^\d+$/.test(valueStr)) {
        const numValue = parseFloat(valueStr);

        // Apply appropriate formatting based on the size
        if (numValue < 0.0001 && numValue > 0) {
          return numValue.toExponential(4);
        } else if (numValue < 1) {
          return numValue.toFixed(4);
        } else if (numValue < 1000) {
          return numValue.toFixed(2);
        } else {
          return numValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
      }
    } catch (e) {
      console.error("Error formatting large number:", e);
      // Fallback to truncation if conversion fails
      return valueStr.slice(0, 10) + "...";
    }
  }

  // For regular numbers
  const numValue = typeof value === "number" ? value : parseFloat(valueStr);

  // If the number is very small (near zero), show more decimal places
  if (numValue > 0 && numValue < 0.0001) {
    return numValue.toExponential(2);
  }
  // For small numbers, show 4 decimal places
  else if (numValue < 1) {
    return numValue.toFixed(4);
  }
  // For medium numbers, show 2 decimal places
  else if (numValue < 1000) {
    return numValue.toFixed(2);
  }
  // For large numbers, use locale string with 2 decimal places
  else {
    return numValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
