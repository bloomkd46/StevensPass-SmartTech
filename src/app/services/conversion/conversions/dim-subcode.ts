import bootLengthSubDim from '../../../conversions/bootLength-subDim.json';

export class DimSubCode {
  private bootLengthSubDimFactors: BootLengthSubDimType = bootLengthSubDim;
  fromBootLength(bootLength: string): number | null {
    for (const lengthRange in this.bootLengthSubDimFactors) {
      const parsedRange = this.parseRange(lengthRange);
      if (parsedRange) {
        const { min, max } = parsedRange;
        const bootLengthNum = parseInt(bootLength, 10);
        if (bootLengthNum >= min && bootLengthNum <= max) {
          return this.bootLengthSubDimFactors[lengthRange];
        }
      }
    }
    return null;
  }

  private parseRange(range: string): { min: number; max: number; } | null {
    const regex = /(\d+)-(\d+)/;
    const match = range.match(regex);
    if (match) {
      const min = parseInt(match[1], 10);
      const max = parseInt(match[2], 10);
      return { min, max };
    }
    return null;
  }
}

type BootLengthSubDimType = {
  /** The key is a boot length converted to a string and the value is the corresponding sub dimension factor */
  [bootLength: string]: number;
};
