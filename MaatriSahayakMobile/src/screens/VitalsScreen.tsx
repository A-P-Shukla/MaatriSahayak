import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, StatusBar, ActivityIndicator,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { recordVitalsThunk, clearPregnancyError } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';
import { useTranslation } from 'react-i18next';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const RED = '#FF6B6B';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const PLACEHOLDER = '#7AADA0';

const VitalsScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { submitting, error } = useSelector((s: RootState) => s.pregnancy);
    const { user } = useSelector((s: RootState) => s.auth);

    const pregnancyId = route?.params?.pregnancyId || '';
    const patientName = route?.params?.patientName || t('vitals.patient');

    const [vitals, setVitals] = useState({
        bpSystolic: '', bpDiastolic: '', weight: '',
        hemoglobin: '', temperature: '', heartRate: '',
        oxygenSaturation: '', notes: '',
    });

    const set = (key: string) => (val: string) => setVitals(v => ({ ...v, [key]: val }));

    useEffect(() => {
        if (error) {
            Alert.alert(t('common.error'), error, [{ text: t('common.ok'), onPress: () => dispatch(clearPregnancyError()) }]);
        }
    }, [error]);

    const handleSubmit = async () => {
        if (!vitals.bpSystolic.trim() || !vitals.bpDiastolic.trim()) {
            Alert.alert(t('vitals.missingFields'), t('vitals.bpRequired'));
            return;
        }

        // Validate BP values
        const systolic = parseInt(vitals.bpSystolic, 10);
        const diastolic = parseInt(vitals.bpDiastolic, 10);
        if (isNaN(systolic) || isNaN(diastolic) || systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150) {
            Alert.alert(t('vitals.invalidValues'), t('vitals.validBpPrompt'));
            return;
        }

        if (!pregnancyId) {
            Alert.alert(t('common.error'), t('vitals.noPregnancy'));
            return;
        }

        const result = await dispatch(recordVitalsThunk({
            pregnancy_id: pregnancyId,
            bp_systolic: systolic,
            bp_diastolic: diastolic,
            heart_rate: vitals.heartRate ? parseInt(vitals.heartRate, 10) : undefined,
            temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
            oxygen_saturation: vitals.oxygenSaturation ? parseInt(vitals.oxygenSaturation, 10) : undefined,
            weight: vitals.weight ? parseFloat(vitals.weight) : undefined,
            hemoglobin: vitals.hemoglobin ? parseFloat(vitals.hemoglobin) : undefined,
            notes: vitals.notes.trim() || undefined,
            recorded_by: user?.id || '',
        }));

        if (recordVitalsThunk.fulfilled.match(result)) {
            Alert.alert(t('vitals.saved'), t('vitals.successMessage'), [
                { text: t('common.ok'), onPress: () => navigation.goBack() },
            ]);
        }
    };

    const fields = [
        { label: t('vitals.bpSystolic'), key: 'bpSystolic', placeholder: t('vitals.bpSystolicPlaceholder'), keyboard: 'numeric' as any, required: true },
        { label: t('vitals.bpDiastolic'), key: 'bpDiastolic', placeholder: t('vitals.bpDiastolicPlaceholder'), keyboard: 'numeric' as any, required: true },
        { label: t('vitals.weight'), key: 'weight', placeholder: t('vitals.weightPlaceholder'), keyboard: 'numeric' as any },
        { label: t('vitals.hemoglobin'), key: 'hemoglobin', placeholder: t('vitals.hemoglobinPlaceholder'), keyboard: 'numeric' as any },
        { label: t('vitals.temperature'), key: 'temperature', placeholder: t('vitals.temperaturePlaceholder'), keyboard: 'numeric' as any },
        { label: t('vitals.heartRate'), key: 'heartRate', placeholder: t('vitals.heartRatePlaceholder'), keyboard: 'numeric' as any },
        { label: t('vitals.oxygenSaturation'), key: 'oxygenSaturation', placeholder: t('vitals.oxygenSaturationPlaceholder'), keyboard: 'numeric' as any },
    ];

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('vitals.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            {!!patientName && (
                <View style={styles.patientBanner}>
                    <Text style={styles.patientBannerText}>📋  {patientName}</Text>
                </View>
            )}

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>{t('vitals.vitalSigns')}</Text>
                    {fields.map(f => (
                        <View key={f.key} style={styles.fieldGroup}>
                            <Text style={styles.label}>
                                {f.label}{f.required && <Text style={styles.required}> *</Text>}
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={(vitals as any)[f.key]}
                                onChangeText={set(f.key)}
                                placeholder={f.placeholder}
                                placeholderTextColor={PLACEHOLDER}
                                keyboardType={f.keyboard || 'default'}
                            />
                        </View>
                    ))}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>{t('vitals.notes')}</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={vitals.notes}
                        onChangeText={set('notes')}
                        placeholder={t('vitals.notesPlaceholder')}
                        placeholderTextColor={PLACEHOLDER}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                    onPress={handleSubmit} disabled={submitting} activeOpacity={0.9}>
                    {submitting
                        ? <ActivityIndicator color={BG} size="small" />
                        : <Text style={styles.submitText}>{t('vitals.saveButton')}</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        backgroundColor: CARD, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
    patientBanner: { backgroundColor: 'rgba(0,229,160,0.1)', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER },
    patientBannerText: { color: GREEN, fontSize: 14, fontWeight: '700' },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 40, gap: 12 },
    card: { backgroundColor: CARD, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: BORDER },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: GREEN, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 },
    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 11, fontWeight: '700', color: DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
    required: { color: RED },
    input: { backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: WHITE },
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
    submitBtn: {
        backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16,
        alignItems: 'center', marginTop: 4, elevation: 4,
        shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    submitText: { color: BG, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
});

export default VitalsScreen;
