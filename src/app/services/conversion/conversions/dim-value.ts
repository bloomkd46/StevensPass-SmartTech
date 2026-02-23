import dimValue from '../../../conversions/dim-value.json';

export class DimValue {
  private dimValueFactors: DimValueFactorsType = dimValue;
  fromCodes(dimCode: string, subDim: string): number | null {
    const conversionTable = this.dimValueFactors[dimCode];
    return conversionTable ? conversionTable[subDim] || null : null;
  }

  getPercentile(dimCode: string, subDim: string): number | null;
  getPercentile(fullCode: string): number | null;
  getPercentile(dimCodeOrFullCode: string, subDim?: string): number | null {
    if (subDim === undefined) {
      if (dimCodeOrFullCode.length < 2) {
        return null; // Invalid code format
      }
      const dimCode = dimCodeOrFullCode.charAt(0);
      const subDim = dimCodeOrFullCode.slice(1);
      return this.getPercentile(dimCode, subDim);
    }
    const conversionTable = this.dimValueFactors[dimCodeOrFullCode];
    const subDims = Object.keys(conversionTable || {}).map(key => Number(key)).sort((a, b) => a - b);
    const index = subDims.indexOf(Number(subDim));
    if (index === -1 || !conversionTable) {
      return null;
    }
    return (index + 1) / (subDims.length);
  }
}

type DimValueFactorsType = {
  /** The key is a dimension code converted to a string and the value is an object where the key is a sub dimension converted to a string and the value is the corresponding dimension value */
  [dimCode: string]: {
    /** The key is a sub dimension converted to a string and the value is the corresponding dimension value */
    [subDim: string]: number;
  };
};
