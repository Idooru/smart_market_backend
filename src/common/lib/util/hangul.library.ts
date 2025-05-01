import hangul from "hangul-js";

export class HangulLibrary {
  public getChoseong(productName: string): string {
    return hangul
      .disassemble(productName, true) // 초성 분해
      .map((arr) => arr[0]) // 초성만 추출
      .join(""); // 초성 결합
  }

  public isOnlyChoseong(search: string) {
    return hangul.isConsonant(search);
  }
}
