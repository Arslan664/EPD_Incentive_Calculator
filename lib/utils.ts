/**
 * Utility functions for parsing and formatting numerical data
 * from the EPD Incentive dataset.
 */

/** Parse a comma/space-separated number string into a float */
export const cleanNum = (str: string | number | null | undefined): number => {
  if (!str) return 0;
  return (
    parseFloat(
      str
        .toString()
        .replace(/,/g, "")
        .replace(/\s/g, "")
    ) || 0
  );
};

/** Format a number with US locale grouping (no decimals) */
export const formatNum = (num: number): string => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(num);
};

/** Calculate achievement percentage and return metadata */
export const getPct = (
  actual: number,
  plan: number
): { value: number; isGood: boolean } | null => {
  if (!plan || plan === 0) return null;
  const pct = Math.round((actual / plan) * 100);
  return { value: pct, isGood: pct >= 100 };
};
