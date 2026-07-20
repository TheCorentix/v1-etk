import { Timestamp, DocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore';

/**
 * Converts a Firebase Timestamp object to a JavaScript Date, or returns null.
 * @param value Potential Timestamp value
 */
export const convertTimestamp = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (typeof value === 'object' && typeof value.seconds === 'number' && typeof value.nanoseconds === 'number') {
    return new Timestamp(value.seconds, value.nanoseconds).toDate();
  }
  return new Date(value);
};

/**
 * Recursively parses Firestore document objects to convert all embedded Timestamp instances to ISO strings.
 * @param data Firestore data object
 */
export const parseFirestoreTimestamps = (data: any): any => {
  if (data === null || data === undefined) return data;
  
  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => parseFirestoreTimestamps(item));
  }
  
  if (typeof data === 'object') {
    const parsed: any = {};
    for (const key of Object.keys(data)) {
      parsed[key] = parseFirestoreTimestamps(data[key]);
    }
    return parsed;
  }
  
  return data;
};

/**
 * Maps a single DocumentSnapshot to a parsed object, appending its ID.
 * @param doc Firestore DocumentSnapshot
 */
export const mapDoc = <T>(doc: DocumentSnapshot): T | null => {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...parseFirestoreTimestamps(data),
  } as T;
};

/**
 * Maps a QuerySnapshot array to parsed objects, appending their IDs.
 * @param snapshot Firestore QuerySnapshot
 */
export const mapQuery = <T>(snapshot: QuerySnapshot): T[] => {
  const list: T[] = [];
  snapshot.forEach((doc: DocumentSnapshot) => {
    const parsed = mapDoc<T>(doc);
    if (parsed) {
      list.push(parsed);
    }
  });
  return list;
};

export default {
  convertTimestamp,
  parseFirestoreTimestamps,
  mapDoc,
  mapQuery,
};
