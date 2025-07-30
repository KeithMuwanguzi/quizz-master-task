import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/lib/types';

/**
 * Migration script to fix users created with wrong document structure
 * This fixes users where the document ID doesn't match the Firebase Auth UID
 */
export async function migrateUsers(): Promise<{
  success: boolean;
  migratedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let migratedCount = 0;

  try {
    console.log('Starting user migration...');
    
    // Get all users from Firestore
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersToMigrate: { docId: string; userData: any }[] = [];

    // Find users where document ID doesn't match the UID field
    usersSnapshot.docs.forEach(docSnapshot => {
      const userData = docSnapshot.data();
      const docId = docSnapshot.id;
      
      if (userData.uid && userData.uid !== docId) {
        // This user needs migration
        usersToMigrate.push({
          docId,
          userData
        });
      }
    });

    console.log(`Found ${usersToMigrate.length} users that need migration`);

    // Migrate each user
    for (const { docId, userData } of usersToMigrate) {
      try {
        // Create new document with UID as document ID
        await setDoc(doc(db, 'users', userData.uid), userData);
        
        // Delete old document with wrong ID
        await deleteDoc(doc(db, 'users', docId));
        
        migratedCount++;
        console.log(`Migrated user: ${userData.email} (${userData.uid})`);
      } catch (error: any) {
        const errorMsg = `Failed to migrate user ${userData.email}: ${error.message}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`Migration completed. Migrated ${migratedCount} users.`);
    
    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };

  } catch (error: any) {
    const errorMsg = `Migration failed: ${error.message}`;
    errors.push(errorMsg);
    console.error(errorMsg);
    
    return {
      success: false,
      migratedCount,
      errors
    };
  }
}

/**
 * Check if migration is needed
 */
export async function checkMigrationNeeded(): Promise<{
  needed: boolean;
  count: number;
  users: Array<{ docId: string; uid: string; email: string }>;
}> {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const problematicUsers: Array<{ docId: string; uid: string; email: string }> = [];

    usersSnapshot.docs.forEach(docSnapshot => {
      const userData = docSnapshot.data();
      const docId = docSnapshot.id;
      
      if (userData.uid && userData.uid !== docId) {
        problematicUsers.push({
          docId,
          uid: userData.uid,
          email: userData.email
        });
      }
    });

    return {
      needed: problematicUsers.length > 0,
      count: problematicUsers.length,
      users: problematicUsers
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    return {
      needed: false,
      count: 0,
      users: []
    };
  }
}