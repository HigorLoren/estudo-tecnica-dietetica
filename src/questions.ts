export type Question = {
  id: string
  subject: string
  topic: string
  type: 0 | 1 | 2
  prompt: string
  options?: string[]
  answer: string
  numeric?: number
  unit?: string
  accepted?: string[]
  incomplete?: string[]
  formula?: string
  explanation: string
  caution: string
  source: string
}

const aula6 = 'Aula 6 · 11/09/2026'
const aula5 = 'Aula 5 · 04/09/2026'
const elaborated = 'Questão autoral baseada no conteúdo da aula'

export const questions: Question[] = [
  {
    id: 'fc-calculo', subject: 'indicadores', topic: 'Fator de correção', type: 2,
    prompt: 'Uma UAN comprou 12 kg de cenoura. Depois da limpeza e retirada das cascas, restaram 10 kg. Qual é o fator de correção (FC)?',
    answer: '1,20', numeric: 1.2, formula: 'FC = PB ÷ PL = 12 ÷ 10 = 1,20',
    explanation: 'Os 12 kg são o peso bruto, antes do pré-preparo. Os 10 kg são o peso líquido, utilizável. O FC relaciona a quantidade comprada à quantidade limpa.',
    caution: 'Não inverta a divisão: neste caso, houve perda e o FC deve ser maior que 1.',
    source: `${aula6} · parte 1, subparte 1 · 14:48–15:54. ${elaborated}.`,
  },
  {
    id: 'fc-peso-liquido', subject: 'indicadores', topic: 'Peso líquido', type: 2,
    prompt: 'Um lote de hortaliças tem peso bruto de 18 kg e FC de 1,50. Quantos quilogramas estarão disponíveis após o pré-preparo?',
    answer: '12 kg', numeric: 12, unit: 'kg', formula: 'PL = PB ÷ FC = 18 ÷ 1,50 = 12 kg',
    explanation: 'Dividir o peso bruto pelo FC desconta as perdas de limpeza. O resultado é a parte utilizável antes da cocção.',
    caution: 'Multiplicar por FC daria 27 kg, um ganho incompatível com a retirada de aparas.',
    source: `${aula6} · parte 1, subparte 2 · 11:24–13:25. ${elaborated}.`,
  },
  {
    id: 'fc-peso-bruto', subject: 'indicadores', topic: 'Quantidade a comprar', type: 2,
    prompt: 'Você precisa de 8 kg de cenoura limpa para uma preparação. O FC é 1,25. Quantos quilogramas de cenoura devem ser retirados do estoque, antes da limpeza?',
    answer: '10 kg', numeric: 10, unit: 'kg', formula: 'PB = PL × FC = 8 × 1,25 = 10 kg',
    explanation: 'O pedido se refere à cenoura já limpa, portanto é o PL. Multiplicar pelo FC inclui o peso que será perdido no pré-preparo.',
    caution: 'Identifique a etapa do alimento no enunciado antes de escolher a operação.',
    source: `${aula6} · parte 1, subparte 2 · 19:07–22:30. ${elaborated}.`,
  },
  {
    id: 'fc-interpretacao', subject: 'indicadores', topic: 'Perdas no pré-preparo', type: 0,
    prompt: 'Um alimento tem FC de 1,25. Qual interpretação está correta?',
    options: ['Para obter 1 kg limpo, é preciso comprar 1,25 kg.',
      'O alimento ganha 25% de peso durante a cocção.',
      'Para obter 1 kg limpo, é preciso comprar 0,80 kg.',
      'O FC representa a quantidade de água absorvida.'],
    answer: 'Para obter 1 kg limpo, é preciso comprar 1,25 kg.',
    formula: 'PB = FC × PL = 1,25 × 1 = 1,25 kg',
    explanation: 'O FC relaciona os pesos bruto e líquido no pré-preparo. Para cada quilograma utilizável, são necessários 1,25 kg comprados.',
    caution: 'FC não mede cocção. Neste exemplo, a perda é 0,25 ÷ 1,25 = 20% do peso bruto.',
    source: `${aula6} · parte 1, subparte 1 · 14:48–15:54. ${elaborated}.`,
  },
  {
    id: 'ic-calculo', subject: 'indicadores', topic: 'Índice de conversão', type: 2,
    prompt: 'Uma carne pesa 10 kg já limpa, antes de assar, e 7,5 kg depois de assada. Qual é o índice de conversão (IC)?',
    answer: '0,75', numeric: 0.75, formula: 'IC = peso cozido ÷ PL cru = 7,5 ÷ 10 = 0,75',
    explanation: 'O peso depois da cocção fica no numerador. A carne perdeu peso, por isso o índice é menor que 1.',
    caution: 'Não coloque o maior número em cima só por ele ser maior. A etapa do alimento define a fórmula.',
    source: `${aula6} · parte 1, subparte 2 · 14:46–18:03. ${elaborated}.`,
  },
  {
    id: 'ic-interpretacao', subject: 'indicadores', topic: 'Índice de conversão', type: 1,
    prompt: 'Um arroz que aumenta de peso por absorção de água durante a cocção apresenta IC menor que 1.',
    options: ['Verdadeiro', 'Falso'], answer: 'Falso',
    explanation: 'Se o peso cozido é maior que o peso líquido cru, a divisão produz IC maior que 1. O arroz absorve água durante o cozimento.',
    caution: 'IC menor que 1 indica perda de peso; IC maior que 1 indica ganho de peso.',
    source: `${aula5} · parte 2 · 01:01–08:20. ${elaborated}.`,
  },
  {
    id: 'ic-rendimento', subject: 'indicadores', topic: 'Rendimento na cocção', type: 2,
    prompt: 'Há 600 g de filé de peixe limpo. O IC do preparo é 0,70. Qual será o rendimento após a cocção, em gramas?',
    answer: '420 g', numeric: 420, unit: 'g', formula: 'Rendimento = PL × IC = 600 × 0,70 = 420 g',
    explanation: 'O peso líquido cru multiplicado pelo índice de conversão resulta no peso pronto. Como o IC é menor que 1, o rendimento é menor que o peso inicial.',
    caution: 'O FC trata do pré-preparo; o IC trata da transformação do peso no preparo.',
    source: `${aula5} · parte 2 · 12:26–21:04. ${elaborated}.`,
  },
  {
    id: 'per-capita-porcao', subject: 'indicadores', topic: 'Per capita e porção', type: 0,
    prompt: 'Na ficha de uma preparação, o que distingue per capita de porção?',
    options: ['Per capita é o alimento cru e limpo por pessoa; porção é o alimento pronto por pessoa.',
      'Per capita é o total comprado; porção é o total de perdas.',
      'Per capita e porção são sempre iguais.',
      'Per capita é o alimento pronto; porção é o alimento bruto.'],
    answer: 'Per capita é o alimento cru e limpo por pessoa; porção é o alimento pronto por pessoa.',
    explanation: 'Per capita refere-se à quantidade individual antes do preparo final, em peso líquido cru. Porção refere-se à quantidade individual pronta para consumo.',
    caution: 'Não use o peso bruto como per capita nesta convenção da disciplina.',
    source: `${aula6} · parte 1, subparte 1 · 21:21–31:04. ${elaborated}.`,
  },
  {
    id: 'porcao-calculo', subject: 'indicadores', topic: 'Cálculo da porção', type: 2,
    prompt: 'O per capita de arroz cru e limpo é 60 g e o IC é 2,50. Qual é a porção pronta por pessoa, em gramas?',
    answer: '150 g', numeric: 150, unit: 'g', formula: 'Porção = per capita × IC = 60 × 2,50 = 150 g',
    explanation: 'O IC transforma a quantidade individual crua e limpa na quantidade individual pronta. A água absorvida explica o aumento de peso.',
    caution: 'Esta é a porção individual. Para obter o rendimento total, multiplique pelo número de refeições.',
    source: `${aula6} · parte 1, subparte 1 · 21:21–31:04. ${elaborated}.`,
  },
  {
    id: 'rendimento-total', subject: 'indicadores', topic: 'Rendimento total', type: 2,
    prompt: 'Uma UAN vai servir 200 refeições, com porções prontas de 150 g de arroz. Qual é o rendimento total necessário, em quilogramas?',
    answer: '30 kg', numeric: 30, unit: 'kg', formula: 'Rendimento = 150 × 200 = 30.000 g = 30 kg',
    explanation: 'Multiplique a quantidade pronta por pessoa pelo número de refeições. Depois, divida o total em gramas por 1.000 para obter quilogramas.',
    caution: 'O resultado solicitado é em kg. 30.000 é o total em g, não em kg.',
    source: `${aula5} · parte 2 · 28:52–35:04. ${elaborated}.`,
  },
  {
    id: 'compra-uan', subject: 'indicadores', topic: 'Compra para UAN', type: 2,
    prompt: 'Calcule a compra de carne para 100 refeições, com per capita de 120 g, FC de 1,20 e margem de segurança de 10%. Responda em quilogramas.',
    answer: '15,84 kg', numeric: 15.84, unit: 'kg',
    formula: 'Compra = 100 × 120 × 1,20 × 1,10 ÷ 1.000 = 15,84 kg',
    explanation: 'A quantidade limpa total é 12 kg. Com as perdas de pré-preparo, a compra é 14,40 kg. Acrescentar 10% significa multiplicar por 1,10: 15,84 kg.',
    caution: 'Inclua tanto o FC quanto a margem de segurança e confira a conversão de g para kg.',
    source: `${aula6} · parte 1, subparte 2 · 03:23–04:23. ${elaborated}.`,
  },
  {
    id: 'custo-real', subject: 'indicadores', topic: 'Custo aparente e real', type: 2,
    prompt: 'Um alimento custa R$ 8,00 por kg comprado e tem FC de 1,25. Qual é o custo real por kg utilizável, em reais?',
    answer: 'R$ 10,00', numeric: 10, unit: 'R$',
    formula: 'Custo real por kg líquido = preço por kg bruto × FC = 8 × 1,25 = R$ 10,00',
    explanation: 'Para obter 1 kg utilizável, é preciso comprar 1,25 kg. O preço pago por essa quantidade é R$ 10,00. O custo aparente é R$ 8,00 por kg comprado.',
    caution: 'Compare fornecedores pelo custo da parte utilizável, considerando as perdas, e não apenas pelo preço de compra.',
    source: `${aula6} · parte 1, subparte 2 · 05:29–10:01. ${elaborated}.`,
  },
  {
    id: 'ier-calculo', subject: 'indicadores', topic: 'Indicador de reidratação', type: 2,
    prompt: 'Após ficar de molho e ser escorrido, um lote de feijão passou de 500 g secos para 1.000 g hidratados. Qual é o indicador de reidratação (IER)?',
    answer: '2,00', numeric: 2, formula: 'IER = peso hidratado escorrido ÷ peso seco = 1.000 ÷ 500 = 2,00',
    explanation: 'O alimento hidratado e escorrido pesa o dobro do alimento seco. O indicador mede o ganho de peso na hidratação, antes da cocção.',
    caution: 'Use o alimento escorrido. A água livre do recipiente não entra no peso hidratado.',
    source: `${aula5} · parte 2 · 22:14–26:48. ${elaborated}.`,
  },
  {
    id: 'fundamentos-objetivos', subject: 'fundamentos', topic: 'Objetivos do preparo', type: 0,
    prompt: 'Qual conjunto de objetivos orienta o preparo dos alimentos em Técnica Dietética?',
    options: ['Valor nutritivo, digestibilidade, sabor e apresentação que favoreçam a aceitação.',
      'Apenas reduzir o custo, independentemente da qualidade.',
      'Usar sempre a maior temperatura disponível.',
      'Eliminar a necessidade de pesar ingredientes.'],
    answer: 'Valor nutritivo, digestibilidade, sabor e apresentação que favoreçam a aceitação.',
    explanation: 'As técnicas de preparo devem conciliar valor nutritivo, digestibilidade e características sensoriais que favoreçam a aceitação da preparação.',
    caution: 'O custo é relevante, mas não substitui os objetivos nutricionais e sensoriais.',
    source: 'Anotações · Aula 3: Técnicas Básicas de Cozinha · Contexto. Questão autoral.',
  },
  {
    id: 'pesos-tara', subject: 'pesos', topic: 'Pesagem e tara', type: 1,
    prompt: 'Ao pesar um alimento em um recipiente, tarar a balança desconta o peso do recipiente para que a leitura corresponda apenas ao alimento.',
    options: ['Verdadeiro', 'Falso'], answer: 'Verdadeiro',
    explanation: 'A sequência é ligar e zerar, colocar o recipiente, tarar e acrescentar o alimento. A leitura após a tara corresponde ao alimento.',
    caution: 'Sem tarar ou descontar o recipiente, o peso anotado inclui a embalagem.',
    source: 'Anotações · Aula 2: Pesos e Medidas · Técnicas de mensuração. Questão autoral.',
  },
  {
    id: 'pre-preparo-organizacao', subject: 'pre-preparo', topic: 'Organização da cozinha', type: 2,
    prompt: 'Qual é o termo culinário para a organização prévia dos ingredientes e utensílios antes de executar uma preparação?',
    answer: 'Mise en place', accepted: ['mise en place'], incomplete: ['mise'],
    explanation: 'Mise en place é a organização prévia dos ingredientes e utensílios, que prepara o trabalho antes da execução da receita.',
    caution: 'O termo se refere à organização, não a um método de cocção.',
    source: 'Anotações · Aula 3: Técnicas Básicas de Cozinha · Pré-preparo. Questão autoral.',
  },
  {
    id: 'coccao-transferencia', subject: 'coccao', topic: 'Transferência de calor', type: 0,
    prompt: 'A circulação de água aquecida em uma panela transporta calor pelo movimento do líquido. Qual forma de transferência de calor está sendo descrita?',
    options: ['Condução', 'Convecção', 'Radiação', 'Reidratação'], answer: 'Convecção',
    explanation: 'Na convecção, o movimento de massas aquecidas de líquido ou gás transporta calor. Na condução, o calor passa entre regiões em contato.',
    caution: 'Uma preparação pode envolver mais de um mecanismo. Aqui, o enunciado destaca o movimento da água.',
    source: 'Anotações · Aula 6: Métodos de Cocção · Transferência de calor. Questão autoral.',
  },
  {
    id: 'ficha-peso-receita', subject: 'ficha', topic: 'Peso na ficha técnica', type: 1,
    prompt: 'Na atividade de ficha técnica de macarrão alho e óleo, os pesos dos ingredientes descritos na receita correspondem ao peso líquido (PL).',
    options: ['Verdadeiro', 'Falso'], answer: 'Verdadeiro',
    explanation: 'A lista orienta explicitamente que o descrito na receita é o PL. Para ingredientes com perdas, o PB deve ser calculado com o FC.',
    caution: 'Não copie o PL como PB quando há perdas no pré-preparo.',
    source: 'Lista de exercícios TD I · 2026 · item 25. Questão adaptada.',
  },
]
