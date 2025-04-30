
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { Caterer } from '@/types/caterer';

export const getCaterers = async (lastDoc = null, limitCount = 12) => {
  try {
    let caterersQuery = query(
      collection(db, 'caterers'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      caterersQuery = query(
        collection(db, 'caterers'),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(caterersQuery);
    const caterers: Caterer[] = [];
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    querySnapshot.forEach((doc) => {
      const catererData = {
        id: doc.id,
        ...doc.data()
      } as Caterer;
      caterers.push(catererData);
    });

    return { caterers, lastVisible };
  } catch (error) {
    console.error('Error fetching caterers:', error);
    return { caterers: [], lastVisible: null };
  }
};

export const getCaterer = async (id: string): Promise<Caterer | null> => {
  try {
    const docRef = doc(db, 'caterers', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Caterer;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching caterer:', error);
    return null;
  }
};

export const searchCaterersByCuisine = async (cuisineType: string, limitCount = 8) => {
  try {
    const caterersQuery = query(
      collection(db, 'caterers'),
      where('isActive', '==', true),
      where('cuisineTypes', 'array-contains', cuisineType),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(caterersQuery);
    const caterers: Caterer[] = [];

    querySnapshot.forEach((doc) => {
      const catererData = {
        id: doc.id,
        ...doc.data()
      } as Caterer;
      caterers.push(catererData);
    });

    return caterers;
  } catch (error) {
    console.error(`Error fetching caterers by cuisine type ${cuisineType}:`, error);
    return [];
  }
};
