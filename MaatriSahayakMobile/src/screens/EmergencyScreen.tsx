import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, StatusBar, ActivityIndicator,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { triggerEmergencyThunk, clearPregnancyError } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const RED = '#FF6B6B';
const ORANGE = '#FFA040';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const PLACEHOLDER = '#7AADA0';
const DANGER = '#C62828';

const severityOptions = [
    { label: 'Critical', value: 'CRITICAL', color: '#C62828' },
    { label: 'High',     value: 'HIGH',     color: RED },
    { label: 'Medium',   value: 'MEDIUM',   color: ORANGE },
];

const eventTypes = [
    'SEVERE_BLEEDING', 'HIGH_BP', 'SEIZURE', 'PROLONGED_LABOR',
    'FETAL_DISTRESS', 'UNCONSCIOUS', 'OTHER',
];

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

    const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearPregnancyError()) }]);
        }
    }, [error]);

    useEffect(() => { fetchLocation(); }, []);

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
            Alert.alert(
                '🚨 Alert Dispatched',
                'Hospital and ambulance have been notified immediately.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
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

                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>Emergency Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
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

                <View style={styles.locationCard}>
                    <Text style={styles.locationLabel}>📍 Location</Text>
                    {locLoading
                        ? <ActivityIndicator color={GREEN} size="small" />
                        : location
                            ? <Text style={styles.locationValue}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text>
                            : <TouchableOpacity onPress={fetchLocation}>
                                <Text style={styles.locationRetry}>Tap to get location</Text>
                            </TouchableOpacity>
                    }
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
    patientBanner: { backgroundColor: 'rgba(0,229,160,0.1)', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
    patientBannerText: { color: GREEN, fontSize: 14, fontWeight: '700' },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 40, gap: 12 },
    card: { backgroundColor: CARD, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: BORDER },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: GREEN, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 },
    typeScroll: { marginBottom: 4 },
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
    locationCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    locationLabel: { fontSize: 13, color: DIM, fontWeight: '600' },
    locationValue: { fontSize: 12, color: GREEN, fontWeight: '600' },
    locationRetry: { fontSize: 13, color: ORANGE, fontWeight: '600' },
    submitBtn: { borderRadius: 12, paddingVertical: 18, alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    submitText: { color: WHITE, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
});

export default EmergencyScreen;
