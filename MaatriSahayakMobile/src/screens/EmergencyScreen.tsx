import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, StatusBar, ActivityIndicator,
    KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { triggerEmergencyThunk, clearPregnancyError } from '../store/slices/pregnancySlice';
import { PregnancyService } from '../services/pregnancyService';
import api from '../services/api';
import { AppDispatch, RootState } from '../store';

const BG      = '#0A1F1A';
const CARD    = '#112920';
const GREEN   = '#00E5A0';
const RED     = '#FF6B6B';
const ORANGE  = '#FFA040';
const DIM     = '#B8D4CC';
const WHITE   = '#FFFFFF';
const BORDER  = '#3A6B58';
const PLACEHOLDER = '#7AADA0';
const DANGER  = '#C62828';

const severityOptions = [
    { label: 'Critical', value: 'CRITICAL', color: '#C62828' },
    { label: 'High',     value: 'HIGH',     color: RED },
    { label: 'Medium',   value: 'MEDIUM',   color: ORANGE },
];

const eventTypes = [
    'SEVERE_BLEEDING', 'HIGH_BP', 'SEIZURE', 'PROLONGED_LABOR',
    'FETAL_DISTRESS', 'UNCONSCIOUS', 'OTHER',
];

const typeLabel: Record<string, string> = {
    PHC: 'Primary Health Centre',
    CHC: 'Community Health Centre',
    DISTRICT: 'District Hospital',
    MEDICAL_COLLEGE: 'Medical College',
};

const EmergencyScreen = ({ navigation, route }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { submitting, error } = useSelector((s: RootState) => s.pregnancy);
    const { user } = useSelector((s: RootState) => s.auth);

    const pregnancyId = route?.params?.pregnancyId || '';
    const patientName = route?.params?.patientName || '';

    const [form, setForm] = useState({
        description: '',
        eventType: 'SEVERE_BLEEDING',
        severity: 'CRITICAL',
    });
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locLoading, setLocLoading] = useState(false);
    const [hospitals, setHospitals] = useState<any[]>([]);
    const [hospitalsLoading, setHospitalsLoading] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [driversLoading, setDriversLoading] = useState(false);

    const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

    useEffect(() => {
        if (error) Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearPregnancyError()) }]);
    }, [error]);

    useEffect(() => {
        fetchLocation();
        fetchHospitals();
    }, []);

    // Re-fetch hospitals and drivers once location is known
    useEffect(() => {
        if (location) {
            fetchHospitals(location);
            fetchNearbyDrivers();
        }
    }, [location]);

    const fetchLocation = async () => {
        setLocLoading(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            }
        } catch { /* location optional */ }
        setLocLoading(false);
    };

    const fetchHospitals = async (loc?: { latitude: number; longitude: number } | null) => {
        setHospitalsLoading(true);
        try {
            const useLoc = loc || location;
            const list = await PregnancyService.getNearbyHospitals(
                user?.district,
                useLoc?.latitude,
                useLoc?.longitude,
            );
            setHospitals(list);
            if (list.length > 0) setSelectedHospital(list[0].id);
        } catch { /* non-blocking */ }
        setHospitalsLoading(false);
    };

    const fetchNearbyDrivers = async () => {
        if (!location || !user?.district) return;
        setDriversLoading(true);
        try {
            const { data } = await api.post('/ambulances/nearest', {
                latitude: location.latitude,
                longitude: location.longitude,
                district: user.district,
                max_distance_km: 50,
            });
            setDrivers(data?.data?.ambulances || []);
        } catch { /* non-blocking */ }
        setDriversLoading(false);
    };

    const handleSubmit = async () => {
        if (!form.description.trim()) {
            Alert.alert('Missing Fields', 'Please describe the emergency situation.');
            return;
        }
        if (!pregnancyId) {
            Alert.alert('Error', 'No patient selected. Go back and select a patient first.');
            return;
        }

        const result = await dispatch(triggerEmergencyThunk({
            pregnancy_id: pregnancyId,
            event_type: form.eventType,
            severity: form.severity,
            description: form.description.trim(),
            latitude: location?.latitude ?? 0,
            longitude: location?.longitude ?? 0,
            triggered_by: user?.id || '',
        }));

        if (triggerEmergencyThunk.fulfilled.match(result)) {
            const emergencyData = (result.payload as any);
            Alert.alert(
                '🚨 Alert Dispatched',
                'Hospital and ambulance have been notified immediately.',
                [{ text: 'OK', onPress: () => navigation.navigate('Home', { activeEmergency: emergencyData }) }]
            );
        }
    };

    const selected = severityOptions.find(s => s.value === form.severity)!;

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={DANGER} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency Alert</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.alertBanner}>
                <View style={styles.alertDot} />
                <Text style={styles.alertBannerText}>
                    This will immediately notify the nearest hospital and ambulance
                </Text>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                {!!patientName && (
                    <View style={styles.patientBanner}>
                        <Text style={styles.patientBannerText}>👤  {patientName}</Text>
                    </View>
                )}

                {/* Emergency Type */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>Emergency Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {eventTypes.map(t => (
                            <TouchableOpacity key={t}
                                style={[styles.typeBtn, form.eventType === t && styles.typeBtnActive]}
                                onPress={() => set('eventType')(t)}>
                                <Text style={[styles.typeBtnText, form.eventType === t && styles.typeBtnTextActive]}>
                                    {t.replace(/_/g, ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Severity */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>Severity Level</Text>
                    <View style={styles.severityRow}>
                        {severityOptions.map(opt => (
                            <TouchableOpacity key={opt.value}
                                style={[styles.severityBtn, form.severity === opt.value && { borderColor: opt.color, backgroundColor: `${opt.color}22` }]}
                                onPress={() => set('severity')(opt.value)}>
                                <View style={[styles.severityDot, { backgroundColor: opt.color }]} />
                                <Text style={[styles.severityLabel, form.severity === opt.value && { color: opt.color, fontWeight: '700' }]}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Description */}
                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={form.description}
                        onChangeText={set('description')}
                        placeholder="Describe the emergency in detail..."
                        placeholderTextColor={PLACEHOLDER}
                        multiline numberOfLines={4} textAlignVertical="top"
                    />
                </View>

                {/* Nearby Hospitals */}
                <View style={styles.card}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionLabel}>Nearby Hospitals</Text>
                        <TouchableOpacity onPress={() => fetchHospitals()} disabled={hospitalsLoading}>
                            <Text style={styles.refreshText}>{hospitalsLoading ? 'Loading...' : '\u21bb Refresh'}</Text>
                        </TouchableOpacity>
                    </View>

                    {hospitalsLoading && (
                        <View style={styles.hospitalsLoading}>
                            <ActivityIndicator color={GREEN} size="small" />
                            <Text style={styles.hospitalsLoadingText}>Finding hospitals...</Text>
                        </View>
                    )}

                    {!hospitalsLoading && hospitals.length === 0 && (
                        <View style={styles.hospitalsEmpty}>
                            <Text style={styles.hospitalsEmptyText}>No hospitals found.</Text>
                            <TouchableOpacity onPress={() => fetchHospitals()}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {hospitals.map((h, idx) => {
                        const isSelected = selectedHospital === h.id;
                        const ownership = (h.ownership_type || h.ownership || '').toUpperCase();
                        const ownershipLabel =
                            ownership.includes('GOVT') || ownership.includes('GOVERNMENT') || ownership.includes('PUBLIC') ? 'GOVT'
                            : ownership.includes('MUNIC') ? 'MUNICIPAL'
                            : ownership ? ownership
                            : h.type === 'PHC' || h.type === 'CHC' || h.type === 'DISTRICT' || h.type === 'MEDICAL_COLLEGE' ? 'GOVT'
                            : 'PRIVATE';
                        const ownershipColor =
                            ownershipLabel === 'GOVT' ? GREEN
                            : ownershipLabel === 'MUNICIPAL' ? ORANGE
                            : '#A78BFA';
                        const ownershipBg =
                            ownershipLabel === 'GOVT' ? 'rgba(0,229,160,0.12)'
                            : ownershipLabel === 'MUNICIPAL' ? 'rgba(255,160,64,0.12)'
                            : 'rgba(167,139,250,0.12)';
                        return (
                            <TouchableOpacity
                                key={h.id || idx}
                                style={[styles.hospitalCard, isSelected && styles.hospitalCardSelected]}
                                onPress={() => setSelectedHospital(h.id)}
                                activeOpacity={0.8}>

                                <View style={styles.hospitalLeft}>
                                    <View style={[styles.hospitalIconWrap, isSelected && styles.hospitalIconWrapSelected]}>
                                        <Text style={styles.hospitalIcon}>\ud83c\udfe5</Text>
                                    </View>
                                    <View style={styles.hospitalInfo}>
                                        <Text style={styles.hospitalName} numberOfLines={1}>{h.name}</Text>
                                        <View style={styles.hospitalBadgeRow}>
                                            <View style={[styles.ownershipBadge, { backgroundColor: ownershipBg }]}>
                                                <Text style={[styles.ownershipBadgeText, { color: ownershipColor }]}>{ownershipLabel}</Text>
                                            </View>
                                            <Text style={styles.hospitalType}>{typeLabel[h.type] || h.type}</Text>
                                        </View>
                                        {h.address && (
                                            <Text style={styles.hospitalAddress} numberOfLines={1}>{h.address}</Text>
                                        )}
                                        <View style={styles.hospitalTags}>
                                            {h.has_blood_bank && (
                                                <View style={styles.tag}><Text style={styles.tagText}>\ud83e\ude78 Blood Bank</Text></View>
                                            )}
                                            {h.nicu_beds > 0 && (
                                                <View style={styles.tag}><Text style={styles.tagText}>\ud83d\udc76 NICU</Text></View>
                                            )}
                                            {h.available_maternity_beds > 0 && (
                                                <View style={styles.tag}><Text style={styles.tagText}>\ud83d\udecc {h.available_maternity_beds} beds</Text></View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.hospitalRight}>
                                    {h.distance_km != null && (
                                        <View style={styles.distBadge}>
                                            <Text style={styles.distKm}>{h.distance_km}</Text>
                                            <Text style={styles.distUnit}>km</Text>
                                        </View>
                                    )}
                                    {isSelected && (
                                        <View style={styles.selectedBadge}>
                                            <Text style={styles.selectedBadgeText}>\u2713</Text>
                                        </View>
                                    )}
                                    {h.phone && (
                                        <TouchableOpacity
                                            style={styles.callBtn}
                                            onPress={() => Linking.openURL(`tel:${h.phone}`)}>
                                            <Text style={styles.callBtnText}>\ud83d\udcde</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Nearby Drivers */}
                <View style={styles.card}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionLabel}>Nearby Drivers</Text>
                        <TouchableOpacity onPress={fetchNearbyDrivers} disabled={driversLoading}>
                            <Text style={styles.refreshText}>{driversLoading ? 'Refreshing...' : '↻ Refresh'}</Text>
                        </TouchableOpacity>
                    </View>

                    {!location && !driversLoading && (
                        <View style={styles.driversEmpty}>
                            <Text style={styles.driversEmptyText}>📍 Waiting for your location...</Text>
                        </View>
                    )}

                    {driversLoading && (
                        <View style={styles.driversLoading}>
                            <ActivityIndicator color={GREEN} size="small" />
                            <Text style={styles.driversLoadingText}>Finding nearby ambulances...</Text>
                        </View>
                    )}

                    {!driversLoading && location && drivers.length === 0 && (
                        <View style={styles.driversEmpty}>
                            <Text style={styles.driversEmptyText}>No available ambulances nearby</Text>
                        </View>
                    )}

                    {!driversLoading && drivers.map((d, idx) => {
                        const isAvailable = d.status === 'AVAILABLE';
                        const etaMins = d.estimated_time_minutes ?? Math.round((d.distance_km ?? 0) * 1.5);
                        return (
                            <View key={d.id || idx} style={styles.driverCard}>
                                <View style={styles.driverLeft}>
                                    <View style={[styles.driverAvatar, { backgroundColor: isAvailable ? 'rgba(0,229,160,0.12)' : 'rgba(255,82,82,0.1)' }]}>
                                        <Text style={styles.driverAvatarIcon}>🚑</Text>
                                        <View style={[styles.driverStatusDot, { backgroundColor: isAvailable ? GREEN : RED }]} />
                                    </View>
                                    <View style={styles.driverInfo}>
                                        <Text style={styles.driverName}>{d.driver_name || 'Driver'}</Text>
                                        <Text style={styles.driverVehicle}>{d.vehicle_number || '—'}</Text>
                                        <View style={styles.driverMeta}>
                                            <View style={[styles.driverStatusPill, { backgroundColor: isAvailable ? 'rgba(0,229,160,0.12)' : 'rgba(255,82,82,0.1)' }]}>
                                                <Text style={[styles.driverStatusText, { color: isAvailable ? GREEN : RED }]}>
                                                    {isAvailable ? 'Available' : d.status}
                                                </Text>
                                            </View>
                                            <Text style={styles.driverDist}>
                                                {d.distance_km != null ? `${d.distance_km.toFixed(1)} km` : ''}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.driverRight}>
                                    <Text style={styles.driverEtaLabel}>ETA</Text>
                                    <Text style={[styles.driverEta, { color: isAvailable ? GREEN : DIM }]}>
                                        ~{etaMins}m
                                    </Text>
                                    {d.driver_phone && (
                                        <TouchableOpacity
                                            style={styles.driverCallBtn}
                                            onPress={() => Linking.openURL(`tel:${d.driver_phone}`)}>
                                            <Text style={styles.driverCallIcon}>📞</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Location */}
                <View style={styles.locationCard}>
                    <View>
                        <Text style={styles.locationLabel}>📍 Your Location</Text>
                        {locLoading
                            ? <ActivityIndicator color={GREEN} size="small" style={{ marginTop: 4 }} />
                            : location
                                ? <Text style={styles.locationValue}>
                                    {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                                  </Text>
                                : <Text style={styles.locationMissing}>Location unavailable</Text>
                        }
                    </View>
                    {!locLoading && !location && (
                        <TouchableOpacity style={styles.retryBtn} onPress={fetchLocation}>
                            <Text style={styles.retryBtnText}>Get Location</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: selected.color }, submitting && { opacity: 0.8 }]}
                    onPress={handleSubmit} disabled={submitting} activeOpacity={0.9}>
                    {submitting
                        ? <ActivityIndicator color={WHITE} size="small" />
                        : <Text style={styles.submitText}>🚨  Send Emergency Alert</Text>}
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        backgroundColor: DANGER, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16, paddingHorizontal: 20,
    },
    back: { fontSize: 22, color: WHITE, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
    alertBanner: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(198,40,40,0.15)',
        paddingHorizontal: 20, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: 'rgba(198,40,40,0.3)',
    },
    alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: RED, marginRight: 10 },
    alertBannerText: { fontSize: 13, color: RED, fontWeight: '500', flex: 1 },
    patientBanner: { backgroundColor: 'rgba(0,229,160,0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)' },
    patientBannerText: { color: GREEN, fontSize: 14, fontWeight: '700' },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 40, gap: 12 },
    card: { backgroundColor: CARD, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: BORDER },
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: GREEN, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
    districtTag: { fontSize: 11, fontWeight: '700', color: DIM, backgroundColor: BG, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: BORDER },

    typeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, marginRight: 8, backgroundColor: BG },
    typeBtnActive: { borderColor: RED, backgroundColor: 'rgba(255,107,107,0.15)' },
    typeBtnText: { fontSize: 12, color: DIM, fontWeight: '600' },
    typeBtnTextActive: { color: RED, fontWeight: '700' },

    severityRow: { flexDirection: 'row', gap: 10 },
    severityBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: BORDER, backgroundColor: BG, gap: 6 },
    severityDot: { width: 8, height: 8, borderRadius: 4 },
    severityLabel: { fontSize: 13, fontWeight: '600', color: DIM },

    input: { backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: WHITE },
    textArea: { height: 110, textAlignVertical: 'top', paddingTop: 12 },

    // Hospitals
    hospitalsLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    hospitalsLoadingText: { color: DIM, fontSize: 13 },
    hospitalsEmpty: { alignItems: 'center', paddingVertical: 16, gap: 8 },
    hospitalsEmptyText: { color: DIM, fontSize: 13 },
    retryText: { color: GREEN, fontSize: 13, fontWeight: '700' },

    hospitalCard: {
        flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
        backgroundColor: BG, borderRadius: 12, padding: 12,
        marginBottom: 10, borderWidth: 1.5, borderColor: BORDER,
    },
    hospitalCardSelected: { borderColor: GREEN, backgroundColor: 'rgba(0,229,160,0.06)' },
    hospitalLeft: { flexDirection: 'row', flex: 1, gap: 10 },
    hospitalIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(58,107,88,0.3)', justifyContent: 'center', alignItems: 'center' },
    hospitalIconWrapSelected: { backgroundColor: 'rgba(0,229,160,0.15)' },
    hospitalIcon: { fontSize: 20 },
    hospitalInfo: { flex: 1 },
    hospitalName: { fontSize: 14, fontWeight: '800', color: WHITE, marginBottom: 2 },
    hospitalType: { fontSize: 11, color: GREEN, fontWeight: '600', marginBottom: 3 },
    hospitalAddress: { fontSize: 11, color: DIM, marginBottom: 6 },
    hospitalTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    tag: { backgroundColor: 'rgba(0,229,160,0.1)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)' },
    tagText: { fontSize: 10, color: DIM, fontWeight: '600' },
    hospitalRight: { alignItems: 'center', gap: 8, marginLeft: 8 },
    selectedBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center' },
    selectedBadgeText: { fontSize: 13, color: BG, fontWeight: '900' },
    callBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(0,229,160,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
    callBtnText: { fontSize: 16 },

    // Drivers
    driversLoading: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
    driversLoadingText: { color: DIM, fontSize: 13 },
    driversEmpty: { alignItems: 'center', paddingVertical: 16 },
    driversEmptyText: { color: DIM, fontSize: 13, fontWeight: '500' },
    refreshText: { fontSize: 12, color: GREEN, fontWeight: '700' },
    driverCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: BG, borderRadius: 14, padding: 12,
        marginBottom: 10, borderWidth: 1, borderColor: BORDER,
    },
    driverLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    driverAvatar: {
        width: 46, height: 46, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', position: 'relative',
    },
    driverAvatarIcon: { fontSize: 22 },
    driverStatusDot: {
        position: 'absolute', top: -2, right: -2,
        width: 10, height: 10, borderRadius: 5,
        borderWidth: 2, borderColor: CARD,
    },
    driverInfo: { flex: 1, gap: 3 },
    driverName: { fontSize: 14, fontWeight: '700', color: WHITE },
    driverVehicle: { fontSize: 11, color: DIM, fontWeight: '600' },
    driverMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
    driverStatusPill: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    driverStatusText: { fontSize: 10, fontWeight: '700' },
    driverDist: { fontSize: 11, color: DIM, fontWeight: '500' },
    driverRight: { alignItems: 'center', gap: 4, minWidth: 52 },
    driverEtaLabel: { fontSize: 9, color: DIM, fontWeight: '700', letterSpacing: 0.8 },
    driverEta: { fontSize: 16, fontWeight: '900' },
    driverCallBtn: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: 'rgba(0,229,160,0.1)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: BORDER, marginTop: 2,
    },
    driverCallIcon: { fontSize: 14 },

    // Location
    locationCard: {
        backgroundColor: CARD, borderRadius: 16, padding: 16,
        borderWidth: 1, borderColor: BORDER,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    locationLabel: { fontSize: 13, color: DIM, fontWeight: '600', marginBottom: 4 },
    locationValue: { fontSize: 12, color: GREEN, fontWeight: '600' },
    locationMissing: { fontSize: 12, color: ORANGE, fontWeight: '600' },
    retryBtn: { backgroundColor: 'rgba(0,229,160,0.1)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: BORDER },
    retryBtnText: { fontSize: 12, color: GREEN, fontWeight: '700' },

    submitBtn: { borderRadius: 12, paddingVertical: 18, alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    submitText: { color: WHITE, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
});

export default EmergencyScreen;
