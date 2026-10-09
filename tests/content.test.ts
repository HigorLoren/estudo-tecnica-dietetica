import assert from 'node:assert/strict'
import { test } from 'node:test'
import { questions, questionCatalog } from '../src/questions.ts'
import { tips, tipGroups } from '../src/tips-data.ts'
import { filterBankQuestions, subjects } from '../src/study-data.ts'
import { gradeAnswer } from '../src/practice-model.ts'

const byId = (id: string) => questionCatalog.find(question => question.id === id)!

test('teacher calculations accept independently checked rounded results', () => {
  const checked = {
    'lista-07-fc': '1,14', 'lista-08-couve-flor': '8,87', 'lista-09-coxao': '68,25',
    'lista-10-feijao': '47,62', 'lista-10-acem': '1,32', 'lista-10-melancia': '49,78',
    'lista-10-chuchu': '1,69', 'lista-10-cenoura': '18,35',
    'lista-11-cenoura-estoque': '12,20', 'lista-12-batatas': '41,67',
    'lista-13-escarola': '96', 'lista-14-carne': '281,68', 'lista-17-espaguete': '2,83',
    'lista-18-verdura': '0,50', 'lista-19-assado': '0,60', 'lista-20-peixe': '450',
    'lista-22-rendimento-carne': '126,67', 'lista-23-compra': '21,65',
    'lista-24-compra': '72,07', 'lista-25-alho': '36', 'lista-25-porcao-macarrao': '71,43',
    'lista-biscoito-porcoes': '22', 'lista-biscoito-energia': '2403,68',
    'lista-biscoito-energia-porcao': '109,26',
    'lista-34-lavoura': '6,67', 'lista-34-nossa-horta': '6,88', 'lista-34-horta-cidade': '6,69',
  }
  for (const [id, answer] of Object.entries(checked)) {
    assert.equal(gradeAnswer(byId(id), answer), 'correct', id)
  }
  assert.equal(gradeAnswer(byId('lista-13-escarola'), '51'), 'incorrect')
  assert.equal(gradeAnswer(byId('lista-24-compra'), '72,1'), 'incorrect')
  assert.equal(gradeAnswer(byId('lista-22-rendimento-carne'), '166,67'), 'incorrect')
})

test('origin and subject filters combine without excluding old questions by default', () => {
  const teacher = filterBankQuestions({ subject: 'all', type: 'all', origin: 'professora' })
  const authored = filterBankQuestions({ subject: 'all', type: 'all', origin: 'autoral' })
  assert.equal(teacher.length, 23)
  assert.equal(teacher.length + authored.length, questions.length)
  assert.equal(filterBankQuestions({ subject: 'all', type: 'all' }).length, questions.length)
  assert.ok(!teacher.some(question => question.id === 'ficha-peso-receita'))
  const numeric = filterBankQuestions({ subject: 'ficha', type: '2', origin: 'professora' })
  assert.equal(numeric.length, 0)
  assert.equal(filterBankQuestions({ subject: 'sensorial', type: 'all', origin: 'professora' }).length, 0)
})

test('expanded content has valid categories, complete corrections and unambiguous choices', () => {
  assert.equal(new Set(questions.map(question => question.id)).size, questions.length)
  for (const question of questions) {
    assert.ok(subjects.some(subject => subject.id === question.subject), question.id)
    assert.ok(question.explanation && question.caution && question.source, question.id)
    if (question.options) {
      assert.equal(new Set(question.options).size, question.options.length, question.id)
      assert.ok(question.options.includes(question.answer), question.id)
    }
    if (question.numeric !== undefined) assert.ok(Number.isFinite(question.numeric), question.id)
  }
  for (const tip of tips) assert.ok(tipGroups.some(group => group.id === tip.group), tip.id)
  assert.ok(byId('lista-biscoito-energia').caution.includes('9 para lipídeos'))
  assert.ok(byId('revisao-maillard').caution.includes('imprecisa'))
})

test('worksheet practice is hidden while theory and indicator exercises remain available', () => {
  const worksheet = questions.filter(question => question.subject === 'ficha')
  assert.deepEqual(worksheet.map(question => question.id), ['revisao-ficha-objetivos'])
  assert.equal(questionCatalog.length - questions.length, 15)
  assert.deepEqual(tips.filter(tip => tip.group === 'ficha').map(tip => tip.id), ['ficha-tecnica'])
  assert.equal(tips.find(tip => tip.id === 'ficha-tecnica')!.formula, undefined)
  assert.ok(questions.some(question => question.id === 'lista-24-compra'))
})

test('sensory analysis is excluded from every active content list', () => {
  assert.ok(questionCatalog.some(question => question.subject === 'sensorial'))
  assert.ok(!questions.some(question => question.subject === 'sensorial'))
  assert.ok(!subjects.some(subject => subject.id === 'sensorial'))
  assert.ok(!tips.some(tip => tip.group === 'sensorial'))
  assert.ok(!tipGroups.some(group => group.id === 'sensorial'))
})

test('active questions and tips contain no technical cut types, including distractors', () => {
  const cuts = /julienne|brunoise|chiffonade|bastonetes|noisette|cortes técnicos|tipos de corte/i
  for (const question of questions) assert.ok(!cuts.test(JSON.stringify(question)), question.id)
  for (const tip of tips) assert.ok(!cuts.test(JSON.stringify(tip)), tip.id)
  assert.equal(questions.length, 58)
  assert.equal(tips.length, 21)
  assert.equal(gradeAnswer(byId('revisao-densidade'), '0,90'), 'correct')
})
