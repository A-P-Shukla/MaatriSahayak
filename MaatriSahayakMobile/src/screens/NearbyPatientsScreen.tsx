import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Platform, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPregnanciesThunk } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const RED = '#FF6B6B';
const ORANGE = '#FFA040';

const riskConfig: Record<string, { color: string; bg: string; label: string }> = {
    HIGH:     { color: RED,    bg: 'rgba(255,107,107,0.15)', label: 'HIGH' },
    CRITICAL: { color: RED,    bg: 'rgba(255,107,107,0.15)', label: 'CRITICAL' },
    MEDIUM:   { color: ORANGE, bg: 'rgba(255,160,64,0.15)',  label: 'MEDIUM' },
    LOW:      { color: GREEN,  bg: 'rgba(0,229,160,0.15)',   label: 'LOW' },
};

// Calculate distance between two coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const NearbyPatientsScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { pregnancies, loading, error } = useSelector((s: RootState) => s.pregnancy);
    const { user } = useSelector((s: RootState) => s.auth);
    
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [radiusKm, setRadiusKm] = useState(10); // Default 10km radius

    useEffect(() => {
        getLocation();
        dispatch(fetchPregnanciesThunk());
    }, []);

    const getLocation = async () => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'Please enable location access to see nearby patients.',
                    [{ text: 'OK' }]
                );
                setLocationLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            setLocation(loc);
            setLocationLoading(false);
        } catch (err) {
            console.error('Location error:', err);
            Alert.alert('Error', 'Failed to get your location. Please try again.');
            setLocationLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            dispatch(fetchPregnanciesThunk()),
            getLocation(),
        ]);
        setRefreshing(false);
    };

    // Filter and sort pregnancies by distance
    const nearbyPatients = location
        ? pregnancies
            .map(p => {
                // If pregnancy has location, calculate distance
                if (p.location?.latitude && p.location?.longitude) {
                    const distance = calculateDistance(
                        location.coords.latitude,
                        location.coords.longitude,
                        p.location.latitude,
                        p.location.longitude
                    );
                    return { ...p, distance };
                }
                // If no location, assume same village/district
                if (p.village === user?.village || p.district === user?.district) {
                    return { ...p, distance: 5 }; // Assume 5km for same area
                }
                return null;
            })
            .filter((p): p is NonNullable<typeof p> => p !== null && p.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
        : [];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nearby Patients</Text>
                <TouchableOpacity onPress={getLocation} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.refreshIcon}>📍</Text>
                </TouchableOpacity>
            </View>

            {/* Location Status */}
            <View style={styles.locationBar}>
                {locationLoading ? (
                    <View style={styles.locationLoading}>
                        <ActivityIndicator color={GREEN} size="small" />
                        <Text style={styles.locationText}>Getting your location...</Text>
                    </View>
                ) : location ? (
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <View style={styles.locationDetails}>
                            <Text style={styles.locationText}>
                                {user?.village}, {user?.district}
                            </Text>
                            <Text style={styles.locationSubtext}>
                                Showing patients within {radiusKm}km
                            </Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.locationError} onPress={getLocation}>
                        <Text style={styles.locationErrorText}>⚠️ Location unavailable - Tap to retry</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Radius Filter */}
            <View style={styles.radiusFilter}>
                <Text style={styles.radiusLabel}>Search Radius:</Text>
                <View style={styles.radiusButtons}>
                    {[5, 10, 20, 50].map(km => (
                        <TouchableOpacity
                            key={km}
                            style={[styles.radiusBtn, radiusKm === km && styles.radiusBtnActive]}
                            onPress={() => setRadiusKm(km)}
                        >
                            <Text style={[styles.radiusBtnText, radiusKm === km && styles.radiusBtnTextActive]}>
                                {km}km
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {loading && !refreshing && (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={GREEN} size="large" />
                </View>
            )}

            {!!error && (
                <View style={styles.errorWrap}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => dispatch(fetchPregnanciesThunk())}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && (
                <ScrollView
                    style={styles.body}
                    contentContainerStyle={styles.bodyContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}>

                    <Text style={styles.count}>
                        {nearbyPatients.length} patient{nearbyPatients.length !== 1 ? 's' : ''} nearby
                    </Text>

                    {nearbyPatients.length === 0 && !loading && location && (
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyEmoji}>🔍</Text>
                            <Text style={styles.emptyText}>No patients found within {radiusKm}km</Text>
                            <Text style={styles.emptySubtext}>Try increasing the search radius</Text>
                        </View>
                    )}

                    {!location && !locationLoading && (
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyEmoji}>📍</Text>
                            <Text style={styles.emptyText}>Location access required</Text>
                            <TouchableOpacity style={styles.enableBtn} onPress={getLocation}>
                                <Text style={styles.enableBtnText}>Enable Location</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {nearbyPatients.map(p => {
                        const risk = riskConfig[p.risk_level] || riskConfig.LOW;
                        return (
                            <TouchableOpacity
                                key={p.id}
                                style={styles.card}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('Vitals', { pregnancyId: p.id, patientName: p.patient_name })}>

                                <View style={styles.cardTop}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarLetter}>{p.patient_name?.charAt(0) ?? '?'}</Text>
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardName}>{p.patient_name}</Text>
                                        <Text style={styles.cardMeta}>Age {p.age}  ·  EDD: {p.edd?.slice(0, 10)}</Text>
                                        <View style={styles.distanceRow}>
                                            <Text style={styles.distanceIcon}>📍</Text>
                                            <Text style={styles.distanceText}>
                                                {p.distance < 1 
                                                    ? `${Math.round(p.distance * 1000)}m away`
                                                    : `${p.distance.toFixed(1)}km away`}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                                        <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                                        <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardActions}>
                                    <TouchableOpacity style={styles.actionBtn}
                                        onPress={() => navigation.navigate('Vitals', { pregnancyId: p.id, patientName: p.patient_name })}>
                                        <Text style={styles.actionText}>Record Vitals</Text>
                                    </TouchableOpacity>
                                    <View style={styles.actionDivider} />
                                    <TouchableOpacity style={styles.actionBtn}
                                        onPress={() => navigation.navigate('AncCard', { pregnancyId: p.id, patientName: p.patient_name })}>
                                        <Text style={styles.actionText}>Scan ANC</Text>
                                    </TouchableOpacity>
                                    <View style={styles.actionDivider} />
                                    <TouchableOpacity style={styles.actionBtn}
                                        onPress={() => navigation.navigate('Emergency', { pregnancyId: p.id, patientName: p.patient_name, phone: p.phone })}>
                                        <Text style={[styles.actionText, { color: RED }]}>Emergency</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        backgroundColor: CARD,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE },
    refreshIcon: { fontSize: 20 },
    locationBar: { backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDER },
    locationLoading: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
    locationInfo: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    locationIcon: { fontSize: 20, marginRight: 10 },
    locationDetails: { flex: 1 },
    locationText: { fontSize: 14, color: WHITE, fontWeight: '600' },
    locationSubtext: { fontSize: 12, color: DIM, marginTop: 2 },
    locationError: { padding: 12 },
    locationErrorText: { fontSize: 13, color: ORANGE, fontWeight: '600', textAlign: 'center' },
    radiusFilter: {
        backgroundColor: CARD, padding: 12,
        flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    radiusLabel: { fontSize: 13, color: DIM, fontWeight: '600', marginRight: 12 },
    radiusButtons: { flexDirection: 'row', gap: 8 },
    radiusBtn: {
        paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 16, borderWidth: 1.5, borderColor: BORDER,
        backgroundColor: BG,
    },
    radiusBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
    radiusBtnText: { fontSize: 12, color: DIM, fontWeight: '700' },
    radiusBtnTextActive: { color: BG },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorWrap: { padding: 20, alignItems: 'center' },
    errorText: { color: RED, fontSize: 14, marginBottom: 8 },
    retryText: { color: GREEN, fontSize: 14, fontWeight: '700' },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 40 },
    count: { fontSize: 12, color: DIM, fontWeight: '600', letterSpacing: 0.3, marginBottom: 12, textTransform: 'uppercase' },
    emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: WHITE, fontSize: 16, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
    emptySubtext: { color: DIM, fontSize: 14, textAlign: 'center' },
    enableBtn: {
        backgroundColor: GREEN, paddingHorizontal: 24, paddingVertical: 12,
        borderRadius: 24, marginTop: 20,
    },
    enableBtnText: { color: BG, fontSize: 14, fontWeight: '700' },
    card: {
        backgroundColor: CARD, borderRadius: 16, marginBottom: 12,
        borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(0,229,160,0.15)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    avatarLetter: { fontSize: 18, fontWeight: '700', color: GREEN },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 2 },
    cardMeta: { fontSize: 12, color: DIM, marginBottom: 4 },
    distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    distanceIcon: { fontSize: 12 },
    distanceText: { fontSize: 12, color: GREEN, fontWeight: '600' },
    riskBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    riskDot: { width: 6, height: 6, borderRadius: 3 },
    riskText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
    cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
    actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    actionDivider: { width: 1, backgroundColor: BORDER },
    actionText: { fontSize: 13, fontWeight: '600', color: GREEN },
});

export default NearbyPatientsScreen;
