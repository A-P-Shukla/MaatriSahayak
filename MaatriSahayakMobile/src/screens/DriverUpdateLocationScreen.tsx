import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG     = '#0D0A1F';
const CARD   = '#1A1230';
const PURPLE = '#7B2FBE';
const PURPLE_LIGHT = '#A855F7';
const DIM    = '#C4B8D4';
const WHITE  = '#FFFFFF';
const GREEN  = '#00E5A0';
const RED    = '#FF5252';
const GOLD   = '#F59E0B';

const STATUS_OPTIONS = [
    { key: 'AVAILABLE',   label: 'Available',    color: GREEN,  icon: '✅' },
    { key: 'ON_DUTY',     label: 'On Duty',      color: GOLD,   icon: '🚑' },
    { key: 'UNAVAILABLE', label: 'Unavailable',  color: RED,    icon: '⛔' },
];

const DriverUpdateLocationScreen = ({ navigation }: any) => {
    const [locating, setLocating]     = useState(false);
    const [updating, setUpdating]     = useState(false);
    const [status, setStatus]         = useState('AVAILABLE');
    const [location, setLocation]     = useState<{ lat: number; lng: number; address: string } | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const getLocation = () => {
        setLocating(true);
        // Simulate GPS fetch (replace with real Geolocation in production)
        setTimeout(() => {
            setLocation({
                lat: 26.8467 + (Math.random() - 0.5) * 0.01,
                lng: 80.9462 + (Math.random() - 0.5) * 0.01,
                address: 'Hazratganj, Lucknow, Uttar Pradesh',
            });
            setLocating(false);
        }, 1500);
    };

    useEffect(() => { getLocation(); }, []);

    const handleUpdate = () => {
        if (!location) { Alert.alert('', 'Please fetch your location first.'); return; }
        setUpdating(true);
        setTimeout(() => {
            setUpdating(false);
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
            Alert.alert('✅ Updated', 'Your location and status have been updated successfully.');
        }, 1200);
    };

    const currentStatus = STATUS_OPTIONS.find(s => s.key === status)!;

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Update Location</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Map Placeholder */}
                <View style={styles.mapBox}>
                    <Text style={styles.mapEmoji}>🗺️</Text>
                    <Text style={styles.mapLabel}>Live Map</Text>
                    {location && (
                        <View style={styles.pinDot}>
                            <Text style={styles.pinEmoji}>📍</Text>
                        </View>
                    )}
                    <View style={styles.mapOverlay}>
                        {location ? (
                            <>
                                <Text style={styles.mapCoords}>{location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E</Text>
                                <Text style={styles.mapAddress}>{location.address}</Text>
                            </>
                        ) : (
                            <Text style={styles.mapCoords}>Fetching location...</Text>
                        )}
                    </View>
                </View>

                {/* GPS Button */}
                <TouchableOpacity style={styles.gpsBtn} onPress={getLocation} disabled={locating} activeOpacity={0.85}>
                    {locating
                        ? <ActivityIndicator color={PURPLE_LIGHT} size="small" />
                        : <Text style={styles.gpsBtnText}>📡  Refresh GPS Location</Text>}
                </TouchableOpacity>

                {/* Location Card */}
                {location && (
                    <View style={styles.locationCard}>
                        <View style={styles.locationRow}>
                            <Text style={styles.locationIcon}>📍</Text>
                            <View style={styles.locationInfo}>
                                <Text style={styles.locationAddress}>{location.address}</Text>
                                <Text style={styles.locationCoords}>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</Text>
                            </View>
                            <View style={styles.accuracyBadge}>
                                <Text style={styles.accuracyText}>±5m</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Status Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Status</Text>
                    <View style={styles.statusGrid}>
                        {STATUS_OPTIONS.map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[styles.statusCard, status === opt.key && { borderColor: opt.color, backgroundColor: `${opt.color}18` }]}
                                onPress={() => setStatus(opt.key)}
                                activeOpacity={0.85}>
                                <Text style={styles.statusIcon}>{opt.icon}</Text>
                                <Text style={[styles.statusLabel, status === opt.key && { color: opt.color }]}>{opt.label}</Text>
                                {status === opt.key && <View style={[styles.selectedDot, { backgroundColor: opt.color }]} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Last Updated */}
                {lastUpdated && (
                    <View style={styles.lastUpdatedBox}>
                        <Text style={styles.lastUpdatedText}>✅ Last updated at {lastUpdated}</Text>
                    </View>
                )}

                {/* Update Button */}
                <TouchableOpacity
                    style={[styles.updateBtn, updating && { opacity: 0.75 }]}
                    onPress={handleUpdate}
                    disabled={updating}
                    activeOpacity={0.88}>
                    {updating
                        ? <ActivityIndicator color={WHITE} size="small" />
                        : <Text style={styles.updateBtnText}>📤  Send Location Update</Text>}
                </TouchableOpacity>

                {/* Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>📶 Location is shared with the dispatch center to assign you to nearby emergencies. Keep this updated when on shift.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { padding: 20, paddingBottom: 40 },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 },
    back: { fontSize: 15, color: PURPLE_LIGHT, fontWeight: '700' },
    title: { fontSize: 22, fontWeight: '900', color: WHITE },

    mapBox: {
        height: 200, backgroundColor: '#0F1A2E', borderRadius: 20,
        marginBottom: 14, overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(123,47,190,0.3)', position: 'relative',
    },
    mapEmoji: { fontSize: 60, opacity: 0.15, position: 'absolute' },
    mapLabel: { position: 'absolute', top: 14, left: 16, fontSize: 12, fontWeight: '700', color: DIM, letterSpacing: 1 },
    pinDot: { position: 'absolute', top: '40%', left: '50%' },
    pinEmoji: { fontSize: 32 },
    mapOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(13,10,31,0.85)', padding: 12,
    },
    mapCoords: { fontSize: 13, fontWeight: '700', color: PURPLE_LIGHT },
    mapAddress: { fontSize: 12, color: DIM, marginTop: 2 },

    gpsBtn: {
        backgroundColor: CARD, borderRadius: 14, paddingVertical: 14,
        alignItems: 'center', marginBottom: 14,
        borderWidth: 1.5, borderColor: PURPLE,
    },
    gpsBtnText: { fontSize: 15, fontWeight: '800', color: PURPLE_LIGHT },

    locationCard: {
        backgroundColor: CARD, borderRadius: 16, padding: 14,
        marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)',
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    locationIcon: { fontSize: 24 },
    locationInfo: { flex: 1 },
    locationAddress: { fontSize: 14, fontWeight: '700', color: WHITE },
    locationCoords: { fontSize: 12, color: DIM, marginTop: 2 },
    accuracyBadge: { backgroundColor: 'rgba(0,229,160,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    accuracyText: { fontSize: 11, fontWeight: '800', color: GREEN },

    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: WHITE, marginBottom: 12 },
    statusGrid: { flexDirection: 'row', gap: 10 },
    statusCard: {
        flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 14,
        alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
        position: 'relative',
    },
    statusIcon: { fontSize: 24, marginBottom: 6 },
    statusLabel: { fontSize: 12, fontWeight: '800', color: DIM, textAlign: 'center' },
    selectedDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },

    lastUpdatedBox: {
        backgroundColor: 'rgba(0,229,160,0.08)', borderRadius: 12, padding: 12,
        marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)',
    },
    lastUpdatedText: { fontSize: 13, fontWeight: '700', color: GREEN, textAlign: 'center' },

    updateBtn: {
        backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 17,
        alignItems: 'center', marginBottom: 16,
        elevation: 4, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
    },
    updateBtnText: { fontSize: 16, fontWeight: '900', color: WHITE },

    infoBox: { backgroundColor: CARD, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: PURPLE },
    infoText: { fontSize: 12, color: DIM, lineHeight: 18 },
});

export default DriverUpdateLocationScreen;
