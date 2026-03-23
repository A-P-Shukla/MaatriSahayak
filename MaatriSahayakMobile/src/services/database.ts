import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const getDb = async (): Promise<SQLite.SQLiteDatabase> => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('maatrisahayak.db');
    }
    return db;
};

export const DatabaseService = {

    async init(): Promise<void> {
        const database = await getDb();
        await database.execAsync(`
            PRAGMA journal_mode = WAL;

            CREATE TABLE IF NOT EXISTS pregnancies (
                id TEXT PRIMARY KEY,
                patient_name TEXT NOT NULL,
                phone TEXT,
                age INTEGER,
                district TEXT,
                village TEXT,
                edd TEXT,
                risk_level TEXT DEFAULT 'LOW',
                asha_worker_id TEXT,
                synced INTEGER DEFAULT 0,
                created_at TEXT,
                updated_at TEXT,
                raw_json TEXT
            );

            CREATE TABLE IF NOT EXISTS vitals (
                id TEXT PRIMARY KEY,
                pregnancy_id TEXT NOT NULL,
                blood_pressure TEXT,
                weight REAL,
                hemoglobin REAL,
                fetal_heart_rate INTEGER,
                recorded_at TEXT,
                synced INTEGER DEFAULT 0,
                raw_json TEXT
            );

            CREATE TABLE IF NOT EXISTS anc_visits (
                id TEXT PRIMARY KEY,
                pregnancy_id TEXT NOT NULL,
                visit_date TEXT,
                notes TEXT,
                synced INTEGER DEFAULT 0,
                raw_json TEXT
            );

            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                method TEXT NOT NULL DEFAULT 'POST',
                payload TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                last_error TEXT
            );
        `);
    },

    // ── Pregnancies ──────────────────────────────────────────────────────────

    async savePregnancy(pregnancy: any): Promise<void> {
        const database = await getDb();
        await database.runAsync(
            `INSERT OR REPLACE INTO pregnancies
             (id, patient_name, phone, age, district, village, edd, risk_level, asha_worker_id, synced, created_at, updated_at, raw_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pregnancy.id,
                pregnancy.patient_name ?? pregnancy.name ?? '',
                pregnancy.phone ?? '',
                pregnancy.age ?? 0,
                pregnancy.district ?? '',
                pregnancy.village ?? '',
                pregnancy.edd ?? '',
                pregnancy.risk_level ?? 'LOW',
                pregnancy.asha_worker_id ?? '',
                pregnancy.synced ?? 1,
                pregnancy.created_at ?? new Date().toISOString(),
                pregnancy.updated_at ?? new Date().toISOString(),
                JSON.stringify(pregnancy),
            ]
        );
    },

    async getPregnancies(): Promise<any[]> {
        const database = await getDb();
        const rows = await database.getAllAsync('SELECT * FROM pregnancies ORDER BY updated_at DESC');
        return rows.map((r: any) => {
            try { return JSON.parse(r.raw_json); } catch { return r; }
        });
    },

    async getUnsyncedPregnancies(): Promise<any[]> {
        const database = await getDb();
        return database.getAllAsync('SELECT * FROM pregnancies WHERE synced = 0');
    },

    async markPregnancySynced(id: string): Promise<void> {
        const database = await getDb();
        await database.runAsync('UPDATE pregnancies SET synced = 1 WHERE id = ?', [id]);
    },

    // ── Vitals ───────────────────────────────────────────────────────────────

    async saveVitals(vitals: any): Promise<void> {
        const database = await getDb();
        await database.runAsync(
            `INSERT OR REPLACE INTO vitals
             (id, pregnancy_id, blood_pressure, weight, hemoglobin, fetal_heart_rate, recorded_at, synced, raw_json)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vitals.id,
                vitals.pregnancy_id,
                vitals.blood_pressure ?? '',
                vitals.weight ?? 0,
                vitals.hemoglobin ?? 0,
                vitals.fetal_heart_rate ?? 0,
                vitals.recorded_at ?? new Date().toISOString(),
                vitals.synced ?? 0,
                JSON.stringify(vitals),
            ]
        );
    },

    async getUnsyncedVitals(): Promise<any[]> {
        const database = await getDb();
        return database.getAllAsync('SELECT * FROM vitals WHERE synced = 0');
    },

    async markVitalsSynced(id: string): Promise<void> {
        const database = await getDb();
        await database.runAsync('UPDATE vitals SET synced = 1 WHERE id = ?', [id]);
    },

    // ── ANC Visits ───────────────────────────────────────────────────────────

    async saveAncVisit(visit: any): Promise<void> {
        const database = await getDb();
        await database.runAsync(
            `INSERT OR REPLACE INTO anc_visits (id, pregnancy_id, visit_date, notes, synced, raw_json)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                visit.id,
                visit.pregnancy_id,
                visit.visit_date ?? new Date().toISOString(),
                visit.notes ?? '',
                visit.synced ?? 0,
                JSON.stringify(visit),
            ]
        );
    },

    async getUnsyncedAncVisits(): Promise<any[]> {
        const database = await getDb();
        return database.getAllAsync('SELECT * FROM anc_visits WHERE synced = 0');
    },

    async markAncVisitSynced(id: string): Promise<void> {
        const database = await getDb();
        await database.runAsync('UPDATE anc_visits SET synced = 1 WHERE id = ?', [id]);
    },

    // ── Sync Queue ───────────────────────────────────────────────────────────

    async addToSyncQueue(type: string, endpoint: string, method: string, payload: object): Promise<void> {
        const database = await getDb();
        await database.runAsync(
            `INSERT INTO sync_queue (type, endpoint, method, payload) VALUES (?, ?, ?, ?)`,
            [type, endpoint, method, JSON.stringify(payload)]
        );
    },

    async getSyncQueue(): Promise<any[]> {
        const database = await getDb();
        return database.getAllAsync('SELECT * FROM sync_queue WHERE retry_count < 5 ORDER BY created_at ASC');
    },

    async removeSyncQueueItem(id: number): Promise<void> {
        const database = await getDb();
        await database.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
    },

    async incrementRetryCount(id: number, error: string): Promise<void> {
        const database = await getDb();
        await database.runAsync(
            'UPDATE sync_queue SET retry_count = retry_count + 1, last_error = ? WHERE id = ?',
            [error, id]
        );
    },

    async getPendingSyncCount(): Promise<number> {
        const database = await getDb();
        const result = await database.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM sync_queue WHERE retry_count < 5'
        );
        return result?.count ?? 0;
    },
};
