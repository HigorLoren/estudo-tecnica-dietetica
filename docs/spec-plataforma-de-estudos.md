# Spec: plataforma de estudos da disciplina Técnica Dietética

## 1. Objetivo e escopo

A aplicação deve ajudar o estudante a consultar conteúdo, praticar ativamente, entender suas respostas e voltar aos assuntos em que teve dificuldade.

## 2. Conceito do produto

Aplicação web em português, voltada ao estudo individual, com quatro entradas principais:

- **Praticar:** montar testes, revisar erros e acessar perguntas individualmente.
- **Explorar:** investigar materiais visuais e consultar informações livremente.
- **Dicas:** encontrar explicações curtas, comparações, macetes e fontes.
- **Decorar fórmulas:** praticar a recuperação de equações com flashcards, avaliar a facilidade de lembrar e repetir até todos os cartões receberem a nota máxima.

O ciclo principal é: escolher conteúdo → responder → receber correção e explicação → concluir o teste → revisar dificuldades.

O uso atual dispensa cadastro. Configurações, histórico por questão e teste em andamento ficam no navegador utilizado.

## 3. Mapa das telas e navegação

| Tela                  | Entrada                                             | Ações e destinos principais                                    |
| --------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| Configuração do teste | Início e aba Praticar                               | Iniciar teste, retomar teste salvo, revisar erros, abrir banco |
| Banco de questões     | Configuração, resultado ou retorno da prática livre | Filtrar, abrir pergunta, voltar à configuração                 |
| Questão / prática     | Iniciar teste ou selecionar pergunta no banco       | Responder, conferir, usar “Não sei”, avançar                   |
| Resultado             | Conclusão de um teste                               | Consultar correções, montar outro teste, abrir banco           |
| Exploração            | Aba Explorar                                        | Escolher exemplo, ajustar índices, voltar à prática            |
| Decorar fórmulas      | Aba Decorar fórmulas ou `?pagina=formulas`           | Revelar resposta, avaliar lembrança, retomar ou reiniciar treino |
| Dicas                 | Aba Dicas ou link direto                            | Buscar, navegar por assuntos, consultar referências            |

O cabeçalho acompanha as telas e contém marca, nome da matéria e navegação por modo. Banco, questão e resultado pertencem ao modo Praticar.

A navegação principal usa estado da aplicação. Dicas tem acesso direto por `?pagina=dicas` e suporte a âncoras de assunto;
Decorar fórmulas tem acesso direto por `?pagina=formulas`; as demais telas não têm URLs individuais implementadas.

## 4. Especificação das telas

### 4.1. Configuração do teste

**Objetivo:** permitir que o aluno escolha o recorte e o ritmo da prática, entendendo o tamanho e a pontuação antes de começar.

**Composição:**

- Título e orientação breve.
- Bloco de retomada, se existir um teste salvo, com quantidade respondida e botão “Continuar teste”.
- Formulário com modos de prática, seleção de categorias e seleção de tipos de questão.
- Resumo com quantidade solicitada, disponibilidade, quantidade efetiva, valor por questão e nota máxima.
- Botão principal para começar o teste ou a revisão.
- Indicadores de questões já praticadas e questões pendentes de revisão.
- Bloco de acesso à base de perguntas.

**Modos mutuamente exclusivos:**

| Modo               | Comportamento                                              |
| ------------------ | ---------------------------------------------------------- |
| Montar um teste    | Sorteia perguntas entre as categorias e tipos selecionados |
| Revisar meus erros | Usa perguntas cuja última tentativa não foi correta        |

**Interações e regras:**

1. Categorias e tipos aceitam seleção múltipla e podem ser combinados.
2. Alterar filtros ou quantidade atualiza imediatamente o resumo.
3. A quantidade é inteira e tem mínimo de uma pergunta.
4. A quantidade efetiva é o menor valor entre quantidade solicitada e perguntas disponíveis.
5. Não há repetição de pergunta dentro do mesmo teste.
6. Sem perguntas elegíveis, o botão de início fica desabilitado e a tela explica como ajustar a seleção.
7. Na revisão sem erros elegíveis, orientar a ampliar os filtros ou montar outro teste.
8. Começar outro teste substitui a sessão salva; a interface informa isso junto ao botão.
9. Salvar a configuração utilizada para preencher a próxima visita.

Categorias, unidades ou assuntos da matéria. Os nomes das categorias pertencem ao conteúdo, sem alterar o fluxo da tela.

### 4.2. Banco de questões

**Objetivo:** permitir que o aluno consulte as perguntas e escolha livremente o que praticar.

**Composição:** título, descrição curta, filtros de categoria, tipo e origem,
lista agrupada por categoria e ação “Montar teste”.

Cada grupo mostra nome e quantidade de perguntas. Cada item é clicável e apresenta enunciado, tipo e identificação de origem, quando existente, como número de simulado ou item de roteiro.

**Comportamento:**

- Os filtros têm opção “Todos” e aceitam uma escolha por filtro nesta tela.
- Origem distingue adaptações da lista da professora de questões autorais.
- Combinar filtros restringe a lista e atualiza os grupos exibidos.
- Não exibir grupos vazios; se a lista inteira estiver vazia, mostrar mensagem explícita.
- Selecionar uma pergunta abre a prática livre naquela questão.
- A prática livre permite navegar pelo banco completo.

### 4.3. Questão e prática

**Objetivo:** concentrar a atenção em uma pergunta, possibilitar a resposta e explicar a correção antes de avançar.

A mesma tela atende ao teste e à prática livre, com diferenças de navegação e pontuação.

**Composição comum:**

- Posição atual e total de questões.
- Tipo de questão e, no teste, valor em pontos.
- Barra de progresso.
- Enunciado e instrução; nas lacunas, o enunciado pode integrar o próprio formulário.
- Material visual opcional.
- Área de resposta, ações e feedback.

As respostas escritas são corrigidas por respostas e variantes cadastradas.

**Variações de layout:**

- Pergunta textual: conteúdo centralizado em uma coluna de leitura.
- Pergunta com imagem: imagem e painel de resposta no espaço de prática.
- Pergunta com modelo interativo: visualizador e painel de resposta, com controles próprios.
- Em telas estreitas, organizar o material e a resposta verticalmente.

**Fluxo de resposta:**

1. O estudante preenche a resposta ou seleciona um marcador.
2. “Conferir resposta” só fica disponível com os campos necessários preenchidos e o recurso interativo pronto, quando exigido.
3. Antes de conferir, o estudante pode escolher “Não sei”.
4. Ao conferir ou escolher “Não sei”, registrar uma tentativa e bloquear a edição daquela resposta.
5. Mostrar o estado da resposta, a explicação e o gabarito quando necessário.
6. O botão principal passa a “Próxima questão” ou “Ver resultado” na última pergunta do teste.

**Feedback:**

- Correta: indicação positiva e explicação.
- Incompleta: aviso específico, resposta completa esperada e indicação de que não conta como acerto.
- Incorreta: indicação de erro, gabarito e explicação.
- Não informada: tratar como não acerto e mostrar a correção.
- Quando houver conteúdo complementar, apresentar explicação adicional sobre o assunto após uma resposta não correta.

Não depender apenas de cores: combinar texto e símbolos para comunicar o resultado.

**Prática livre:** incluir retorno ao banco e seletor “Ir para questão”. O seletor permite saltar para qualquer pergunta; no celular, usa rótulos mais curtos. Ao terminar a sequência, a ação permite voltar à primeira questão. As tentativas alimentam o histórico de revisão, mas a prática livre não gera a tela de nota final nem uma sessão persistida própria.

### 4.4. Resultado do teste

**Objetivo:** resumir o desempenho e permitir consultar cada correção.

**Composição:** título “Prática concluída”, nota em destaque de 0 a 10, quantidade de acertos, total de perguntas e valor por questão. Quando todas as respostas forem corretas, apresentar uma mensagem de conclusão positiva.

Exibir uma lista expansível por pergunta. O resumo de cada item contém enunciado, indicador de correção e pontos obtidos/possíveis. Ao expandir, mostrar:

- Resposta do estudante ou “Não sei”.
- Resposta correta.
- Aviso de resposta incompleta, quando aplicável.
- Motivo da correção, quando disponível.
- Explicação da pergunta.

As ações finais são “Montar outro teste” e “Abrir banco de questões”. A revisão dos erros fica disponível pelo modo correspondente na configuração do próximo teste.

### 4.5. Exploração livre

**Objetivo:** permitir a investigação de materiais sem exigir respostas ou atribuir nota.

**Primeira implementação:** simulador visual de peso bruto, peso líquido e peso cozido.
Oferece três exemplos ilustrativos, controles de PB, FC e IC, colunas proporcionais aos pesos,
perda na limpeza e variação na cocção. Alterações atualizam o diagrama e os cálculos imediatamente.
O botão “Restaurar exemplo” recupera os valores do exemplo selecionado. Os índices apresentados
não são uma tabela técnica de alimentos. Esta exploração não registra tentativas nem altera a
sessão do teste. “Praticar indicadores” abre o banco filtrado pelo assunto; “Consultar dicas e
fontes” abre Dicas. Ao recarregar, a aplicação volta à configuração, como nas demais telas
sem URL individual.

**Experiência:** espaço de visualização, controles e informações sobre o material selecionado.

O visualizador também é reutilizado em exercícios, com marcadores e alvos preparados por pergunta. Algumas questões oferecem estruturas vizinhas como apoio.

**Estados para materiais externos:** carregamento, material pronto e falha com botão
“Tentar novamente”. O simulador inicial usa elementos locais e não depende de carregar arquivos.

**Generalização:** manter a ideia de exploração de materiais como módulo opcional. A matéria pode utilizar imagens, diagramas ou outros recursos adequados ao conteúdo.

### 4.6. Dicas e consulta rápida

**Objetivo:** responder dúvidas pontuais e ajudar a distinguir conceitos parecidos.

**Composição:** título e introdução, campo de busca, índice por grupos de assunto, contagem de tópicos encontrados, cartões de conteúdo e seção de material e fontes.

**Estrutura dos tópicos:** título, resposta ou conceito principal, macete de memorização, explicação, orientação de reconhecimento/aplicação e alerta de confusão, conforme o conteúdo disponível. Podem incluir diagramas, imagens com legenda, tabelas comparativas e referências.

**Comportamento:**

- Buscar no conteúdo dos tópicos ignorando acentos e diferenças de maiúsculas.
- Filtrar tópicos e grupos conforme a busca, com contagem atualizada.
- Mostrar mensagem quando nada for encontrado e oferecer “Limpar busca”.
- Navegar pelo índice para uma seção e atualizar a âncora na URL.
- Ao selecionar um assunto no índice, limpar a busca para revelar a seção.
- Permitir abrir a página diretamente e manter seu acesso após recarregar.
- Carregar imagens sob demanda e oferecer ampliação quando disponível.
- Exibir fontes junto aos tópicos e distinguir associações de memorização de referências de conteúdo.

### 4.7. Decorar fórmulas

**Objetivo:** lembrar as equações e reconhecer quando usá-las, com um cartão
por vez e autoavaliação da lembrança. Substitui o modo Repetição espaçada.
As dicas das questões e seu histórico de revisão permanecem como estão.

O catálogo inicial contém 17 fórmulas de FC, PB/PL, perda absoluta e percentual,
IC e inversas, IR/IER e inversas, per capita/porção, rendimento, compra,
margem solicitada de 10% e custo real. Cada fórmula tem seis cartões, totalizando
102 cartões com IDs e avaliações independentes:

- Completar a fórmula: preencher o termo ausente.
- Montar a fórmula: arrastar termos e operadores para uma área de montagem,
  reordenar as peças, remover ao arrastar e soltar fora da caixa e desfazer,
  com alternativa por toque e teclado. Soltar uma peça da lista fora da caixa não
  altera a fórmula; cancelar um arraste não remove a peça.
- Escrever de memória: digitar a equação inteira.
- Encontrar o erro: receber uma equação incorreta já montada e corrigir por
  arraste, reordenação, remoção ou adição de peças, com validação automática.
- Escolher pelo enunciado: selecionar a equação adequada, sem calcular, e
  receber feedback de acerto, erro ou ausência de seleção, com resposta esperada.
- Explicar o significado: explicar os termos e a relação entre eles.

Na montagem, manter a fórmula em uma única linha. Ajustar automaticamente o
tamanho do texto das peças e o espaçamento entre letras conforme a largura
disponível, com fonte mínima de 12 px e espaçamento mínimo de −0,3 px.
Quando ainda houver conteúdo excedente, exibir uma barra horizontal própria
enquanto existir overflow, inclusive no iPhone, permitindo navegar pela fórmula.

**Fluxo:** tentar lembrar → revelar resposta → comparar → avaliar → próximo cartão.
A resposta escrita é opcional, permitindo revelar quando o aluno não lembrar.
Após revelar, bloquear a edição e mostrar a resposta e a explicação. A avaliação
é do estudante, considerando a lembrança anterior à revelação; os métodos Montar a fórmula, Encontrar o erro e Escolher pelo enunciado têm
correção automática ao conferir, distinguindo acerto,
erro e ausência de resposta. Aceitar os dois lados da igualdade trocados e a ordem
de fatores multiplicativos sem inverter divisões ou subtrações. Os outros métodos
continuam com comparação e autoavaliação. O feedback de acerto não atribui
automaticamente uma nota de lembrança.

| Nota | Avaliação | Retorno à fila |
| --- | --- | --- |
| 1 | Não lembrei | Após 1 outro cartão, quando possível |
| 2 | Lembrei pouco | Após 3 outros cartões, quando possível |
| 3 | Lembrei com esforço | Após 6 outros cartões, quando possível |
| 4 | Lembrei bem | Após 10 outros cartões, quando possível |
| 5 | Lembrei fácil | Retirar do treino |

**Algoritmo:** embaralhar os 102 cartões com uma semente própria do treino e
salvar essa ordem. Cada fórmula pertence a um grupo de indicador: pesos e
limpeza (FC), cocção (IC), reidratação (IR), porções e rendimento ou compra e custo.
Quando houver outro grupo pendente, não entregar dois cartões do mesmo grupo
seguidos. Se restar somente um grupo, alternar seus cartões enquanto possível.

As notas de 1 a 4 programam o retorno do cartão em posições virtuais, conforme a
tabela acima. A nota também atualiza a força de lembrança do grupo: na primeira
avaliação, usar a própria nota; nas seguintes, combinar 60% da força anterior com
40% da nota recente. Grupos sem avaliação começam com força 3. Sortear entre os
grupos elegíveis com peso `6 − força`: quanto menor a lembrança, maior a frequência,
sem retirar por completo os demais grupos.

Dentro do grupo escolhido, combinar revisão com reforço de fórmulas relacionadas:
40% de preferência por cartões ainda não apresentados e 60% por cartões praticados
com retorno disponível, usando o conjunto disponível se um deles estiver vazio.
Priorizar retornos mais antigos e desempatar pela ordem embaralhada. Os cartões
com nota 5 ficam fora da seleção. Se não houver cartões disponíveis no grupo
alternativo, avançar até o retorno mais próximo, sem espera por horário ou dia.
Os intervalos são referências de prioridade; a mistura entre indicadores e suas
frequências adaptativas determinam a distância efetiva entre repetições.

**Progresso:** salvar automaticamente nota e quantidade de tentativas por cartão,
posições da fila, ordem embaralhada, semente, cartões recentes e força de lembrança
por grupo, além do cartão atual, rascunho e estado de revelação no navegador.
Migrar treinos antigos preservando avaliações e a resposta em andamento.
Recuperar cartões válidos e incluir novos cartões como pendentes. O treino só
termina quando todos os cartões do catálogo ativo tiverem nota 5. Mostrar
contagem de cartões com nota máxima e ação para treinar novamente. Reiniciar
exige confirmação na interface e afeta somente este modo. Falhas de armazenamento
usam o aviso global e permitem continuar em memória.

## 5. Regras transversais

### 5.1. Correção e pontuação

Cada teste vale 4 pontos. Para `N` perguntas, cada acerto vale `4 / N`; a nota é `acertos × 4 / N`. A interface exibe até duas casas decimais no formato brasileiro, mas o cálculo utiliza o valor sem arredondamento intermediário.

Respostas incompletas, incorretas, “Não sei” e tempo esgotado valem zero.

A correção textual normaliza acentos, maiúsculas, espaços extras e ponto ou exclamação finais. Sinônimos e respostas incompletas são cadastrados explicitamente. Perguntas com vários termos podem definir variantes por grupo e se a ordem importa. Abreviações anatômicas existentes são específicas da matéria e não devem virar regras universais.

### 5.2. Revisão de erros

Manter, por ID de pergunta, quantidade de tentativas, quantidade acumulada de erros e se a última tentativa foi correta.

- Entram na revisão somente perguntas praticadas cuja última tentativa não foi correta.
- Respostas incompletas, omissões e tempo esgotado entram como erros nesse histórico.
- Um novo acerto remove a pergunta da revisão, preservando suas contagens anteriores.
- Respeitar os filtros de categoria e tipo.
- Priorizar as perguntas com mais erros acumulados na seleção.
- Depois de selecionar as perguntas prioritárias até a quantidade solicitada, embaralhar a ordem da revisão.

### 5.4. Persistência e recuperação

Salvar automaticamente no navegador:

- Última configuração de teste.
- Histórico de tentativas e erros por pergunta.
- IDs e ordem das perguntas do teste em andamento.
- Posição atual, respostas confirmadas e rascunho atual.
- Ordem dos marcadores de identificação.

Concluir o teste limpa a sessão em andamento, mantendo o histórico por pergunta. Recarregar a aplicação retorna à configuração, com opção de continuar o teste salvo.

Se o armazenamento falhar, continuar funcionando em memória durante a sessão e avisar que o progresso não pôde ser salvo. Os dados ficam no navegador e dispositivo utilizados; limpar os dados do site remove o histórico.

Versionar os dados e recuperar sessões após mudanças no banco. Remover perguntas que deixaram de existir sem invalidar as demais. Quando não for possível garantir a correspondência dos marcadores antigos, solicitar nova resposta à identificação afetada e informar a recuperação ao aluno.

## 6. Conteúdo e estrutura de dados

Separar conteúdo da lógica de navegação, prática, correção e persistência.

O banco atual inclui adaptações da lista da professora e questões autorais
conferidas nos slides. As referências indicam item, página ou seção. As erratas
encontradas na lista e na apostila são sinalizadas nas explicações e em Dicas.
O registro de validação está em `docs/validacao-conteudo-2026-10-09.md`.
Análise sensorial tem categoria própria. Não tratar índices ou composição de
exercícios específicos como valores universais de alimentos.

| Entidade                                            | Dados principais                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Configuração da matéria, proposta para reutilização | Nome, marca, categorias, rótulos e módulos disponíveis                                     |
| Questão                                             | ID estável, categoria, tipo, enunciado, instrução, gabarito, variantes aceitas, explicação |
| Complementos de questão                             | Origem, respostas incompletas, grupos de termos e regras de ordem                          |
| Recurso visual                                      | Imagem com texto alternativo ou configuração de material interativo                        |
| Tópico de dica                                      | ID, grupo, título, conceito, macete, explicação, alertas, visuais e fontes                 |
| Histórico por questão                               | Tentativas, erros e resultado da última tentativa                                          |
| Sessão de teste                                     | Perguntas ordenadas, posição, respostas, rascunho e estado visual necessário      |

A configuração de matéria acima é uma generalização proposta.

Usar um identificador próprio para o armazenamento de progresso. Contagens de perguntas e assuntos devem vir do conteúdo disponível, sem depender dos números do banco.

## 7. Direção visual e requisitos de interface

Referência visual: fundo claro, texto azul escuro, destaques em azul, bordas discretas, cantos arredondados e bastante espaço para leitura. A tipografia usa uma família sem serifa, com “Avenir Next”, “Segoe UI” e fallback do sistema.

| Uso              | Referência atual |
| ---------------- | ---------------- |
| Texto principal  | `#183648`        |
| Texto secundário | `#637782`        |
| Fundo            | `#f6f9fb`        |
| Destaque e foco  | `#236783`        |

Organizar formulários longos em blocos, manter o resumo do teste reconhecível e dar destaque à ação principal. Perguntas textuais usam largura de leitura menor; conteúdos visuais recebem mais espaço. Dicas usa índice lateral em layouts largos e organização adaptada em telas pequenas.

Requisitos:

- Funcionar em celular, tablet e computador.
- Manter campos e botões confortáveis para toque.
- Preservar rótulos de formulário, estrutura de títulos e foco visível.
- Fornecer texto alternativo para imagens e nomes acessíveis para controles com ícones.
- Comunicar carregamento, falhas, resultados e mudanças de disponibilidade por mensagens de estado.
- Permitir a operação dos formulários por teclado.
- Distinguir claramente ações desabilitadas e explicar estados vazios.

## 8. Escopo sugerido

**Núcleo inicial:** configuração de teste, filtros por assunto e tipo, banco de questões, prática livre, correção imediata, explicações, resultado, revisão de erros, retomada local e dicas com busca e fontes.

**Complementos:** imagens e diagramas nas perguntas, exploração livre de materiais e apoio visual contextual.

Não fazem parte da experiência atual: conta de usuário, sincronização entre dispositivos, painel administrativo de autoria, avaliação de respostas por IA, histórico de notas de todos os testes e ranking. Qualquer inclusão desses recursos exige uma especificação adicional.

## 9. Critérios de aceite

1. O aluno consegue montar um teste combinando assuntos, tipos e quantidade, vendo a disponibilidade antes de começar.
2. Um pedido maior que o banco disponível gera somente perguntas disponíveis, sem repetição.
3. Uma seleção vazia impede o início e mostra orientação.
4. Uma pergunta pode ser praticada diretamente a partir do banco, com navegação livre para outras perguntas.
5. Cada formato apresenta o campo ou seletor correspondente e bloqueia confirmação sem preenchimento obrigatório.
6. A correção distingue resposta correta, incompleta, incorreta e não informada, apresentando explicação e gabarito conforme necessário.
7. Conferir novamente uma resposta já confirmada não duplica a tentativa nem permite alterar a nota daquela tentativa.
8. A nota final respeita a fórmula de 0 a 10, sem conceder pontos para respostas incompletas ou omitidas.
9. O resultado permite expandir qualquer pergunta e comparar resposta dada, gabarito e explicação.
10. Uma questão errada entra na revisão; um acerto posterior a retira; perguntas com mais erros têm prioridade na seleção.
11. Recarregar o navegador permite retomar o teste com ordem, respostas e rascunho preservados.
12. Uma falha de armazenamento não impede a prática e produz aviso ao estudante.
13. A busca de dicas encontra termos independentemente de acentos e capitalização e oferece recuperação quando não há resultados.
14. O acesso direto a Dicas e suas âncoras continua funcionando após recarregar.
15. Em telas pequenas, enunciado, materiais e ações continuam legíveis e utilizáveis.
16. Se o módulo interativo for incluído, seu carregamento e falha são comunicados e há ação para tentar novamente.

17. Decorar fórmulas oferece os seis métodos, com avaliação individual de cada cartão.
18. As cinco notas determinam a fila de retorno e a frequência do indicador; cartões com nota 5 saem do treino.
19. O treino continua enquanto houver qualquer cartão sem nota 5, mesmo que reste só um.
20. Recarregar retoma o cartão, rascunho, revelação e avaliações do treino de fórmulas.
21. O modo de fórmulas não modifica as dicas, notas ou histórico das questões.
22. Embaralhar os cartões e alternar indicadores enquanto houver outro grupo pendente; dificuldade em uma fórmula aumenta a frequência de cartões relacionados.

### Recorte atual da ficha técnica

Nesta versão, mostrar apenas a teoria: objetivos, estrutura, padronização e uso.
Ocultar questões e dicas de preenchimento, cálculos de composição e energia
da ficha técnica em todos os fluxos de estudo. Preservar o catálogo e o histórico
das questões ocultas para eventual reativação.

### Recorte atual de assuntos da prova

Ocultar Análise sensorial das questões, dicas e seletores de assuntos.
Preservar seu catálogo e histórico para eventual reativação. Os assuntos ativos
são objetivos da Técnica Dietética, pesos e medidas, técnicas básicas de cozinha,
indicadores de qualidade no pré-preparo e preparo, métodos de cocção e ficha
técnica somente teórica.

### Fontes e referências na interface

Remover a seção de materiais e fontes, os links de referência nas dicas,
as referências das questões e correções e as fontes do simulador.
Manter os metadados no catálogo para validação interna do conteúdo.

### Dica e revisão por memorização

Cada questão oferece um botão de dica antes da confirmação. Nos cálculos,
mostrar as equações básicas de FC, IC, IR/IER, perdas, per capita, porção,
rendimento, quantidade adquirida e custo real, sem resolver o exercício.
Usar a dica marca a questão como “Não decorada”. O acerto vale na nota,
mas a questão permanece na revisão até um acerto posterior sem dica.
Persistir o uso da dica na sessão, na tentativa e no histórico; incluí-lo
nos filtros e contadores de revisão. A lateral explica esse funcionamento.
