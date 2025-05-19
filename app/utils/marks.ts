import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export async function ensureMultipleMarks(userId: string) {
  // 1. Check for multipleMarks
  const multipleMarksRef = doc(db, "multipleMarks", userId);
  const multipleMarksSnap = await getDoc(multipleMarksRef);

  if (multipleMarksSnap.exists()) {
    // Already exists, do nothing
    return;
  }

  // 2. Get profile marks
  const profileRef = doc(db, "profiles", userId);
  const profileSnap = await getDoc(profileRef);

  if (!profileSnap.exists()) {
    // No profile, nothing to copy
    return;
  }

  const profileData = profileSnap.data();

  // 3. Get grade from users, or default to 12
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  let grade = 12;
  if (userSnap.exists() && userSnap.data().grade) {
    grade = userSnap.data().grade;
  }

  // 4. Prepare marksData structure - correctly indexed by subject first, then by term
  const marksData = {};
  
  // Extract subject numbers from profile data
  if (profileData.subjects) {
    Object.keys(profileData.subjects).forEach((subjectKey, index) => {
      // Extract subject number (e.g., from 'subject1' get '1')
      const subjectNum = parseInt(subjectKey.replace('subject', ''));
      // Get corresponding mark key
      const markKey = `mark${subjectNum}`;
      
      // Create subject entry with mark for term 1
      const markValue = profileData.marks && profileData.marks[markKey] 
        ? parseInt(profileData.marks[markKey]) 
        : null;
      
      // Subject ID should match the index+1 as seen in the MarksScreen.tsx (id: index + 1)
      const subjectId = index + 1;
      
      // Each subject should have marks organized by term
      marksData[subjectId] = {
        1: markValue // Term ID 1 for the first/current term
      };
    });
  }

  // 5. Create multipleMarks document
  await setDoc(multipleMarksRef, {
    marksData: marksData,
    terms: [
      {
        id: 1,
        grade: grade,
        name: `Gr${grade} Term 1`,
        termNumber: 1
      }
    ],
    userId: userId,
    updatedAt: new Date().toISOString()
  });
} 