import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { form, FormField, max, min, required, validate } from '@angular/forms/signals';
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
  public skierForm = form(this.skierModel, (schemaPath) => {
    required(schemaPath.age, { message: 'Age is required to calculate dims' });
    min(schemaPath.age, 3, { message: 'Minimum ski school age is 3' });
    max(schemaPath.age, 14, { message: 'Maximum ski school age is 14 (support for older skiers is experimental)' });

    required(schemaPath.minHeight, { message: 'Minimum height is required to calculate ski length options' });
    required(schemaPath.maxHeight, { message: 'Maximum height is required to calculate ski length options' });

    required(schemaPath.weightRange, { message: 'Weight range is required to calculate dims' });
    required(schemaPath.shoeSize, { message: 'Shoe size is required to calculate boot size and dims' });
    required(schemaPath.shoeType, { message: 'Shoe type is required to calculate boot size and dims' });
    validate(schemaPath.shoeSize, ({ value }) => {
      const shoeType = this.skierForm.shoeType().value();
      if (!value || !shoeType) {
        return null; // Let the required validators handle this case
      }
      if (!this.shoeSizes().includes(value())) {
        return { kind: 'invalid', message: `Invalid ${shoeType} shoe size.` };
      }
      return null;

    });
    required(schemaPath.skierCode, { message: 'Skier code is required to calculate dims' });
  });

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
    effect(() => {
      const shoeTypeTouched = this.skierForm.shoeType().touched();
      if (!shoeTypeTouched) {
        const shoeSize = Number(this.skierForm.shoeSize().value());
        if (shoeSize && shoeSize >= 8 && shoeSize <= 13.5) {
          const age = Number(this.skierForm.age().value());
          if (age <= 10) {
            this.skierForm.shoeType().value.set(ShoeType.Youth);
          }
        }
      }
    });
  }

  resetForm() {
    this.skierModel.set(this.initialSkierModel);
    this.skierForm().reset();
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

  public skiLengths = computed<{ value: number | null, recommended?: string; }[] | null>(() => {
    const maxHeight = this.skierForm.maxHeight().value();
    const minHeight = this.skierForm.minHeight().value();

    if (maxHeight && minHeight) {
      const lengthOptions = this.conversionService.skiLength.fromHeightRange(minHeight, maxHeight);
      if (lengthOptions?.length) {
        const lengths = lengthOptions.map<{ value: number | null, recommended?: string; }>(length => ({ value: length }));
        if (this.skierForm.skierCode().value() !== '1') {
          lengths[lengths.length - 1].recommended = 'Recommended based off of skier type'; // Recommend the longest ski for more advanced skiers
        } else {
          const dimCode = this.dims().code;
          const dimPercentile = this.conversionService.dimValue.getPercentile(dimCode || '');
          if (dimPercentile !== null) {
            const recommendedIndex = Math.round(dimPercentile * (lengths.length - 1));
            lengths[recommendedIndex].recommended = 'Recommended based off of the dim settings';
          }
        }
        return lengths;
      } else {
        return null;
      }
    }
    return null;
  });

  public dims = computed<{ code: string | null, value: number | null, errMsg?: string, adjustments?: string[]; }>(() => {
    const weightRange = this.skierForm.weightRange().value();
    const bootLength = this.bootLength();
    const age = this.skierForm.age().value();
    const skierCode = this.skierForm.skierCode().value();
    if (!weightRange || !bootLength) {
      return { errMsg: 'Weight and boot length required', value: null, code: null };
    }
    if (!age) {
      return { errMsg: 'Age required', value: null, code: null };
    }
    if (!skierCode) {
      return { errMsg: 'Skier code required', value: null, code: null };
    }
    let dimCode = this.conversionService.dimCode.fromWeightRange(weightRange);
    const dimSubCode = this.conversionService.dimSubCode.fromBootLength(bootLength.toString());
    if (!dimCode || !dimSubCode) {
      return { errMsg: `No dim code found for the given weight and boot length`, value: null, code: null };
    }
    const adjustments: string[] = [];
    if (parseInt(age) >= 50 || parseInt(age) < 10) {
      dimCode = this.conversionService.dimCode.adjustCode(dimCode, -1);
      adjustments.push('Dim code adjusted for age');
    }
    if (!dimCode) {
      return { errMsg: `No dim code found after adjusting for age`, value: null, code: null };
    }
    if (skierCode !== '1') {
      dimCode = this.conversionService.dimCode.adjustCode(dimCode, parseInt(skierCode) - 1);
      adjustments.push(`Dim code adjusted for skier code ${skierCode}`);
    }
    if (!dimCode) {
      return { errMsg: `No dim code found after adjusting for skier code`, value: null, code: null, adjustments };
    }
    const dimValue = this.conversionService.dimValue.fromCodes(dimCode, dimSubCode.toString());
    if (!dimValue) {
      return { errMsg: `No dim value found for the dim code `, code: dimCode + dimSubCode, value: null, adjustments };
    }
    return { code: dimCode + dimSubCode, value: dimValue, adjustments };
  });
}
