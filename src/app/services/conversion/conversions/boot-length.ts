import bootSizeBootLength from '../../../conversions/bootSize-bootLength.json';

export class BootLength {
  private bootLengthBootSize: BootSizeBootLengthType = bootSizeBootLength;
  fromBootSize(bootSize: string): number | null {
    return this.bootLengthBootSize[bootSize] || null;
  }

  findNearestBootSize(preciseSize: number): number | null {
    const bootSizes = Object.keys(this.bootLengthBootSize).map(size => Number(size)).sort((a, b) => a - b);
    if (bootSizes.includes(preciseSize)) {
      return preciseSize;
    } else {
      let attemptedSize = preciseSize;
      while (attemptedSize < bootSizes[bootSizes.length - 1]) {
        attemptedSize += 0.5;
        if (bootSizes.includes(attemptedSize)) {
          return attemptedSize;
        }
      }
    }
    return null;
  }
}

type BootSizeBootLengthType = {
  /** The key is a boot size converted to a string and the value is the corresponding boot length in cm */
  [bootSize: string]: number;
};
