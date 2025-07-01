import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { Candidate } from '../interfaces/candidate.interface'; 

@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB('CandidatesDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('candidates')) {
          db.createObjectStore('candidates', { autoIncrement: true });
        }
      }
    });
  }

  async saveCandidate(candidate: Candidate) {
    const db = await this.dbPromise;
    return await db.add('candidates', candidate);
  }

  async getAllCandidates(): Promise<Candidate[]> {
    const db = await this.dbPromise;
    return await db.getAll('candidates');
  }

}