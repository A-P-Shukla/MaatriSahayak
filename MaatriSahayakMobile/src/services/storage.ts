import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageService = {
    // Auth
    async setAuthToken(token: string): Promise<void> {
        await AsyncStorage.setItem('authToken', token);
    },

    async getAuthToken(): Promise<string | null> {
        return await AsyncStorage.getItem('authToken');
    },

    async removeAuthToken(): Promise<void> {
        await AsyncStorage.removeItem('authToken');
    },

    // User data
    async setUserData(userData: any): Promise<void> {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
    },

    async getUserData(): Promise<any> {
        const data = await AsyncStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    },

    // Offline data queue
    async addToSyncQueue(data: any): Promise<void> {
        const queue = await this.getSyncQueue();
        queue.push({ ...data, timestamp: Date.now() });
        await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
    },

    async getSyncQueue(): Promise<any[]> {
        const data = await AsyncStorage.getItem('syncQueue');
        return data ? JSON.parse(data) : [];
    },

    async clearSyncQueue(): Promise<void> {
        await AsyncStorage.setItem('syncQueue', JSON.stringify([]));
    },

    // Clear all data
    async clearAll(): Promise<void> {
        await AsyncStorage.clear();
    },
};
