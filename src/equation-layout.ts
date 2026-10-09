function terms(value: string) {
  const tokens: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < value.length; index++) {
    const char = value[index]
    if (char === '(') depth++
    if (char === ')') depth--
    if (depth === 0 && (char === '×' || char === '÷')) {
      tokens.push(value.slice(start, index).trim(), char)
      start = index + 1
    }
  }
  tokens.push(value.slice(start).trim())
  return tokens
}

function equation(value: string) {
  const separator = value.indexOf('=')
  if (separator < 0) return null
  const label = value.slice(0, separator).trim()
  const right = value.slice(separator + 1).trim()
  const resultAt = right.search(/[=≈]/)
  return {
    tokens: [label, '=', ...terms(resultAt < 0 ? right : right.slice(0, resultAt))],
    result: resultAt < 0 ? null : right.slice(resultAt).trim(),
  }
}

export function alignEquations(formula: string, substitution: string) {
  const general = equation(formula)
  const numeric = equation(substitution)
  if (!general || !numeric || general.tokens.length !== numeric.tokens.length) return null
  const operatorsMatch = general.tokens.every((token, index) =>
    !['=', '×', '÷'].includes(token) || token === numeric.tokens[index])
  return operatorsMatch ? {
    formula: general.tokens, substitution: numeric.tokens, result: numeric.result,
  } : null
}
