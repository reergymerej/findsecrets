#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

const simpleEntropy = (str) => {
  const set = {}

  str.split('').forEach(
    c => (set[c] ? set[c]++ : (set[c] = 1))
  )

  return Object.keys(set).reduce((acc, c) => {
    const p = set[c] / str.length;
    return acc - (p * (Math.log(p) / Math.log(2)))
  }, 0)
}

const whitelist = fs.readFileSync(path.resolve(__dirname, './whitelist'), 'utf8').split('\n')

const isWordASecret = (word) => {
  if (whitelist.includes(word)) {
    return false
  }
  const entropy = simpleEntropy(word)
  if (entropy > 4) {
    return true
  }
}

if (require.main !== module) {
  module.exports = {
    isWordASecret,
  }
} else {
  const file = process.argv[2]
  if (!file) {
    console.error('You need to provide a file as an argument')
    process.exit(1)
  }

  const fullpath = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
  if (path.basename(fullpath).startsWith('.env')) {
    console.log('Ignoring file', fullpath)
    process.exit()
  }
  try {
    const source = fs.readFileSync(fullpath, 'utf8')
    const lines = source.split('\n')
    if (lines[0] && lines[0].includes('findsecrets-ignore-file')) {
      process.exit()
    }
    const errors = lines.reduce((errors, line, lineNumber) => {
      if (line.includes('findsecrets-ignore-line')) {
        return errors
      }
      const words = line.split(/\W+/)
      words.forEach(word => {
        if (isWordASecret(word)) {
          errors.push(`    at line ${lineNumber + 1} ${word.substring(0, word.length / 2 + 1)}...`)
        }
      }, false)
      return errors
    }, [])
    if (errors.length > 0) {
      console.error('Found secrets in', fullpath)
      errors.forEach(error => console.error(error))
      process.exit(1)
    }
  } catch (err) {
    console.error('Error', err.stack || err.message || String(err))
    process.exit(1)
  }
}
