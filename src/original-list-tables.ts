export type QuestionTable = {
  caption: string
  headers: string[]
  groups?: { label: string; span: number; rows?: number }[]
  rows: string[][]
  solutions?: number[][]
}

const energy = (total: string, portion: string, label = 'Valor energético total'): QuestionTable => ({
  caption: 'Valores apresentados no gabarito',
  headers: [label, 'Valor energético por porção'], rows: [[total, portion]], solutions: [[0, 1]],
})

export const originalListTables: Record<string, QuestionTable[]> = {
  'lista-original-10': [{
    caption: 'Tabela do item 10', headers: ['Alimento', 'PB (Kg)', 'PL (Kg)', 'FC'],
    rows: [['Feijão carioca', '50', '47,62', '1,05'], ['Acém sem osso', '50', '38', '1,32'],
      ['Melancia', '49,78', '27,5', '1,81'], ['Chuchu', '75', '44,5', '1,69'],
      ['Cenoura', '20', '18,35', '1,09']],
    solutions: [[2], [3], [1], [3], [2]],
  }],
  'lista-34-fornecedor': [{
    caption: 'Tabela do item 34',
    headers: ['Fornecedor', 'Alimento', 'Preço/Kg', 'FC', 'Custo Real'],
    rows: [['Lavoura encantada', 'Tomate', '5,65', '1,18', '6,67'],
      ['Nossa horta', 'Tomate', '5,50', '1,25', '6,88'],
      ['Horta da cidade', 'Tomate', '5,82', '1,15', '6,69']],
    // Estes custos aparecem em preto no PDF: são dados do enunciado.
  }],
  'lista-original-macarrao': [{
    caption: 'Ficha Técnica de Preparo de Alimentos',
    groups: [{ label: 'Ingredientes', span: 2 }, { label: 'Peso (g)', span: 2 },
      { label: 'FC', span: 1, rows: 2 }, { label: 'Cálculo dietético', span: 3 }],
    headers: ['Alimento', 'Medida caseira', 'PB', 'PL', '', 'PTN (g)', 'CHO (g)', 'LIP (g)'],
    rows: [['Macarrão', '2 pacotes', '1000', '1000', '1', '100', '779', '13'],
      ['Alho', '7 dts', '36', '30', '1,2', '2,1', '7,17', '0,06'],
      ['Óleo', '1 copo de café', '66', '66', '1', '--', '--', '66'],
      ['Total (g)', '----', '----', '--', '--', '102,1', '786,17', '79,06'],
      ['Total em kcal', '', '', '', '', '408,4', '3144,68', '711,64']],
    solutions: [[1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 7],
      [5, 6, 7], [5, 6, 7]],
  }, energy('4.264,62 Kcal', '152,31 Kcal')],
  'lista-original-biscoito': [{
    caption: 'Informação nutricional por 100g de alimento:',
    headers: ['Ingredientes', 'PTN (g)', 'LIP (g)', 'CHO(g)'],
    rows: [['Queijo', '4', '27', '0'], ['Farinha de trigo', '10', '1', '77'],
      ['Margarina', '0,1', '82', '0']],
  }, {
    caption: 'Preencha a tabela de valor nutricional abaixo:',
    headers: ['Ingredientes', 'PTN (g)', 'LIP (g)', 'CHO (g)'],
    rows: [['Queijo', '8', '54', '--'], ['Farinha de trigo', '28', '2,8', '215,6'],
      ['Margarina', '0,12', '98,4', '--'], ['Total (g)', '36,12', '155,2', '215,6'],
      ['Total em kcal', '144,48', '1.396,8', '862,4']],
    solutions: [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]],
  }, energy('2.403,68 Kcal', '109,26 kcal', 'Valor energético total (Kcal)')],
}
