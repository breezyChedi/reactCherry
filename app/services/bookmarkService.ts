import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Toggles a degree bookmark for a user
 * @param userId The user's ID
 * @param degreeId The degree ID to bookmark/unbookmark
 * @returns True if the degree is now bookmarked, false otherwise
 */
export const toggleBookmark = async (userId: string, degreeId: number): Promise<boolean> => {
  if (!userId) {
    console.error('toggleBookmark: userId is empty or undefined');
    throw new Error('User ID is required');
  }

  if (!degreeId && degreeId !== 0) {
    console.error('toggleBookmark: degreeId is empty or undefined');
    throw new Error('Degree ID is required');
  }

  try {
    const userRef = doc(db, 'profiles', userId);
    let userDoc = await getDoc(userRef);
    
    // If user profile doesn't exist, create one
    if (!userDoc.exists()) {
      console.log(`Creating new profile for user ${userId}`);
      await setDoc(userRef, {
        bookmarkedDegrees: [],
        createdAt: new Date().toISOString()
      });
      userDoc = await getDoc(userRef);
    }

    const userData = userDoc.data() || {};
    const bookmarkedDegrees = Array.isArray(userData.bookmarkedDegrees) 
      ? userData.bookmarkedDegrees 
      : [];
    
    console.log(`Current bookmarks for user ${userId}:`, bookmarkedDegrees);
    
    // Check if the degree is already bookmarked
    const isCurrentlyBookmarked = bookmarkedDegrees.includes(degreeId);
    console.log(`Degree ${degreeId} is currently bookmarked: ${isCurrentlyBookmarked}`);
    
    let newBookmarkedDegrees;
    if (isCurrentlyBookmarked) {
      newBookmarkedDegrees = bookmarkedDegrees.filter(id => id !== degreeId);
    } else {
      newBookmarkedDegrees = [...bookmarkedDegrees, degreeId];
    }

    console.log(`Updating bookmarks for user ${userId} to:`, newBookmarkedDegrees);
    await updateDoc(userRef, {
      bookmarkedDegrees: newBookmarkedDegrees,
      updatedAt: new Date().toISOString()
    });

    return !isCurrentlyBookmarked;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};

/**
 * Gets all bookmarked degrees for a user
 * @param userId The user's ID
 * @returns Array of bookmarked degree IDs
 */
export const getBookmarkedDegrees = async (userId: string): Promise<number[]> => {
  if (!userId) {
    console.error('getBookmarkedDegrees: userId is empty or undefined');
    throw new Error('User ID is required');
  }

  try {
    console.log(`Fetching bookmarks for user ${userId}`);
    const userRef = doc(db, 'profiles', userId);
    const userDoc = await getDoc(userRef);
    
    // If profile doesn't exist, return empty array
    if (!userDoc.exists()) {
      console.log(`No profile found for user ${userId}, returning empty bookmark list`);
      return [];
    }

    const userData = userDoc.data() || {};
    const bookmarkedDegrees = Array.isArray(userData.bookmarkedDegrees) 
      ? userData.bookmarkedDegrees 
      : [];
    
    console.log(`Retrieved ${bookmarkedDegrees.length} bookmarks for user ${userId}:`, bookmarkedDegrees);
    return bookmarkedDegrees;
  } catch (error) {
    console.error('Error getting bookmarked degrees:', error);
    throw error;
  }
}; 