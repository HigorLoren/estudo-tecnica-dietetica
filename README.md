# Estudo de Técnica Dietética

Uma plataforma de estudos em português para praticar os conceitos de Técnica Dietética, revisar dúvidas e memorizar fórmulas. O conteúdo reúne questões, explicações e recursos interativos para apoiar o estudo individual.

**[Acessar o site](https://estudo-tecnica-dietetica.vercel.app)**

## O que é possível fazer

- Montar testes por assunto e tipo de questão, conferir respostas e revisar erros.
- Consultar o banco de questões e praticar perguntas individualmente.
- Explorar a relação entre peso bruto, peso líquido, fator de correção e índice de cocção em um simulador visual.
- Consultar dicas, explicações e referências por assunto.
- Treinar a memorização de fórmulas com cartões e autoavaliação.

Não é necessário criar uma conta. As configurações, o histórico e o teste em andamento são salvos no navegador utilizado; por isso, não são sincronizados entre dispositivos.

## Como rodar

É necessário ter **Node.js 22.18 ou mais recente** e npm instalados. O projeto foi desenvolvido com Preact, TypeScript e Vite.

```bash
# Na pasta do projeto
npm ci
npm run dev
```

Abra no navegador o endereço local exibido pelo Vite. Para acessar o site publicado, use o link no início deste documento.

### Verificações e versão de produção

```bash
npm test              # Executa os testes
npm run lint          # Verifica o código com ESLint
npm run typecheck     # Verifica os tipos TypeScript
npm run build         # Executa lint e typecheck e gera a versão de produção em dist/
npm run preview       # Serve localmente a versão gerada pelo build
npm run build:readable # Gera um build legível separado, com source maps
npm run preview:readable # Serve localmente o build legível
```

Execute `npm run build` antes de `npm run preview`. O build legível fica em `dist-readable/` e mantém nomes de funções e classes quando possível, sem minificação; gere-o antes de usar `preview:readable`. O projeto inclui configuração de deploy na Vercel em `vercel.json`.

## Organização

```text
src/       Telas, componentes, estilos, dados e regras de estudo
public/    Arquivos estáticos, como ícones
tests/    Testes automatizados e dados de apoio
docs/     Especificação da plataforma e validação do conteúdo
```

Em `src/`, arquivos com sufixo `-screen.tsx` representam telas; arquivos `-model.ts` concentram regras e cálculos; e arquivos como `questions.ts`, `formula-data.ts` e `tips-data.ts` organizam o conteúdo de estudo. O ponto de entrada é `src/main.tsx`, e `src/app.tsx` conecta a navegação e os fluxos principais.

A [especificação da plataforma](docs/spec-plataforma-de-estudos.md) detalha os fluxos e as regras da aplicação. A [validação de conteúdo](docs/validacao-conteudo-2026-10-09.md) registra a revisão realizada em 9 de outubro de 2026.

## Dados e conteúdo

O aplicativo funciona sem servidor próprio ou cadastro. O progresso fica no armazenamento local do navegador e pode ser perdido se os dados do site forem apagados. O material foi preparado para apoiar o estudo e deve ser consultado junto às orientações da disciplina e às fontes indicadas.

## Contribuir

Consulte [como contribuir](CONTRIBUTING.md) para orientações sobre alterações, validação e cuidados com o conteúdo. O GitHub Actions executa testes e build em pushes e pull requests.
