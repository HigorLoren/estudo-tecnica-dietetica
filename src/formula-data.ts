export const formulaMethods = [
  { id: 'complete', label: 'Completar a fórmula', instruction: 'Preencha o termo que falta.' },
  { id: 'assemble', label: 'Montar a fórmula', instruction: 'Arraste as peças para montar a equação. Você pode repetir termos.' },
  { id: 'recall', label: 'Escrever de memória', instruction: 'Escreva a equação sem consultar.' },
  { id: 'repair', label: 'Encontrar o erro', instruction: 'Identifique o erro e corrija a fórmula arrastando as peças.' },
  { id: 'apply', label: 'Escolher pelo enunciado', instruction: 'Escolha a fórmula para resolver a situação, sem fazer a conta.' },
  { id: 'explain', label: 'Explicar o significado', instruction: 'Explique os termos e por que essa relação funciona.' },
] as const
export type FormulaMethod = typeof formulaMethods[number]['id']

type Formula = { id: string; name: string; family: string; equation: string;
  meaning: string; situation: string; wrong: string; error: string }
export const formulas: Formula[] = [
  { id: 'fc', name: 'Fator de correção', family: 'Pesos e limpeza', equation: 'FC = PB ÷ PL',
    meaning: 'PB é o peso como comprado; PL é o peso após a limpeza. FC compara o peso comprado com o aproveitável. Use a mesma unidade nos dois pesos.',
    situation: 'Você conhece o peso comprado e o peso após limpar as hortaliças. Como obter o fator de correção?',
    wrong: 'FC = PL ÷ PB', error: 'Os pesos estão invertidos: o peso bruto fica no numerador.' },
  { id: 'pb', name: 'Peso bruto', family: 'Pesos e limpeza', equation: 'PB = PL × FC',
    meaning: 'Multiplique o peso líquido desejado pelo fator de correção para considerar a perda no pré-preparo.',
    situation: 'Você precisa de certa quantidade de alimento limpo e conhece o FC. Qual equação fornece o peso a comprar?',
    wrong: 'PB = PL ÷ FC', error: 'Para recuperar o peso bruto, multiplique PL por FC.' },
  { id: 'pl', name: 'Peso líquido', family: 'Pesos e limpeza', equation: 'PL = PB ÷ FC',
    meaning: 'Divida o peso adquirido pelo fator de correção para obter o peso aproveitável após a limpeza.',
    situation: 'Você conhece o peso adquirido e o FC. Como calcular quanto sobrará após a limpeza?',
    wrong: 'PL = PB × FC', error: 'O peso líquido é obtido dividindo PB por FC.' },
  { id: 'loss', name: 'Perda na limpeza', family: 'Pesos e limpeza', equation: 'Perda = PB − PL',
    meaning: 'A perda em massa é a diferença entre o peso bruto e o peso líquido. Ambos devem estar na mesma unidade.',
    situation: 'Você pesou o alimento antes e depois de retirar as partes não utilizadas. Como calcular a massa perdida?',
    wrong: 'Perda = PB + PL', error: 'A perda é uma diferença, não a soma dos pesos.' },
  { id: 'loss-percent', name: 'Percentual de perda', family: 'Pesos e limpeza', equation: 'Perda (%) = ( PB − PL ) ÷ PB × 100',
    meaning: 'Divida a massa perdida pelo peso bruto inicial e multiplique por 100. O percentual tem o peso bruto como referência.',
    situation: 'Que porcentagem do peso inicialmente comprado foi descartada no pré-preparo?',
    wrong: 'Perda (%) = ( PB − PL ) ÷ PL × 100', error: 'A base do percentual de perda é PB, o peso inicial.' },
  { id: 'ic', name: 'Índice de conversão', family: 'Cocção', equation: 'IC = Peso pronto ÷ PL cru',
    meaning: 'Compare o peso após o preparo com o peso líquido antes da cocção. IC acima de 1 indica ganho de massa; abaixo de 1, perda.',
    situation: 'Você conhece o peso limpo antes da cocção e o peso pronto. Como obter o índice de conversão?',
    wrong: 'IC = PL cru ÷ Peso pronto', error: 'O peso pronto fica no numerador e o PL cru no denominador.' },
  { id: 'cooked', name: 'Peso pronto', family: 'Cocção', equation: 'Peso pronto = PL cru × IC',
    meaning: 'Multiplique o peso líquido cru pelo índice de conversão para estimar a massa após o preparo.',
    situation: 'Você conhece o peso líquido cru e o IC. Qual equação estima a quantidade pronta?',
    wrong: 'Peso pronto = PL cru ÷ IC', error: 'Multiplique PL cru por IC para obter o peso pronto.' },
  { id: 'raw', name: 'Peso líquido cru', family: 'Cocção', equation: 'PL cru = Peso pronto ÷ IC',
    meaning: 'Divida o peso pronto desejado pelo IC para descobrir o peso líquido necessário antes da cocção.',
    situation: 'Quanto alimento limpo e cru você precisa para obter um peso pronto conhecido, usando o IC?',
    wrong: 'PL cru = Peso pronto × IC', error: 'Para desfazer a conversão, divida o peso pronto por IC.' },
  { id: 'ir', name: 'Índice de reidratação', family: 'Reidratação', equation: 'IR = Peso hidratado escorrido ÷ Peso seco',
    meaning: 'IR, também chamado IER neste conteúdo, compara o peso após hidratar e escorrer com o peso seco inicial.',
    situation: 'Você pesou um alimento seco e depois o hidratou e escorreu. Qual equação fornece o IR?',
    wrong: 'IR = Peso seco ÷ Peso hidratado escorrido', error: 'O peso hidratado escorrido fica no numerador.' },
  { id: 'hydrated', name: 'Peso hidratado', family: 'Reidratação', equation: 'Peso hidratado escorrido = Peso seco × IR',
    meaning: 'Multiplique o peso seco pelo índice de reidratação. O peso resultante se refere ao alimento hidratado e escorrido.',
    situation: 'Você conhece o peso seco e o IR. Como estimar o peso após hidratação e drenagem?',
    wrong: 'Peso hidratado escorrido = Peso seco ÷ IR', error: 'O ganho de massa é representado pela multiplicação por IR.' },
  { id: 'dry', name: 'Peso seco', family: 'Reidratação', equation: 'Peso seco = Peso hidratado escorrido ÷ IR',
    meaning: 'Divida o peso hidratado escorrido desejado pelo IR para obter a massa seca necessária.',
    situation: 'Você precisa de um peso hidratado escorrido conhecido. Como descobrir a massa seca usando o IR?',
    wrong: 'Peso seco = Peso hidratado escorrido × IR', error: 'A inversa da hidratação divide o peso hidratado por IR.' },
  { id: 'portion', name: 'Porção pronta', family: 'Porções e rendimento', equation: 'Porção = Per capita × IC',
    meaning: 'Neste cálculo, per capita é a quantidade líquida crua por pessoa e porção é a quantidade pronta. Use unidades de massa compatíveis.',
    situation: 'Você conhece o per capita líquido cru e o IC. Como estimar a quantidade pronta por pessoa?',
    wrong: 'Porção = Per capita ÷ IC', error: 'A porção pronta usa per capita multiplicado pelo IC.' },
  { id: 'per-capita', name: 'Per capita líquido cru', family: 'Porções e rendimento', equation: 'Per capita = Porção ÷ IC',
    meaning: 'Divida a porção pronta pelo IC para obter a quantidade líquida crua por pessoa.',
    situation: 'Você definiu a porção pronta e conhece o IC. Qual equação fornece a quantidade líquida crua por pessoa?',
    wrong: 'Per capita = Porção × IC', error: 'Para voltar da porção pronta ao per capita cru, divida por IC.' },
  { id: 'yield', name: 'Rendimento total', family: 'Porções e rendimento', equation: 'Rendimento = Porção × Refeições',
    meaning: 'Multiplique a massa pronta por pessoa pelo número de refeições para obter a massa pronta total.',
    situation: 'Você vai servir a mesma porção a 100 pessoas. Qual equação calcula o peso pronto total?',
    wrong: 'Rendimento = Porção ÷ Refeições', error: 'O total soma as porções, multiplicando pela quantidade de refeições.' },
  { id: 'purchase', name: 'Quantidade de compra', family: 'Compra e custo', equation: 'Compra = Refeições × Per capita × FC',
    meaning: 'Refeições é o número a servir; per capita é a massa líquida crua por pessoa. O FC converte a necessidade líquida total em peso bruto.',
    situation: 'Você conhece o número de refeições, o per capita líquido cru e o FC. Quanto alimento comprar, sem margem adicional?',
    wrong: 'Compra = Refeições × Per capita ÷ FC', error: 'A compra precisa considerar a limpeza, multiplicando por FC.' },
  { id: 'margin', name: 'Compra com margem de 10%', family: 'Compra e custo', equation: 'Compra com margem = Refeições × Per capita × FC × 1,10',
    meaning: 'O fator 1,10 acrescenta 10% à compra calculada. Use essa margem somente quando ela for solicitada; não é uma regra universal.',
    situation: 'O enunciado pede acrescentar 10% à compra. Como incluir essa margem na fórmula?',
    wrong: 'Compra com margem = Refeições × Per capita × FC × 0,10', error: '0,10 fornece apenas o adicional. Para incluir o total, use 1,10.' },
  { id: 'cost', name: 'Custo real por kg utilizável', family: 'Compra e custo', equation: 'Custo real = Preço por kg adquirido × FC',
    meaning: 'O preço por kg adquirido é corrigido pelo FC para representar o custo por kg aproveitável após a limpeza.',
    situation: 'Dois fornecedores vendem por kg, mas os alimentos têm perdas diferentes na limpeza. Como comparar o custo por kg utilizável?',
    wrong: 'Custo real = Preço por kg adquirido ÷ FC', error: 'A perda aumenta o custo por kg aproveitável: multiplique o preço por FC.' },
]

export type FormulaCard = { id: string; formula: Formula; method: FormulaMethod;
  prompt: string; answer: string; explanation: string; tokens: string[]; options: string[] }
export function equationTokens(equation: string) {
  return equation.split(/\s*([=×÷−+()])\s*/).map(token => token.trim()).filter(Boolean)
}
export const formulaCards: FormulaCard[] = formulas.flatMap((formula, index) =>
  formulaMethods.map(method => {
    const tokens = equationTokens(formula.equation)
    const blank = tokens.length - 1
    return {
      id: `${formula.id}:${method.id}`, formula, method: method.id,
      prompt: method.id === 'complete' ? tokens.map((token, i) => i === blank ? '___' : token).join(' ')
        : method.id === 'repair' ? formula.wrong
        : method.id === 'apply' ? formula.situation : formula.name,
      answer: method.id === 'complete' ? tokens[blank]
        : method.id === 'explain' ? formula.meaning : formula.equation,
      explanation: method.id === 'repair' ? `${formula.error} ${formula.meaning}` : formula.meaning,
      tokens: [...new Set([...tokens, '×', '÷', '+', '−'])].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      options: [formula.equation, formulas[(index + 1) % formulas.length].equation,
        formula.wrong].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    }
  }))
