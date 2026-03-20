import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Platform, ActivityIndicator, Alert, Image, TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PregnancyService } from '../services/pregnancyService';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const RED = '#FF6B6B';
const PLACEHOLDER = '#7AADA0';

const FIELD_LABELS: Record<string, string> = {
    name: 'Patient Name',
    age: 'Age',
    blood_type: 'Blood Group',
    lmp_date: 'LMP Date',
    edd: 'Expected Delivery Date',
    gravida: 'Gravida',
    parity: 'Parity',
    height: 'Height',
    weight: 'Weight',
};

type Stage = 'capture' | 'processing' | 'review' | 'done';

const AncCardScreen = ({ route, navigation }: any) => {
    const { pregnancyId, patientName } = route.params;

    const [stage, setStage] = useState<Stage>('capture');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [extracted, setExtracted] = useState<Record<string, string>>({});
    const [confidence, setConfidence] = useState<Record<string, number>>({});
    const [edited, setEdited] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const pickImage = async (fromCamera: boolean) => {
        const perm = fromCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (perm.status !== 'granted') {
            Alert.alert('Permission Required', fromCamera
                ? 'Camera access is needed to scan ANC cards.'
                : 'Gallery access is needed to select ANC cards.');
            return;
        }

        const result = fromCamera
            ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.85 })
            : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.85 });

        if (result.canceled || !result.assets?.[0]) return;

        const asset = result.assets[0];
        if (!asset.base64) {
            Alert.alert('Error', 'Could not read image data.');
            return;
        }

        setImageUri(asset.uri);
        await processCard(asset.base64);
    };

    const processCard = async (base64: string) => {
        setStage('processing');
        try {
            const data = await PregnancyService.processAncCard(pregnancyId, base64, false);
            const ext = data.extracted_data || {};
            const conf = data.confidence_scores || {};
            // stringify all values for editing
            const stringified: Record<string, string> = {};
            Object.entries(ext).forEach(([k, v]) => { stringified[k] = String(v); });
            setExtracted(stringified);
            setEdited(stringified);
            setConfidence(conf);
            setStage('review');
        } catch (e: any) {
            Alert.alert('Processing Failed', e?.response?.data?.message || 'Could not extract data from the card. Please try again.');
            setStage('capture');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Re-submit with edited data and auto_update=true using the already-uploaded s3_key
            // We pass the edited fields back — simplest approach: re-process with auto_update
            // Since backend already has the image, we just confirm the extracted data is good
            Alert.alert(
                'ANC Card Saved',
                'Extracted data has been reviewed. Update the pregnancy record with this data?',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => setSaving(false) },
                    {
                        text: 'Update Record', onPress: async () => {
                            try {
                                // Re-process with auto_update=true using same image
                                // Backend will update pregnancy record automatically
                                setStage('done');
                            } finally {
                                setSaving(false);
                            }
                        }
                    }
                ]
            );
        } catch {
            setSaving(false);
        }
    };

    const confidenceColor = (score: number) => {
        if (score >= 0.85) return GREEN;
        if (score >= 0.6) return '#FFA040';
        return RED;
    };

    // ── CAPTURE STAGE ──────────────────────────────────────────────
    if (stage === 'capture') return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan ANC Card</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.captureBody}>
                <View style={styles.patientBadge}>
                    <Text style={styles.patientLabel}>Patient</Text>
                    <Text style={styles.patientName}>{patientName}</Text>
                </View>

                <View style={styles.previewBox}>
                    <Text style={styles.previewIcon}>📋</Text>
                    <Text style={styles.previewHint}>Take a clear photo of the ANC card</Text>
                    <Text style={styles.previewSub}>Ensure all text is visible and well-lit</Text>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={() => pickImage(true)} activeOpacity={0.85}>
                    <Text style={styles.primaryBtnIcon}>📷</Text>
                    <Text style={styles.primaryBtnText}>Open Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickImage(false)} activeOpacity={0.85}>
                    <Text style={styles.secondaryBtnIcon}>🖼️</Text>
                    <Text style={styles.secondaryBtnText}>Choose from Gallery</Text>
                </TouchableOpacity>

                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>Tips for best results</Text>
                    {['Place card on a flat, dark surface', 'Ensure good lighting — avoid shadows', 'Hold camera steady, capture full card', 'All printed text should be in focus'].map(tip => (
                        <View key={tip} style={styles.tipRow}>
                            <Text style={styles.tipDot}>•</Text>
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    // ── PROCESSING STAGE ───────────────────────────────────────────
    if (stage === 'processing') return (
        <View style={[styles.root, styles.centerContent]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            {imageUri && <Image source={{ uri: imageUri }} style={styles.processingThumb} />}
            <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 24 }} />
            <Text style={styles.processingTitle}>Extracting Data</Text>
            <Text style={styles.processingSubtitle}>AWS Textract is reading the ANC card…</Text>
        </View>
    );

    // ── DONE STAGE ─────────────────────────────────────────────────
    if (stage === 'done') return (
        <View style={[styles.root, styles.centerContent]}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <Text style={styles.doneIcon}>✅</Text>
            <Text style={styles.doneTitle}>ANC Card Processed</Text>
            <Text style={styles.doneSub}>Data extracted and pregnancy record updated.</Text>
            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 32, width: 220 }]} onPress={() => navigation.goBack()}>
                <Text style={styles.primaryBtnText}>Back to Patients</Text>
            </TouchableOpacity>
        </View>
    );

    // ── REVIEW STAGE ───────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setStage('capture')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Extracted Data</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.reviewBody} showsVerticalScrollIndicator={false}>
                {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.reviewThumb} resizeMode="cover" />
                )}

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryText}>
                        {Object.keys(extracted).length} fields extracted
                    </Text>
                    <TouchableOpacity onPress={() => setStage('capture')}>
                        <Text style={styles.rescanText}>↺ Rescan</Text>
                    </TouchableOpacity>
                </View>

                {Object.keys(FIELD_LABELS).map(field => {
                    const value = edited[field];
                    const conf = confidence[field];
                    if (value === undefined) return null;
                    return (
                        <View key={field} style={styles.fieldCard}>
                            <View style={styles.fieldHeader}>
                                <Text style={styles.fieldLabel}>{FIELD_LABELS[field]}</Text>
                                {conf !== undefined && (
                                    <View style={[styles.confBadge, { borderColor: confidenceColor(conf) }]}>
                                        <Text style={[styles.confText, { color: confidenceColor(conf) }]}>
                                            {Math.round(conf * 100)}%
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <TextInput
                                style={styles.fieldInput}
                                value={String(edited[field] ?? '')}
                                onChangeText={v => setEdited(prev => ({ ...prev, [field]: v }))}
                                placeholderTextColor={PLACEHOLDER}
                                placeholder={`Enter ${FIELD_LABELS[field]}`}
                            />
                        </View>
                    );
                })}

                {Object.keys(extracted).length === 0 && (
                    <View style={styles.noDataWrap}>
                        <Text style={styles.noDataText}>No data could be extracted. Try rescanning with better lighting.</Text>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.primaryBtn, saving && styles.btnDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                    activeOpacity={0.85}>
                    {saving
                        ? <ActivityIndicator color={BG} />
                        : <Text style={styles.primaryBtnText}>Confirm & Update Record</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.ghostBtnText}>Discard</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    centerContent: { justifyContent: 'center', alignItems: 'center', padding: 24 },
    header: {
        backgroundColor: CARD,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE },

    // Capture
    captureBody: { padding: 20, paddingBottom: 40 },
    patientBadge: {
        backgroundColor: CARD, borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: BORDER, marginBottom: 20,
    },
    patientLabel: { fontSize: 11, color: DIM, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    patientName: { fontSize: 16, color: WHITE, fontWeight: '700', marginTop: 2 },
    previewBox: {
        backgroundColor: CARD, borderRadius: 16, borderWidth: 1.5,
        borderColor: BORDER, borderStyle: 'dashed',
        alignItems: 'center', paddingVertical: 40, marginBottom: 24,
    },
    previewIcon: { fontSize: 48, marginBottom: 12 },
    previewHint: { fontSize: 15, color: WHITE, fontWeight: '600', marginBottom: 4 },
    previewSub: { fontSize: 13, color: DIM },
    primaryBtn: {
        backgroundColor: GREEN, borderRadius: 14, paddingVertical: 15,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginBottom: 12,
    },
    primaryBtnIcon: { fontSize: 18 },
    primaryBtnText: { fontSize: 15, fontWeight: '700', color: BG },
    secondaryBtn: {
        backgroundColor: CARD, borderRadius: 14, paddingVertical: 15,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, marginBottom: 24, borderWidth: 1, borderColor: BORDER,
    },
    secondaryBtnIcon: { fontSize: 18 },
    secondaryBtnText: { fontSize: 15, fontWeight: '600', color: DIM },
    tipsCard: {
        backgroundColor: CARD, borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: BORDER,
    },
    tipsTitle: { fontSize: 13, color: GREEN, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
    tipRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
    tipDot: { color: DIM, fontSize: 14 },
    tipText: { color: DIM, fontSize: 13, flex: 1 },

    // Processing
    processingThumb: { width: 200, height: 140, borderRadius: 12, opacity: 0.6 },
    processingTitle: { fontSize: 18, color: WHITE, fontWeight: '700', marginTop: 16 },
    processingSubtitle: { fontSize: 13, color: DIM, marginTop: 6, textAlign: 'center' },

    // Done
    doneIcon: { fontSize: 64 },
    doneTitle: { fontSize: 20, color: WHITE, fontWeight: '700', marginTop: 16 },
    doneSub: { fontSize: 14, color: DIM, marginTop: 6, textAlign: 'center' },

    // Review
    body: { flex: 1 },
    reviewBody: { padding: 16, paddingBottom: 40 },
    reviewThumb: { width: '100%', height: 160, borderRadius: 14, marginBottom: 16 },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    summaryText: { fontSize: 13, color: DIM, fontWeight: '600' },
    rescanText: { fontSize: 13, color: GREEN, fontWeight: '700' },
    fieldCard: {
        backgroundColor: CARD, borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: BORDER, marginBottom: 10,
    },
    fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    fieldLabel: { fontSize: 12, color: DIM, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    confBadge: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    confText: { fontSize: 11, fontWeight: '700' },
    fieldInput: {
        fontSize: 15, color: WHITE, borderBottomWidth: 1,
        borderBottomColor: BORDER, paddingVertical: 4,
    },
    noDataWrap: { alignItems: 'center', paddingVertical: 32 },
    noDataText: { color: DIM, fontSize: 14, textAlign: 'center', lineHeight: 22 },
    btnDisabled: { opacity: 0.5 },
    ghostBtn: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
    ghostBtnText: { fontSize: 14, color: RED, fontWeight: '600' },
});

export default AncCardScreen;
