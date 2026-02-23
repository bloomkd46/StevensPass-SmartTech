import weightRangeDimCode from '../../../conversions/weight-dim.json';

export class DimCode {
  private weightRangeDimCodeFactors: WeightRangeDimCodeType = weightRangeDimCode;
  fromWeightRange(weightRange: string): string | null {
    return this.weightRangeDimCodeFactors[weightRange] || null;
  }
  getWeightRanges(): string[] {
    return Object.keys(this.weightRangeDimCodeFactors);
  }

  /**
   * Adjusts a dimension code by a specified number of steps, ensuring the result remains within the range of 'A' to 'Z'.
   * @param code The original dimension code to adjust (expected to be a single letter).
   * @param adjustment The number of steps to adjust the code by (positive or negative).
   * @returns The adjusted dimension code, or the original code if the input is invalid or the adjustment goes out of bounds.
   * The method normalizes the input code to uppercase and trims whitespace, then calculates the new character code based on the adjustment.
   * It clamps the result to ensure it does not go below 'A' or above 'Z'.
   * If the input code is not a single letter or if the adjustment is not a finite number, it returns the original code unchanged.
   */
  adjustCode(code: string, adjustment: number): string {
    const normalizedCode = code.trim().toUpperCase();
    if (!/^[A-Z]$/.test(normalizedCode) || !Number.isFinite(adjustment)) {
      return code;
    }

    const aCharCode = 'A'.charCodeAt(0);
    const zCharCode = 'Z'.charCodeAt(0);
    const delta = Math.trunc(adjustment);

    const targetCharCode = normalizedCode.charCodeAt(0) + delta;
    const clampedCharCode = Math.min(zCharCode, Math.max(aCharCode, targetCharCode));

    return String.fromCharCode(clampedCharCode);
  }
}
type WeightRangeDimCodeType = {
  /** The key is a weight range converted to a string and the value is the corresponding dimension code */
  [weightRange: string]: string;
};
