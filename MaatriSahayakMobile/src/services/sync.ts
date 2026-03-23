import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import api from './api';
import { DatabaseService } from './database';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
type SyncListener = (status: SyncStatus, pendingCount: number) => void;

let syncInProgress = false;
let listeners: SyncListener[] = [];
let unsubscribeNetInfo: (() => void) | null = null;

const notifyListeners = async (status: SyncStatus) => {
    const count = await DatabaseService.getPendingSyncCount();
    listeners.forEach(l => l(status, count));
};

export const SyncService = {

    // ── Subscribe to sync status changes ─────────────────────────────────────
    addSyncListener(listener: SyncListener): () => void {
        listeners.push(listener);
        return () => { listeners = listeners.filter(l => l !== listener); };
    },

    // ── Check connectivity ────────────────────────────────────────────────────
    async isOnline(): Promise<boolean> {
        const state = await NetInfo.fetch();
        return !!(state.isConnected && state.isInternetReachable);
    },

    // ── Start background sync — listens for network changes ──────────────────
    startBackgroundSync(): void {
        if (unsubscribeNetInfo) return; // already started

        unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
            const online = !!(state.isConnected && state.isInternetReachable);
            if (online) {
                console.log('[Sync] Network restored — starting background sync');
                SyncService.syncOfflineData();
            }
        });

        console.log('[Sync] Background sync listener started');
    },

    stopBackgroundSync(): void {
        if (unsubscribeNetInfo) {
            unsubscribeNetInfo();
            unsubscribeNetInfo = null;
        }
    },

    // ── Main sync function ────────────────────────────────────────────────────
    async syncOfflineData(): Promise<{ synced: number; failed: number }> {
        if (syncInProgress) return { synced: 0, failed: 0 };

        const online = await SyncService.isOnline();
        if (!online) {
            console.log('[Sync] Offline — skipping sync');
            return { synced: 0, failed: 0 };
        }

        syncInProgress = true;
        await notifyListeners('syncing');

        let synced = 0;
        let failed = 0;

        try {
            const queue = await DatabaseService.getSyncQueue();
            console.log(`[Sync] Processing ${queue.length} items`);

            for (const item of queue) {
                try {
                    const payload = JSON.parse(item.payload);

                    if (item.method === 'POST') {
                        await api.post(item.endpoint, payload);
                    } else if (item.method === 'PUT') {
                        await api.put(item.endpoint, payload);
                    }

                    await DatabaseService.removeSyncQueueItem(item.id);

                    // Mark the source record as synced
                    if (item.type === 'PREGNANCY' && payload.id) {
                        await DatabaseService.markPregnancySynced(payload.id);
                    } else if (item.type === 'VITALS' && payload.id) {
                        await DatabaseService.markVitalsSynced(payload.id);
                    } else if (item.type === 'ANC_VISIT' && payload.id) {
                        await DatabaseService.markAncVisitSynced(payload.id);
                    }

                    synced++;
                    console.log(`[Sync] ✓ Synced ${item.type} — ${payload.id}`);

                } catch (error: any) {
                    const errMsg = error?.message ?? 'Unknown error';
                    await DatabaseService.incrementRetryCount(item.id, errMsg);
                    failed++;
                    console.warn(`[Sync] ✗ Failed ${item.type}:`, errMsg);
                }
            }

            await notifyListeners(failed === 0 ? 'success' : 'error');
            console.log(`[Sync] Done — synced: ${synced}, failed: ${failed}`);

        } catch (error) {
            await notifyListeners('error');
            console.error('[Sync] Sync crashed:', error);
        } finally {
            syncInProgress = false;
        }

        return { synced, failed };
    },

    // ── Queue helpers used by screens ─────────────────────────────────────────
    async queuePregnancy(pregnancy: any): Promise<void> {
        await DatabaseService.savePregnancy({ ...pregnancy, synced: 0 });
        await DatabaseService.addToSyncQueue('PREGNANCY', '/pregnancies', 'POST', pregnancy);
        await notifyListeners('idle');
    },

    async queueVitals(vitals: any): Promise<void> {
        await DatabaseService.saveVitals({ ...vitals, synced: 0 });
        await DatabaseService.addToSyncQueue('VITALS', '/vitals', 'POST', vitals);
        await notifyListeners('idle');
    },

    async queueAncVisit(visit: any): Promise<void> {
        await DatabaseService.saveAncVisit({ ...visit, synced: 0 });
        await DatabaseService.addToSyncQueue('ANC_VISIT', '/anc/visits', 'POST', visit);
        await notifyListeners('idle');
    },
};
