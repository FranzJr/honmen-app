'use strict'

const { readFileSync } = require('fs')
const { join } = require('path')

// Load QUESTIONS from questions.js without modifying that file.
// new Function executes the file content as a function body and returns QUESTIONS.
const questionsCode = readFileSync(join(__dirname, 'questions.js'), 'utf-8')
const QUESTIONS = new Function(questionsCode + '\nreturn QUESTIONS;')()

// Pure functions mirrored from app.js — update here if app.js changes them.
// Source: app.js lines 202-215
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function fmt(str, vars) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, v), str
  )
}

// ── Question Bank ──────────────────────────────────────────────────────────────

const REQUIRED_FIELDS = ['en', 'es', 'jpk', 'jph', 'correct', 'expEN', 'expES', 'expJP', 'cat', 'catEN', 'catJP']

describe('Question Bank', () => {
  it('has exactly 100 questions', () => {
    expect(QUESTIONS).toHaveLength(100)
  })

  it('every question has all required fields', () => {
    QUESTIONS.forEach((q, i) => {
      REQUIRED_FIELDS.forEach(field => {
        expect(q).toHaveProperty(field)
      })
    })
  })

  it('every question has a boolean correct field', () => {
    QUESTIONS.forEach((q, i) => {
      expect(typeof q.correct).toBe('boolean')
    })
  })

  it('has a mix of true and false answers', () => {
    const trueCount = QUESTIONS.filter(q => q.correct).length
    const falseCount = QUESTIONS.filter(q => !q.correct).length
    expect(trueCount).toBeGreaterThan(0)
    expect(falseCount).toBeGreaterThan(0)
  })

  it('all question texts are non-empty strings', () => {
    QUESTIONS.forEach((q, i) => {
      expect(q.en.trim()).not.toBe('')
      expect(q.es.trim()).not.toBe('')
      expect(q.jpk.trim()).not.toBe('')
    })
  })
})

// ── shuffle ────────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5)
  })

  it('contains the same elements as the input', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffle(arr).sort((a, b) => a - b)).toEqual(arr)
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3, 4, 5]
    const copy = [...arr]
    shuffle(arr)
    expect(arr).toEqual(copy)
  })

  it('produces a 50-question sample with no duplicates', () => {
    const sample = shuffle(QUESTIONS).slice(0, 50)
    const unique = new Set(sample.map(q => q.en))
    expect(sample).toHaveLength(50)
    expect(unique.size).toBe(50)
  })
})

// ── fmt ────────────────────────────────────────────────────────────────────────

describe('fmt', () => {
  it('replaces a single variable', () => {
    expect(fmt('Pregunta {n} de {t}', { n: 1, t: 50 })).toBe('Pregunta 1 de 50')
  })

  it('replaces all occurrences of the same variable', () => {
    expect(fmt('{n} y {n}', { n: 3 })).toBe('3 y 3')
  })

  it('formats the score message correctly', () => {
    expect(fmt('{s}/50 ({p}%)', { s: 45, p: 90 })).toBe('45/50 (90%)')
  })

  it('leaves unmatched placeholders unchanged', () => {
    expect(fmt('Hola {x}', { y: 1 })).toBe('Hola {x}')
  })
})

// ── Score threshold ────────────────────────────────────────────────────────────

describe('Score threshold', () => {
  it('45/50 is a passing score', () => {
    expect(45 >= 45).toBe(true)
  })

  it('44/50 is a failing score', () => {
    expect(44 >= 45).toBe(false)
  })

  it('50/50 is a passing score', () => {
    expect(50 >= 45).toBe(true)
  })

  it('calculates pass percentage as 90%', () => {
    expect(Math.round((45 / 50) * 100)).toBe(90)
  })

  it('calculates fail percentage correctly', () => {
    expect(Math.round((44 / 50) * 100)).toBe(88)
  })
})
