import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, StatusBar,
    ScrollView, Image, Alert, Platform, ActivityIndicator, SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StorageService } from '../services/storage';

const BG     = '#0A1F1A';
const CARD   = '#112920';
const GREEN  = '#00E5A0';
const DIM    = '#7A9E90';
const WHITE  = '#FFFFFF';
const BORDER = '#1E3D33';
const GOLD   = '#FFD700';

const generateAshaId = (phone: string, district: string): string => {
    const distCode = district.slice(0, 3).toUpperCase().padEnd(3, 'X');
    const phoneSuffix = phone.slice(-4).padStart(4, '0');
    const year = new Date().getFullYear().toString().slice(-2);
    const rand = Math.floor(100 + Math.random() * 900);
    return `ASHA-${distCode}-${year}${phoneSuffix}-${rand}`;
};

const AshaIdCardScreen = ({ navigation, route }: any) => {
    const params = route?.params ?? {};
    const fullName = params.fullName ?? 'ASHA Worker';
    const phone    = params.phone    ?? '0000000000';
    const district = params.district ?? 'General';
    const [ashaId]  = useState<string>(params.ashaId || generateAshaId(phone, district));
    const [photo, setPhoto]   = useState<string | null>(params.photo ?? null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!params.photo) StorageService.getPhoto().then(p => { if (p) setPhoto(p); });
    }, []);

    const pickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow photo library access.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please allow camera access.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0].uri);
    };

    const showPhotoOptions = () => {
        Alert.alert('Add Photo', 'Choose an option', [
            { text: '📷  Camera',  onPress: takePhoto },
            { text: '🖼️  Gallery', onPress: pickPhoto },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleContinue = async () => {
        setSaving(true);
        await StorageService.setAshaProfile({ fullName, phone, district, ashaId });
        if (photo) await StorageService.setPhoto(photo);
        setSaving(false);
        navigation.navigate('SetPin', { fullName, phone, district, ashaId, photo });
    };

    const issueDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your ID Card</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">

                <Text style={styles.hint}>Your ASHA Worker ID has been generated</Text>

                {/* ── ID CARD ── */}
                <View style={styles.idCard}>

                    {/* Tricolor + org header */}
                    <View style={styles.cardTop}>
                        <View style={styles.tricolor}>
                            <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
                            <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
                            <View style={[styles.strip, { backgroundColor: '#138808' }]} />
                        </View>
                        <View style={styles.cardOrgRow}>
                            <Text style={styles.cardOrg}>🇮🇳  National Health Mission</Text>
                            <Text style={styles.cardTitle}>ASHA Worker Identity Card</Text>
                        </View>
                    </View>

                    {/* Photo + Info */}
                    <View style={styles.cardBody}>

                        {/* Photo box */}
                        <TouchableOpacity
                            style={styles.photoBox}
                            onPress={showPhotoOptions}
                            activeOpacity={0.8}>
                            {photo
                                ? <Image source={{ uri: photo }} style={styles.photoImg} />
                                : <View style={styles.photoPlaceholder}>
                                    <Text style={styles.photoEmoji}>📷</Text>
                                    <Text style={styles.photoHint}>Tap to{'\n'}add photo</Text>
                                </View>
                            }
                            <View style={styles.editBadge}>
                                <Text style={styles.editBadgeText}>✎</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Info rows */}
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName} numberOfLines={2}>{fullName}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>District</Text>
                                <Text style={styles.infoValue}>{district}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>+91 {phone}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Issued</Text>
                                <Text style={styles.infoValue}>{issueDate}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ID bar */}
                    <View style={styles.idBar}>
                        <Text style={styles.idBarLabel}>WORKER ID</Text>
                        <Text style={styles.idBarValue}>{ashaId}</Text>
                    </View>

                    {/* Card footer */}
                    <View style={styles.cardFooter}>
                        <Text style={styles.cardFooterText}>MaatriSahayak  •  Govt. of India</Text>
                    </View>
                </View>

                {/* Add Photo button */}
                <TouchableOpacity style={styles.photoBtn} onPress={showPhotoOptions} activeOpacity={0.85}>
                    <Text style={styles.photoBtnText}>
                        {photo ? '🔄   Change Photo' : '📷   Add Photo'}
                    </Text>
                </TouchableOpacity>

                {/* Continue to PIN */}
                <TouchableOpacity
                    style={[styles.continueBtn, saving && { opacity: 0.7 }]}
                    onPress={handleContinue}
                    disabled={saving}
                    activeOpacity={0.85}>
                    {saving
                        ? <ActivityIndicator color={BG} size="small" />
                        : <Text style={styles.continueBtnText}>Set Login PIN  →</Text>}
                </TouchableOpacity>

                <Text style={styles.note}>You'll use a 4-digit PIN to log in every time</Text>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    header: {
        backgroundColor: CARD,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE },

    scroll: { padding: 20, paddingBottom: 52 },
    hint: { fontSize: 13, color: DIM, textAlign: 'center', marginBottom: 20 },

    /* ── ID Card ── */
    idCard: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: GOLD,
        backgroundColor: '#0C2318',
        elevation: 10,
        shadowColor: GOLD,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
    },

    cardTop: { backgroundColor: '#071A14' },
    tricolor: { flexDirection: 'row', height: 6 },
    strip: { flex: 1 },
    cardOrgRow: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', gap: 4 },
    cardOrg: { fontSize: 11, color: GOLD, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
    cardTitle: { fontSize: 15, color: WHITE, fontWeight: '800', letterSpacing: 0.3 },

    cardBody: { flexDirection: 'row', padding: 18, gap: 16, alignItems: 'flex-start' },

    photoBox: {
        width: 88, height: 108,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: GOLD,
    },
    photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoPlaceholder: {
        flex: 1,
        backgroundColor: BG,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    photoEmoji: { fontSize: 26 },
    photoHint: { fontSize: 10, color: DIM, textAlign: 'center', lineHeight: 14 },
    editBadge: {
        position: 'absolute', bottom: 4, right: 4,
        backgroundColor: GREEN, borderRadius: 10,
        width: 20, height: 20,
        alignItems: 'center', justifyContent: 'center',
    },
    editBadgeText: { fontSize: 11, color: BG, fontWeight: '800' },

    cardInfo: { flex: 1, gap: 7, justifyContent: 'center' },
    cardName: { fontSize: 15, fontWeight: '900', color: WHITE, lineHeight: 20, marginBottom: 4 },
    infoRow: { flexDirection: 'row', gap: 6 },
    infoLabel: { fontSize: 10, color: DIM, fontWeight: '700', width: 46, textTransform: 'uppercase' },
    infoValue: { fontSize: 11, color: WHITE, fontWeight: '600', flex: 1 },

    idBar: {
        backgroundColor: '#071A14',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    idBarLabel: { fontSize: 9, color: GOLD, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
    idBarValue: { fontSize: 13, color: GREEN, fontWeight: '900', letterSpacing: 0.8 },

    cardFooter: {
        backgroundColor: '#071A14',
        paddingVertical: 8,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    cardFooterText: { fontSize: 10, color: DIM, fontWeight: '600', letterSpacing: 0.5 },

    /* ── Buttons ── */
    photoBtn: {
        marginTop: 18,
        borderWidth: 1.5,
        borderColor: GREEN,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(0,229,160,0.07)',
    },
    photoBtnText: { color: GREEN, fontSize: 14, fontWeight: '700' },

    continueBtn: {
        marginTop: 12,
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
    continueBtnText: { color: BG, fontSize: 16, fontWeight: '900', letterSpacing: 0.4 },

    note: { textAlign: 'center', color: DIM, fontSize: 12, marginTop: 14 },
});

export default AshaIdCardScreen;
