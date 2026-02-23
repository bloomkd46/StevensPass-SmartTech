import dimValue from '../../../conversions/dim-value.json';

export class DimValue {
  private dimValueFactors: DimValueFactorsType = dimValue;
  fromCodes(dimCode: string, subDim: string): number | null {
    const conversionTable = this.dimValueFactors[dimCode];
    return conversionTable ? conversionTable[subDim] || null : null;
  }
}

type DimValueFactorsType = {
  /** The key is a dimension code converted to a string and the value is an object where the key is a sub dimension converted to a string and the value is the corresponding dimension value */
  [dimCode: string]: {
    /** The key is a sub dimension converted to a string and the value is the corresponding dimension value */
    [subDim: string]: number;
  };
};
