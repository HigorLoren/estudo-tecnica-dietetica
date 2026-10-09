export type Preparation = { gross: number; correction: number; conversion: number }

export const preparationExamples = [
  { id: 'carne', name: 'Carne assada', detail: 'Perda na limpeza e na cocção',
    gross: 12, correction: 1.2, conversion: 0.75 },
  { id: 'arroz', name: 'Arroz cozido', detail: 'Ganho de peso no preparo',
    gross: 5, correction: 1, conversion: 2.8 },
  { id: 'equilibrio', name: 'Mesmo peso ao final', detail: 'IC igual a 1',
    gross: 10, correction: 1.25, conversion: 1 },
]

export function calculatePreparation(values: Preparation) {
  const liquid = values.gross / values.correction
  const cooked = liquid * values.conversion
  return { gross: values.gross, liquid, cooked,
    cleaningLoss: values.gross - liquid, cookingChange: cooked - liquid,
    cleaningLossPercent: (1 - 1 / values.correction) * 100 }
}

export function formatWeight(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
