import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { ConversionService } from '../../services/conversion/conversion.service';
import { ShoeType } from '../../services/conversion/conversions/boot-size';

@Component({
  selector: 'app-skis',
  imports: [FormField],
  templateUrl: './skis.component.html',
  styleUrl: './skis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkisComponent {
  private conversionService = inject(ConversionService);
  private initialSkierModel = {
    age: '',
    minHeight: '',
    maxHeight: '',
    weightRange: '',
    shoeSize: '',
    shoeType: ShoeType.Mens,
    skierCode: '1',
  };
  private skierModel = signal(this.initialSkierModel);
  public skierForm = form(this.skierModel);

  public ageOptions = Array.from({ length: 12 }, (_, i) => i + 3); // Generates ages from 3 to 14

  private heightOptions: string[] = this.conversionService.getHeights(); // Initialize as an empty array
  public minHeightOptions = computed(() => {
    if (!this.skierForm.maxHeight().touched()) {
      return this.heightOptions;
    }
    const maxHeightIndex = this.heightOptions.indexOf(this.skierModel().maxHeight);
    return maxHeightIndex >= 0 ? this.heightOptions.slice(0, maxHeightIndex + 1) : this.heightOptions;
  }); // Computed property for min height options
  public maxHeightOptions = computed(() => {
    if (!this.skierForm.minHeight().touched()) {
      return this.heightOptions;
    }
    const minHeightIndex = this.heightOptions.indexOf(this.skierModel().minHeight);
    return minHeightIndex >= 0 ? this.heightOptions.slice(minHeightIndex) : this.heightOptions;
  }); // Computed property for max height options
  public weightRanges: string[] = this.conversionService.getWeightRanges(); // Initialize as an empty array

  public shoeSizes = computed(() => {
    const shoeType = this.skierForm.shoeType().value();
    return untracked(() => this.conversionService.getShoeSizes(shoeType)); // Ensure this computed property updates when shoeType is touched
  }); // Computed property for shoe sizes

  constructor() {
    effect(() => {
      const maxHeightTouched = this.skierForm.maxHeight().touched();
      if (!maxHeightTouched) {
        const minHeight = this.skierForm.minHeight().value();
        if (minHeight) {
          this.skierForm.maxHeight().value.set(minHeight);
        }
      }
    });
    effect(() => {
      const minHeightTouched = this.skierForm.minHeight().touched();
      if (!minHeightTouched) {
        const maxHeight = this.skierForm.maxHeight().value();
        if (maxHeight) {
          this.skierForm.minHeight().value.set(maxHeight);
        }
      }
    });
  }

  resetForm() {
    this.skierModel.set(this.initialSkierModel);
  }

  public bootSize = computed<{ value: number | null, errMsg?: string, adjustments?: string; }>(() => {
    const shoeSize = this.skierForm.shoeSize().value();
    const shoeType = this.skierForm.shoeType().value();
    if (shoeSize && shoeType) {
      const bootSize = this.conversionService.bootSize.fromShoeSize(shoeSize, shoeType);
      if (bootSize === null) {
        return { value: null, errMsg: `Couldn't find a boot to fit size ${shoeSize} ${shoeType}` };
      }
      const nearestBootSize = this.conversionService.bootLength.findNearestBootSize(bootSize);
      if (nearestBootSize === null) {
        return { value: null, errMsg: `Couldn't find a boot compatible with size ${bootSize}` };
      }
      if (nearestBootSize !== bootSize) {
        return { value: nearestBootSize, adjustments: `Boot size rounded up from ${bootSize} to the nearest available size` };
      }
      return { value: nearestBootSize };
    }
    return { value: null, errMsg: 'Shoe size required' };
  }); // Computed property for boot size

  public bootLength = computed(() => {
    const bootSizeValue = this.bootSize().value;
    if (bootSizeValue !== null) {
      const bootLength = this.conversionService.bootLength.fromBootSize(bootSizeValue.toString());
      return bootLength !== null ? bootLength : null;
    }
    return null;
  });

  public skiLengths = computed<{ value: number | null, recommended?: boolean; }[] | null>(() => {
    const maxHeight = this.skierForm.maxHeight().value();
    const minHeight = this.skierForm.minHeight().value();

    if (maxHeight && minHeight) {
      const lengthOptions = this.conversionService.skiLength.fromHeightRange(minHeight, maxHeight);
      if (lengthOptions?.length) {
        return lengthOptions.map(length => ({ value: length, recommended: false }));
      } else {
        return null;
      }
    }
    return null;
  });

  public dims = computed<{ code: string | null, value: number | null, errMsg?: string; }>(() => {
    const weightRange = this.skierForm.weightRange().value();
    const bootLength = this.bootLength();
    if (!weightRange || !bootLength) {
      return { errMsg: 'Weight and boot length required', value: null, code: null };
    }
    const dimCode = this.conversionService.dimCode.fromWeightRange(weightRange);
    const dimSubCode = this.conversionService.dimSubCode.fromBootLength(bootLength.toString());
    if (!dimCode || !dimSubCode) {
      return { errMsg: `No dim code found for the given weight and boot length`, value: null, code: null };
    }
    const dimValue = this.conversionService.dimValue.fromCodes(dimCode, dimSubCode.toString());
    if (!dimValue) {
      return { errMsg: `No dim value found for the dim code `, code: dimCode + dimSubCode, value: null };
    }
    return { code: dimCode + dimSubCode, value: dimValue };
  });
}
