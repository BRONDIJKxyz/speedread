import Dexie, { Table } from 'dexie'
import { Document, ReadingProgress } from '../core/types'

export class SpeedReadDB extends Dexie {
  documents!: Table<Document, string>
  progress!: Table<ReadingProgress, string>

  constructor() {
    super('speedread-db')
    
    this.version(1).stores({
      documents: 'id, title, filename, format, createdAt, updatedAt',
      progress: 'documentId, updatedAt',
    })
  }
}

export const db = new SpeedReadDB()
