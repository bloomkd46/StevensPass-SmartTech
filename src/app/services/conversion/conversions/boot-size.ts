import shoeSizeBootSize from '../../../conversions/shoeSize-bootSize.json';

export class BootSize {
  private shoeSizeBootSizeFactors: ShoeSizeBootSizeType = shoeSizeBootSize;

  fromShoeSize(shoeSize: string, shoeType: ShoeType): number | null {
    const conversionTable = this.shoeSizeBootSizeFactors[shoeType];
    return conversionTable[shoeSize] || null;
  }
  getShoeSizes(shoeType: ShoeType): string[] {
    const conversionTable = this.shoeSizeBootSizeFactors[shoeType];
    const shoeSizes = Object.keys(conversionTable);
    return shoeSizes.sort((a, b) => Number(a) - Number(b));
  }
}

type ShoeSizeBootSizeType = {
  mens: {
    /** The key is a shoe size converted to a string and the value is the corresponding boot size in cm */
    [shoeSize: string]: number;
  };
  womens: {
    /** The key is a shoe size converted to a string and the value is the corresponding boot size in cm */
    [shoeSize: string]: number;
  };
  youth: {
    /** The key is a shoe size converted to a string and the value is the corresponding boot size in cm */
    [shoeSize: string]: number;
  };
};
export enum ShoeType {
  Mens = 'mens',
  Womens = 'womens',
  Youth = 'youth'
}
