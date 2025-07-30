'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { migrateUsers, checkMigrationNeeded } from '@/utils/migrate-users';

export default function UserMigration() {
    const [migrationStatus, setMigrationStatus] = useState<{
        needed: boolean;
        count: number;
        users: Array<{ docId: string; uid: string; email: string }>;
    }>({ needed: false, count: 0, users: [] });
    
    const [isChecking, setIsChecking] = useState(false);
    const [isMigrating, setIsMigrating] = useState(false);
    const [migrationResult, setMigrationResult] = useState<{
        success: boolean;
        migratedCount: number;
        errors: string[];
    } | null>(null);

    useEffect(() => {
        checkMigration();
    }, []);

    const checkMigration = async () => {
        setIsChecking(true);
        try {
            const status = await checkMigrationNeeded();
            setMigrationStatus(status);
        } catch (error) {
            console.error('Error checking migration:', error);
        } finally {
            setIsChecking(false);
        }
    };

    const runMigration = async () => {
        if (!confirm('Are you sure you want to run the user migration? This will fix users created with incorrect document structure.')) {
            return;
        }

        setIsMigrating(true);
        setMigrationResult(null);
        
        try {
            const result = await migrateUsers();
            setMigrationResult(result);
            
            // Recheck migration status
            await checkMigration();
        } catch (error) {
            console.error('Migration error:', error);
            setMigrationResult({
                success: false,
                migratedCount: 0,
                errors: ['Migration failed with unexpected error']
            });
        } finally {
            setIsMigrating(false);
        }
    };

    if (isChecking) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center gap-3">
                    <RefreshCw className="animate-spin text-blue-600" size={24} />
                    <div>
                        <h3 className="text-lg font-semibold">Checking Migration Status</h3>
                        <p className="text-gray-600">Analyzing user data structure...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            
        </div>
    );
}