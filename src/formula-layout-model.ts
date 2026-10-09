export const MIN_FORMULA_FONT_SIZE = 12
export const MIN_FORMULA_LETTER_SPACING = -0.3
export type FormulaTextFit = { size: number; tracking: number }

export function fitFormulaText(
  maximum: number, fits: (style: FormulaTextFit) => boolean,
): FormulaTextFit {
  const max = Math.max(MIN_FORMULA_FONT_SIZE, maximum)
  const candidates: FormulaTextFit[] = [
    { size: max, tracking: 0 }, { size: max, tracking: -0.15 },
  ]
  for (let size = max; size >= MIN_FORMULA_FONT_SIZE; size -= 0.5) {
    candidates.push({ size, tracking: MIN_FORMULA_LETTER_SPACING })
  }
  return candidates.find(fits) ?? { size: MIN_FORMULA_FONT_SIZE,
    tracking: MIN_FORMULA_LETTER_SPACING }
}
