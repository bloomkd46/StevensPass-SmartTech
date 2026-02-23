import { Injectable } from '@angular/core';
import { BootLength } from './conversions/boot-length';
import { BootSize, type ShoeType } from './conversions/boot-size';
import { DimCode } from './conversions/dim-code';
import { DimSubCode } from './conversions/dim-subcode';
import { DimValue } from './conversions/dim-value';
import { SkiLength } from './conversions/ski-length';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  public bootSize = new BootSize();
  public bootLength = new BootLength();
  public skiLength = new SkiLength();
  public dimCode = new DimCode();
  public dimSubCode = new DimSubCode();
  public dimValue = new DimValue();

  public getWeightRanges = () => this.dimCode.getWeightRanges();
  public getHeights = () => this.skiLength.getHeights();
  public getShoeSizes = (sizeType: ShoeType) => this.bootSize.getShoeSizes(sizeType);
}
