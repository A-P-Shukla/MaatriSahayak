import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wifi, WifiOff, RefreshCw, Clock, AlertCircle } from 'lucide-react-native';

interface SyncStatusIndicatorProps {
    onSyncPress?: () => void;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ onSyncPress }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [pendingRecords, setPendingRecords] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Monitor network status
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOnline(!!state.isConnected);
        });

        // Load last sync time and pending records
        loadSyncStatus();

        // Update every minute
        const interval = setInterval(loadSyncStatus, 60000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const loadSyncStatus = async () => {
        try {
            const lastSync = await AsyncStorage.getItem('lastSyncTime');
            if (lastSync) {
                setLastSyncTime(new Date(lastSync));
            }

            // Count pending records from various queues
            const pendingPregnancies = await AsyncStorage.getItem('pendingPregnancies');
            const pendingVitals = await AsyncStorage.getItem('pendingVitals');
            const pendingEmergencies = await AsyncStorage.getItem('pendingEmergencies');

            let count = 0;
            if (pendingPregnancies) count += JSON.parse(pendingPregnancies).length;
            if (pendingVitals) count += JSON.parse(pendingVitals).length;
            if (pendingEmergencies) count += JSON.parse(pendingEmergencies).length;

            setPendingRecords(count);
        } catch (error) {
            console.error('Error loading sync status:', error);
        }
    };

    const handleSyncPress = async () => {
        if (!isOnline || isSyncing) return;
        
        setIsSyncing(true);
        try {
            if (onSyncPress) {
                await onSyncPress();
            }
            await AsyncStorage.setItem('lastSyncTime', new Date().toISOString());
            await loadSyncStatus();
        } catch (error) {
            console.error('Sync error:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const getTimeAgo = (date: Date): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    const getStatusColor = () => {
        if (!isOnline) return '#FF6B6B';
        if (pendingRecords > 0) return '#FFA040';
        return '#00E5A0';
    };

    const getStatusText = () => {
        if (!isOnline) {
            return pendingRecords > 0 
                ? `Offline mode — ${pendingRecords} record${pendingRecords > 1 ? 's' : ''} pending`
                : 'Offline mode — All data synced';
        }
        
        if (pendingRecords > 0) {
            return `${pendingRecords} record${pendingRecords > 1 ? 's' : ''} pending sync`;
        }

        if (lastSyncTime) {
            return `Last synced ${getTimeAgo(lastSyncTime)}`;
        }

        return 'Ready to sync';
    };

    const statusColor = getStatusColor();

    return (
        <View style={styles.container}>
            <View style={[styles.indicator, { backgroundColor: `${statusColor}15` }]}>
                <View style={styles.leftSection}>
                    {isOnline ? (
                        <Wifi size={16} color={statusColor} />
                    ) : (
                        <WifiOff size={16} color={statusColor} />
                    )}
                    <View style={styles.textContainer}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusText()}
                        </Text>
                        {!isOnline && (
                            <Text style={styles.subText}>
                                Data saved locally
                            </Text>
                        )}
                    </View>
                </View>

                {isOnline && pendingRecords > 0 && (
                    <TouchableOpacity 
                        style={[styles.syncButton, { borderColor: statusColor }]}
                        onPress={handleSyncPress}
                        disabled={isSyncing}>
                        {isSyncing ? (
                            <RefreshCw size={14} color={statusColor} style={styles.spinning} />
                        ) : (
                            <RefreshCw size={14} color={statusColor} />
                        )}
                    </TouchableOpacity>
                )}

                {!isOnline && pendingRecords > 0 && (
                    <View style={styles.badge}>
                        <AlertCircle size={14} color={statusColor} />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    indicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    textContainer: {
        flex: 1,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    subText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
        marginTop: 2,
    },
    syncButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    badge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinning: {
        // Animation would be added via Animated API if needed
    },
});

export default SyncStatusIndicator;
