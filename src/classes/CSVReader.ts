import fs from 'fs'
import { parse, Parser } from 'csv-parse'

export class CSVReader {
  path: string
  iteration: number = 0
  data: string = ''
  parser: Parser
  records: string[][] = []

  constructor(path: string) {
    this.path = path

    const parser = parse({
      delimiter: ',',
      relaxColumnCountLess: true
    })

    this.parser = parser
  }

  readLines(maxChunks: number = Infinity, chunkSizeInBytes: number = 1024) {
    return new Promise((resolve, reject) => {
      this.parser.on('readable', () => {
        try {
          let record = this.parser.read()
          while (record !== null) {
            this.records.push(record)
            record = this.parser.read()
          }
        } catch (err) {
          console.log(err)
        }
      })

      const readStream = fs
        .createReadStream(this.path, {
          encoding: 'utf8',
          highWaterMark: chunkSizeInBytes
        })

        .on('data', (chunk) => {
          this.iteration += 1
          this.data += chunk

          if (this.iteration > maxChunks) {
            this.parser.end()
            readStream.destroy()
          }
        })
        .pipe(this.parser)
        .on('end', () => {
          readStream.destroy()
          resolve(true)
        })
        .on('error', (err) => {
          console.error(err)
          readStream.destroy()
          reject(false)
        })
    })
  }

  get lines() {
    return this.records
  }
}
