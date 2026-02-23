import heightSkiLength from '../../../conversions/height-skiLength.json';

export class SkiLength {
  private heightSkiLengthFactors: HeightSkiLengthType = heightSkiLength;
  fromHeight(height: string): number | null {
    return this.heightSkiLengthFactors[height] || null;
  }
  fromHeightRange(minHeight: string, maxHeight: string): number[] | null {
    const skiLengths: number[] = [];
    const minHeightParsed = this.parseHeight(minHeight);
    const maxHeightParsed = this.parseHeight(maxHeight);

    if (!minHeightParsed || !maxHeightParsed) {
      return null;
    }
    const minHeightInches = this.toInches(minHeightParsed!)!;
    const maxHeightInches = this.toInches(maxHeightParsed!)!;
    for (const height in this.heightSkiLengthFactors) {
      const heightParsed = this.parseHeight(height)!;
      const heightInches = this.toInches(heightParsed)!;
      if (heightInches >= minHeightInches && heightInches <= maxHeightInches) {
        skiLengths.push(this.heightSkiLengthFactors[height]);
      }
    }
    return skiLengths.length > 0 ? skiLengths : null;
  }

  /**
   * Get all of the supported height options
   * @returns An array of height options sorted in ascending order
   */
  public getHeights(): string[] {
    return Object.keys(this.heightSkiLengthFactors).sort((a, b) => {
      const heightA = this.parseHeight(a);
      const heightB = this.parseHeight(b);

      if (!heightA || !heightB) {
        return a.localeCompare(b);
      }

      if (heightA.feet !== heightB.feet) {
        return heightA.feet - heightB.feet;
      }

      return heightA.inches - heightB.inches;
    });
  }
  private parseHeight(height: string): Height | null {
    const regex = /(\d+)'\s*(\d+)"/;
    const match = height.match(regex);
    if (match) {
      const feet = parseInt(match[1], 10);
      const inches = parseInt(match[2], 10);
      return { feet, inches };
    }
    return null;
  }
  toInches(height: Height | string) {
    let parsedHeight: Height | null;
    if (typeof height === 'string') {
      parsedHeight = this.parseHeight(height);
    } else {
      parsedHeight = height;
    }
    if (!parsedHeight) {
      return null;
    }
    return parsedHeight.feet * 12 + parsedHeight.inches;
  }
}

type HeightSkiLengthType = {
  /** The key is a height converted to a string and the value is the corresponding ski length in cm */
  [height: string]: number;
};
type Height = {
  feet: number;
  inches: number;
};
