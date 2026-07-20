import { db } from '../config/firebase';
import { mapDoc, mapQuery } from '../utils/firebase';

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UserDocument {
  id?: string;
  email: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'CUSTOMER';
  addresses?: UserAddress[];
  createdAt?: string;
  updatedAt?: string;
}

export class UserRepository {
  private static collectionName = 'users';

  /**
   * Retrieves a user by their unique Firebase UID.
   * @param uid Firebase auth uid
   */
  async findById(uid: string): Promise<UserDocument | null> {
    const doc = await db.collection(UserRepository.collectionName).doc(uid).get();
    return mapDoc<UserDocument>(doc);
  }

  /**
   * Retrieves a user by their email address.
   * @param email User email string
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    const querySnapshot = await db
      .collection(UserRepository.collectionName)
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    const results = mapQuery<UserDocument>(querySnapshot);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Creates or updates a user document in Firestore.
   * @param uid Firebase auth uid
   * @param user User data record
   */
  async save(uid: string, user: Omit<UserDocument, 'id'>): Promise<UserDocument> {
    const userRef = db.collection(UserRepository.collectionName).doc(uid);
    const now = new Date().toISOString();

    const dataToSave = {
      ...user,
      email: user.email.toLowerCase(),
      addresses: user.addresses || [],
      createdAt: user.createdAt || now,
      updatedAt: now,
    };

    await userRef.set(dataToSave, { merge: true });
    return { id: uid, ...dataToSave };
  }

  /**
   * Updates specific fields of a user document in Firestore.
   * @param uid Firebase auth uid
   * @param user Partial user details
   */
  async update(uid: string, user: Partial<UserDocument>): Promise<UserDocument | null> {
    const userRef = db.collection(UserRepository.collectionName).doc(uid);
    const now = new Date().toISOString();

    const dataToUpdate = {
      ...user,
      ...(user.email && { email: user.email.toLowerCase() }),
      updatedAt: now,
    };

    await userRef.update(dataToUpdate);
    return this.findById(uid);
  }

  /**
   * Adds a shipping address to the user's address book array.
   * @param uid User Firebase UID
   * @param address Shipping address details
   */
  async addAddress(uid: string, address: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    const userRef = db.collection(UserRepository.collectionName).doc(uid);
    const userDoc = await this.findById(uid);

    if (!userDoc) {
      throw new Error(`User with ID ${uid} not found.`);
    }

    const newAddress: UserAddress = {
      ...address,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    };

    const currentAddresses = userDoc.addresses || [];
    currentAddresses.push(newAddress);

    await userRef.update({
      addresses: currentAddresses,
      updatedAt: new Date().toISOString(),
    });

    return newAddress;
  }

  /**
   * Deletes a shipping address from the user's address book by its generated ID.
   * @param uid User Firebase UID
   * @param addressId Unique address card ID
   */
  async deleteAddress(uid: string, addressId: string): Promise<UserAddress[]> {
    const userRef = db.collection(UserRepository.collectionName).doc(uid);
    const userDoc = await this.findById(uid);

    if (!userDoc) {
      throw new Error(`User with ID ${uid} not found.`);
    }

    const currentAddresses = userDoc.addresses || [];
    const updatedAddresses = currentAddresses.filter((addr) => addr.id !== addressId);

    await userRef.update({
      addresses: updatedAddresses,
      updatedAt: new Date().toISOString(),
    });

    return updatedAddresses;
  }
}

export default UserRepository;
