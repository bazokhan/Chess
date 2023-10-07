import fs from 'fs'

export const fileLog = (fileName = 'general', text: string) => {
  if (typeof window === 'undefined' || typeof vitest !== 'undefined') {
    try {
      fs.appendFileSync(
        `logs/${fileName}.log.txt`,
        `[${new Date().toLocaleString()}]: ${text}\n`
      )
    } catch {
      fs.writeFileSync(
        `logs/${fileName}.log.txt`,
        `[${new Date().toLocaleString()}]: ${text}\n`
      )
    }
  } else {
    console.log(`[${new Date().toLocaleString()}]: ${text}`)
  }
}
