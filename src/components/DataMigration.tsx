import { useState } from 'react';
import { migrateStaticDataToFirestore, checkDataExists } from '../services/dataMigration';
import { motion } from 'framer-motion';
import { Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export function DataMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'checking' | 'migrating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationStatus('checking');
    setMessage('Checking if data already exists...');

    try {
      // Check if data already exists
      const dataExists = await checkDataExists();
      
      if (dataExists) {
        setMigrationStatus('error');
        setMessage('Data already exists in Firestore. Migration skipped.');
        return;
      }

      setMigrationStatus('migrating');
      setMessage('Migrating static data to Firestore...');

      // Perform migration
      const result = await migrateStaticDataToFirestore();
      
      if (result.success) {
        setMigrationStatus('success');
        setMessage('Data migration completed successfully!');
      } else {
        setMigrationStatus('error');
        setMessage(`Migration failed: ${result.message}`);
      }
    } catch (error) {
      setMigrationStatus('error');
      setMessage(`Migration error: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Data Migration
          </h2>
          <p className="text-gray-600">
            Migrate static property data from JSON to Firebase Firestore
          </p>
        </div>

        <div className="space-y-6">
          {/* Status Display */}
          {migrationStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border-2 ${
                migrationStatus === 'success'
                  ? 'border-green-200 bg-green-50'
                  : migrationStatus === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-center">
                {migrationStatus === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : migrationStatus === 'error' ? (
                  <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                ) : (
                  <Loader className="h-6 w-6 text-blue-600 mr-3 animate-spin" />
                )}
                <div>
                  <p className={`font-medium ${
                    migrationStatus === 'success'
                      ? 'text-green-800'
                      : migrationStatus === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {migrationStatus === 'checking' && 'Checking data...'}
                    {migrationStatus === 'migrating' && 'Migrating data...'}
                    {migrationStatus === 'success' && 'Migration successful!'}
                    {migrationStatus === 'error' && 'Migration failed'}
                  </p>
                  <p className={`text-sm ${
                    migrationStatus === 'success'
                      ? 'text-green-600'
                      : migrationStatus === 'error'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    {message}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Migration Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMigration}
            disabled={isMigrating}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isMigrating ? (
              <div className="flex items-center justify-center">
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                {migrationStatus === 'checking' ? 'Checking...' : 'Migrating...'}
              </div>
            ) : (
              'Start Data Migration'
            )}
          </motion.button>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-3">What this does:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Creates a sample landlord in Firestore</li>
              <li>• Converts static property data to Firestore format</li>
              <li>• Creates properties, units, and listings collections</li>
              <li>• Maintains data relationships and structure</li>
            </ul>
          </div>

          {/* Prerequisites */}
          <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-3">Prerequisites:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Firebase project created and configured</li>
              <li>• Environment variables set in .env.local</li>
              <li>• Firestore rules deployed</li>
              <li>• User authenticated with appropriate permissions</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
