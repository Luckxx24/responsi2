import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

export interface Race {
  id?: string;
  name: string;
  description: string;
  updatedAt?: Timestamp;
}

const racesCollection = collection(db, 'races');

export const firestoreService = {
  getRaces: async (): Promise<Race[]> => {
    const snapshot = await getDocs(racesCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Race));
  },
  addRace: async (race: Race) => {
    await addDoc(racesCollection, { ...race, updatedAt: Timestamp.now() });
  },
  updateRace: async (id: string, race: Race) => {
    const raceDoc = doc(racesCollection, id);
    await updateDoc(raceDoc, { ...race, updatedAt: Timestamp.now() });
  },
  deleteRace: async (id: string) => {
    const raceDoc = doc(racesCollection, id);
    await deleteDoc(raceDoc);
  },
};
