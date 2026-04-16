import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, Image,
    ScrollView, Alert, StatusBar, Platform, ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const RED = '#FF6B6B';
const ORANGE = '#FFA040';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';

const ScanANCCardScreen = ({ navigation, route }: any) => {
    const { t } = useTranslation();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [confidence, setConfidence] = useState<number>(0);

    const pregnancyId = route?.params?.pregnancyId;

    const handleTakePhoto = () => {
        launchCamera(
            {
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: true,
                saveToPhotos: false,
            },
            (response) => {
                if (response.didCancel) {
                    return;
                }
                if (response.errorCode) {
                    Alert.alert(t('common.error'), response.errorMessage || 'Camera error');
                    return;
                }
                if (response.assets && response.assets[0]) {
                    setImageUri(response.assets[0].uri || null);
                }
            }
        );
    };

    const handleChoosePhoto = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: true,
            },
            (response) => {
                if (response.didCancel) {
                    return;
                }
                if (response.errorCode) {
                    Alert.alert(t('common.error'), response.errorMessage || 'Gallery error');
                    return;
                }
                if (response.assets && response.assets[0]) {
                    setImageUri(response.assets[0].uri || null);
                }
            }
        );
    };

    const handleProcessCard = async () => {
        if (!imageUri) {
            Alert.alert(t('scanANC.noImage', 'No Image'), t('scanANC.takePhotoFirst', 'Please take a photo first'));
            return;
        }

        setProcessing(true);
        setExtractedData(null);

        try {
            // Convert image to base64
            const response = await fetch(imageUri);
            const blob = await response.blob();
            const reader = new FileReader();

            reader.onloadend = async () => {
                const base64data = reader.result as string;

                try {
                    // Call backend API
                    const result = await api.post('/anc-card/process', {
                        image_base64: base64data,
                        pregnancy_id: pregnancyId,
                    });

                    if (result.data.success) {
                        const data = result.data.data;
                        setExtractedData(data.extracted_data);
                        setConfidence(data.confidence_score);

                        if (data.requires_review) {
                            Alert.alert(
                                '⚠️ ' + t('scanANC.reviewRequired', 'Review Required'),
                                t('scanANC.lowConfidence', 'Some fields may need manual verification'),
                                [{ text: t('common.ok') }]
                            );
                        } else {
                            Alert.alert(
                                '✅ ' + t('scanANC.success', 'Success'),
                                t('scanANC.dataExtracted', 'Data extracted successfully!'),
                                [{ text: t('common.ok') }]
                            );
                        }
                    }
                } catch (error: any) {
                    Alert.alert(
                        t('common.error'),
                        error.response?.data?.message || t('scanANC.processingFailed', 'Failed to process ANC card')
                    );
                } finally {
                    setProcessing(false);
                }
            };

            reader.readAsDataURL(blob);
        } catch (error) {
            setProcessing(false);
            Alert.alert(t('common.error'), t('scanANC.imageFailed', 'Failed to read image'));
        }
    };

    const handleUseData = () => {
        if (extractedData) {
            navigation.navigate('RegisterPregnancy', { ancData: extractedData });
        }
    };

    const getConfidenceColor = (score: number) => {
        if (score >= 0.9) return GREEN;
        if (score >= 0.75) return ORANGE;
        return RED;
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('scanANC.title', 'Scan ANC Card')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>

                {/* Info Banner */}
                <View style={styles.infoBanner}>
                    <Text style={styles.infoBannerText}>
                        📋 {t('scanANC.info', 'Take a clear photo of the ANC card. AI will extract patient data automatically.')}
                    </Text>
                </View>

                {/* Image Preview */}
                {imageUri && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
                    </View>
                )}

                {/* Action Buttons */}
                {!imageUri && (
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity style={styles.primaryBtn} onPress={handleTakePhoto} activeOpacity={0.9}>
                            <Text style={styles.primaryBtnText}>📷 {t('scanANC.takePhoto', 'Take Photo')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={handleChoosePhoto} activeOpacity={0.9}>
                            <Text style={styles.secondaryBtnText}>🖼️ {t('scanANC.choosePhoto', 'Choose from Gallery')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {imageUri && !extractedData && (
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[styles.primaryBtn, processing && { opacity: 0.7 }]}
                            onPress={handleProcessCard}
                            disabled={processing}
                            activeOpacity={0.9}
                        >
                            {processing ? (
                                <ActivityIndicator color={BG} size="small" />
                            ) : (
                                <Text style={styles.primaryBtnText}>🤖 {t('scanANC.process', 'Process with AI')}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setImageUri(null)} activeOpacity={0.9}>
                            <Text style={styles.secondaryBtnText}>{t('scanANC.retake', 'Retake Photo')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Extracted Data */}
                {extractedData && (
                    <>
                        <View style={styles.confidenceCard}>
                            <Text style={styles.confidenceLabel}>{t('scanANC.confidence', 'AI Confidence')}</Text>
                            <Text style={[styles.confidenceValue, { color: getConfidenceColor(confidence) }]}>
                                {(confidence * 100).toFixed(0)}%
                            </Text>
                        </View>

                        <View style={styles.dataCard}>
                            <Text style={styles.sectionLabel}>{t('scanANC.extractedData', 'Extracted Data')}</Text>

                            {Object.entries(extractedData).map(([key, value]) => {
                                if (key === 'missing_critical_fields' || key === 'missing_fields' || !value) return null;
                                return (
                                    <View key={key} style={styles.dataRow}>
                                        <Text style={styles.dataKey}>{formatKey(key)}:</Text>
                                        <Text style={styles.dataValue}>{String(value)}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        <TouchableOpacity style={styles.primaryBtn} onPress={handleUseData} activeOpacity={0.9}>
                            <Text style={styles.primaryBtnText}>✅ {t('scanANC.useData', 'Use This Data')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => {
                            setImageUri(null);
                            setExtractedData(null);
                        }} activeOpacity={0.9}>
                            <Text style={styles.secondaryBtnText}>{t('scanANC.scanAnother', 'Scan Another Card')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const formatKey = (key: string): string => {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        backgroundColor: CARD,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 40 },
    infoBanner: {
        backgroundColor: 'rgba(0,229,160,0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.3)',
    },
    infoBannerText: { color: GREEN, fontSize: 13, lineHeight: 20 },
    imageContainer: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: BORDER,
    },
    image: { width: '100%', height: 300, borderRadius: 12 },
    buttonGroup: { gap: 12, marginBottom: 20 },
    primaryBtn: {
        backgroundColor: GREEN,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    primaryBtnText: { color: BG, fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
    secondaryBtn: {
        backgroundColor: CARD,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
    },
    secondaryBtnText: { color: WHITE, fontSize: 16, fontWeight: '600', letterSpacing: 0.4 },
    confidenceCard: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
    },
    confidenceLabel: { fontSize: 12, color: DIM, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
    confidenceValue: { fontSize: 36, fontWeight: '700' },
    dataCard: {
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: BORDER,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: GREEN,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    dataRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
    dataKey: { fontSize: 13, color: DIM, fontWeight: '600', flex: 1 },
    dataValue: { fontSize: 14, color: WHITE, fontWeight: '500', flex: 1.5 },
});

export default ScanANCCardScreen;
