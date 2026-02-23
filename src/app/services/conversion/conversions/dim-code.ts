import weightRangeDimCode from '../../../conversions/weight-dim.json';

export class DimCode {
  private weightRangeDimCodeFactors: WeightRangeDimCodeType = weightRangeDimCode;
  fromWeightRange(weightRange: string): string | null {
    return this.weightRangeDimCodeFactors[weightRange] || null;
  }
  getWeightRanges(): string[] {
    return Object.keys(this.weightRangeDimCodeFactors);
  }
}

type WeightRangeDimCodeType = {
  /** The key is a weight range converted to a string and the value is the corresponding dimension code */
  [weightRange: string]: string;
};
