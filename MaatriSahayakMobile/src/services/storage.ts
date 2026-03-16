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

    // PIN
    async setPin(pin: string): Promise<void> {
        await AsyncStorage.setItem('userPin', pin);
    },
    async getPin(): Promise<string | null> {
        return await AsyncStorage.getItem('userPin');
    },
    async removePin(): Promise<void> {
        await AsyncStorage.removeItem('userPin');
    },

    // Photo
    async setPhoto(uri: string): Promise<void> {
        await AsyncStorage.setItem('userPhoto', uri);
    },
    async getPhoto(): Promise<string | null> {
        return await AsyncStorage.getItem('userPhoto');
    },

    // ASHA profile (for id card)
    async setAshaProfile(profile: any): Promise<void> {
        await AsyncStorage.setItem('ashaProfile', JSON.stringify(profile));
    },
    async getAshaProfile(): Promise<any> {
        const data = await AsyncStorage.getItem('ashaProfile');
        return data ? JSON.parse(data) : null;
    },

    // Clear all data
    async clearAll(): Promise<void> {
        await AsyncStorage.clear();
    },
};
