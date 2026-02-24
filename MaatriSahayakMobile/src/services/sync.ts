import api from './api';
import { StorageService } from './storage';

export const SyncService = {
    async syncOfflineData(): Promise<void> {
        try {
            const queue = await StorageService.getSyncQueue();

            if (queue.length === 0) {
                return;
            }

            // Process each item in the queue
            for (const item of queue) {
                try {
                    await api.post('/sync', item);
                } catch (error) {
                    console.error('Failed to sync item:', error);
                    // Keep item in queue for retry
                    continue;
                }
            }

            // Clear queue after successful sync
            await StorageService.clearSyncQueue();
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        }
    },

    async checkConnectivity(): Promise<boolean> {
        try {
            await api.get('/health');
            return true;
        } catch {
            return false;
        }
    },
};
