export type Tip = {
  id: string
  group: string
  title: string
  concept: string
  formula?: string
  example: string
  memory?: string
  caution: string
  sources: { id: string; passage: string }[]
}

export const tipGroups = [
  { id: 'indicadores', title: 'Indicadores culinários', description: 'O que cada índice mede e como calcular.' },
  { id: 'planejamento', title: 'Planejamento de UAN', description: 'Da quantidade individual à compra e ao custo.' },
  { id: 'calculos', title: 'Leitura dos cálculos', description: 'Etapas, unidades e resultados que fazem sentido.' },
  { id: 'preparo', title: 'Técnicas de preparo', description: 'Consulta rápida aos conceitos básicos da disciplina.' },
]

export const tipSources = [
  { id: 'aula-05', title: 'Aula 5 · 04/09/2026', description: 'Transcrição revisada, parte 2. Indicadores de conversão, reidratação, per capita e porção.', file: 'docs/lecture-transcriptions/2026-09-04_tecnica-dietetica_aula-05_parte-2_iphone13-revisado.txt' },
  { id: 'aula-06-1', title: 'Aula 6 · 11/09/2026 · parte 1', description: 'Transcrição revisada, subparte 1. Fator de correção, conversão, reidratação e quantidades individuais.', file: 'docs/lecture-transcriptions/2026-09-11_tecnica-dietetica_aula-06_parte-1_subparte-1-revisado.txt' },
  { id: 'aula-06-2', title: 'Aula 6 · 11/09/2026 · parte 2', description: 'Transcrição revisada, subparte 2. Compra, margem de segurança, custo real e resolução de exercícios.', file: 'docs/lecture-transcriptions/2026-09-11_tecnica-dietetica_aula-06_parte-1_subparte-2-revisado.txt' },
  { id: 'notas-pesos', title: 'Anotações · Pesos e medidas', description: 'Aula 2. Pesagem, tara e técnicas de mensuração.', file: 'Aulas/Aula 2 - Pesos e Medidas.md' },
  { id: 'notas-tecnicas', title: 'Anotações · Técnicas básicas de cozinha', description: 'Aula 3. Operações de pré-preparo e organização de ingredientes e utensílios.', file: 'Aulas/Aula 3 - Técnicas Básicas de Cozinha.md' },
  { id: 'notas-coccao', title: 'Anotações · Métodos de cocção', description: 'Aula 6. Transferência de calor por condução e convecção.', file: 'Aulas/Aula 6 - Métodos de Cocção, Formas de Transferência de Claro e Valor Nutricional.md' },
]

export const tips: Tip[] = [
  {
    id: 'fator-de-correcao', group: 'indicadores', title: 'Fator de correção: antes e depois da limpeza',
    concept: 'O FC relaciona o peso bruto (PB), como comprado, ao peso líquido (PL), limpo e utilizável antes da cocção. Ele permite prever as perdas do pré-preparo.',
    formula: 'FC = PB ÷ PL',
    example: '12 kg comprados e 10 kg limpos: FC = 12 ÷ 10 = 1,20. Para calcular outras variáveis, use PB = FC × PL ou PL = PB ÷ FC.',
    memory: 'No FC, o alimento como comprado fica em cima. Pense na sequência: comprar, limpar, preparar.',
    caution: 'Não confunda FC com percentual de perda. Com FC de 1,25, a perda é 20% do PB, e não 25%.',
    sources: [{ id: 'aula-06-1', passage: '14:48–15:54' },
      { id: 'aula-06-2', passage: '11:24–15:52' }],
  },
  {
    id: 'indice-de-conversao', group: 'indicadores', title: 'Índice de conversão: o efeito do preparo',
    concept: 'O IC, também chamado índice de cocção ou fator de rendimento, compara o peso processado ou cozido ao peso líquido cru. IC menor que 1 indica perda de peso; maior que 1 indica ganho.',
    formula: 'IC = peso processado ou cozido ÷ PL cru',
    example: '10 kg de carne limpa viram 7,5 kg assados: IC = 7,5 ÷ 10 = 0,75. Para obter o rendimento, use PL × IC.',
    memory: 'No IC, o resultado do preparo fica em cima. Depois dividido por antes.',
    caution: 'Não coloque automaticamente o maior número no numerador. Uma carne que perdeu peso ao assar deve ter IC menor que 1.',
    sources: [{ id: 'aula-05', passage: '01:01–08:20; 12:26–21:04' },
      { id: 'aula-06-2', passage: '14:46–18:03' }],
  },
  {
    id: 'reidratacao', group: 'indicadores', title: 'Reidratação: pese o alimento escorrido',
    concept: 'O indicador de reidratação (IER, também referido como IR) mede a mudança de peso na hidratação de grãos, leguminosas e algumas farinhas, antes da cocção.',
    formula: 'IER = peso hidratado escorrido ÷ peso seco',
    example: '500 g de feijão seco passam a 1.000 g depois do molho e da drenagem: IER = 1.000 ÷ 500 = 2,00.',
    memory: 'Hidratado em cima, seco embaixo. Compare o mesmo alimento nos dois momentos.',
    caution: 'A água livre do recipiente não faz parte do peso hidratado. Hidratação e cocção são etapas diferentes.',
    sources: [{ id: 'aula-05', passage: '22:14–26:48' },
      { id: 'aula-06-1', passage: '20:18–21:21' }],
  },
  {
    id: 'per-capita-e-porcao', group: 'planejamento', title: 'Per capita e porção não são a mesma etapa',
    concept: 'Na convenção usada nesta disciplina, per capita é a quantidade individual crua e limpa, antes do preparo final. Porção é a quantidade individual pronta para consumo.',
    formula: 'Porção = per capita × IC',
    example: '60 g de arroz cru e limpo, com IC de 2,50, rendem uma porção pronta de 150 g. Para 200 refeições, o rendimento total é 150 × 200 = 30.000 g = 30 kg.',
    memory: 'Per capita prepara; porção serve. Este é um apoio para lembrar as etapas.',
    caution: 'O per capita aqui se refere ao peso líquido cru, não ao peso bruto comprado. Leia a convenção e os dados do enunciado.',
    sources: [{ id: 'aula-06-1', passage: '21:21–31:04' },
      { id: 'aula-05', passage: '28:52–35:04' }],
  },
  {
    id: 'compra-uan', group: 'planejamento', title: 'Quanto comprar para uma UAN?',
    concept: 'Multiplique o número de refeições pelo per capita e pelo FC para incluir as perdas do pré-preparo. Quando o exercício pede margem de segurança de 10%, multiplique o resultado por 1,10.',
    formula: 'Compra = refeições × per capita × FC × 1,10',
    example: '100 refeições × 120 g × 1,20 × 1,10 = 15.840 g. Dividindo por 1.000, a compra é 15,84 kg.',
    memory: 'Pessoas, quantidade limpa por pessoa, perdas e margem. Organize os quatro dados antes de calcular.',
    caution: 'A margem de 10% é a usada nesses exercícios, não uma regra obrigatória para toda compra. Inclua-a quando o enunciado pedir.',
    sources: [{ id: 'aula-06-2', passage: '01:11–04:23' }],
  },
  {
    id: 'custo-real', group: 'planejamento', title: 'Preço barato pode ter custo real maior',
    concept: 'Custo aparente é o preço do alimento como comprado, com aparas. O custo real por kg utilizável considera a quantidade que sobra após o pré-preparo.',
    formula: 'Custo real por kg líquido = preço por kg bruto × FC',
    example: 'Um alimento de R$ 8,00/kg com FC de 1,25 tem custo real de R$ 10,00/kg utilizável. Compare fornecedores pelo custo utilizável, além de considerar a qualidade.',
    memory: 'O preço da etiqueta acompanha a compra; o custo real acompanha a parte que você usa.',
    caution: 'Compare preços na mesma unidade. Um preço por embalagem precisa ser convertido antes de compará-lo com um preço por kg.',
    sources: [{ id: 'aula-06-2', passage: '05:29–10:01' }],
  },
  {
    id: 'peso-bruto-e-liquido', group: 'calculos', title: 'Identifique a etapa antes de escolher a fórmula',
    concept: 'Peso bruto é o alimento antes da limpeza; peso líquido é a parte utilizável após o pré-preparo. O peso pronto pertence à etapa de preparo ou cocção.',
    formula: 'PB → pré-preparo → PL cru → preparo → peso pronto',
    example: 'Uma carne foi comprada com 16 kg, ficou com 14 kg limpa e pesou 11,5 kg assada. FC = 16 ÷ 14 = 1,14; IC = 11,5 ÷ 14 = 0,82.',
    memory: 'Anote PB, PL e peso pronto ao lado dos números do enunciado. Só depois escolha a conta.',
    caution: 'FC e IC usam o PL, mas com funções diferentes: denominador no FC e peso inicial no IC.',
    sources: [{ id: 'aula-06-2', passage: '14:46–18:03' }],
  },
  {
    id: 'unidades-e-arredondamento', group: 'calculos', title: 'Gramas, quilogramas e casas decimais',
    concept: 'Use a mesma unidade nos pesos de uma divisão. Para converter gramas em quilogramas, divida por 1.000; para converter kg em g, multiplique por 1.000.',
    formula: '1 kg = 1.000 g',
    example: '120 g × 100 refeições = 12.000 g = 12 kg. Para duas casas decimais, 33,333… vira 33,33; 8,866… vira 8,87.',
    memory: 'Leia a unidade pedida antes de responder. A conta pode estar certa e a unidade final errada.',
    caution: 'Evite arredondar resultados intermediários. Nos exercícios, apresente duas casas decimais e confira se o resultado combina com ganho ou perda de peso.',
    sources: [{ id: 'aula-06-2', passage: '03:23–04:23; 12:24–13:25' }],
  },
  {
    id: 'pesagem-e-tara', group: 'preparo', title: 'Tara: pese o alimento, não o recipiente',
    concept: 'Tarar a balança desconta o peso do recipiente. Ligue e zere a balança, coloque o recipiente, tare e então acrescente o alimento.',
    example: 'Um recipiente pesa 200 g. Depois de tarar, ao adicionar 500 g de alimento, a leitura deve ser 500 g, e não 700 g.',
    caution: 'Sem tara ou desconto do recipiente, o peso registrado inclui a embalagem e altera os cálculos da preparação.',
    sources: [{ id: 'notas-pesos', passage: 'Técnicas de mensuração · Balança' }],
  },
  {
    id: 'mise-en-place', group: 'preparo', title: 'Mise en place: organize antes de executar',
    concept: 'Mise en place é a organização prévia dos ingredientes e utensílios. O pré-preparo também inclui operações de limpeza, divisão e mistura ou união.',
    example: 'Antes de cozinhar, separe utensílios, confira quantidades e prepare os ingredientes necessários para executar a receita.',
    caution: 'Mise en place é organização prévia. Não é uma técnica de cocção nem um sinônimo de cozinhar o alimento.',
    sources: [{ id: 'notas-tecnicas', passage: 'Pré-preparo' }],
  },
  {
    id: 'conducao-e-conveccao', group: 'preparo', title: 'Condução e convecção: como o calor chega',
    concept: 'Na condução, o calor passa entre regiões em contato. Na convecção, o movimento de massas aquecidas de líquido ou gás transporta calor.',
    example: 'O calor atravessando o metal de uma panela exemplifica condução. A circulação da água quente dentro dela exemplifica convecção.',
    memory: 'Convecção tem movimento da massa aquecida. É uma associação para lembrar o mecanismo.',
    caution: 'Um preparo pode combinar mecanismos. Identifique o fenômeno que o enunciado descreve, em vez de atribuir apenas um mecanismo à preparação inteira.',
    sources: [{ id: 'notas-coccao', passage: 'Transferência de calor' }],
  },
]
