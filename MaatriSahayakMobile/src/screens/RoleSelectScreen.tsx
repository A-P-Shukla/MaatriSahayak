import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    StatusBar, Image, ScrollView,
} from 'react-native';

const BG    = '#0A1F1A';
const CARD  = '#112920';
const GREEN = '#00E5A0';
const DIM   = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const PURPLE = '#4A1272';
const PURPLE_LIGHT = '#7B2FBE';
const YELLOW = '#FFFF00'

const RoleSelectScreen = ({ navigation }: any) => (
    <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={BG} />

        {/* Tricolor strip */}
        <View style={styles.tricolor}>
            <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
            <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.strip, { backgroundColor: '#138808' }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
            {/* Brand */}
            <View style={styles.brandRow}>
                <Image source={require('../../assets/icon.png')} style={styles.appIcon} />
                <Text style={styles.appName}>MaatriSahayak</Text>
                <Text style={styles.tagline}>MATERNAL HEALTH MONITORING</Text>
                <Text style={styles.subtitle}>Select your role to continue</Text>
            </View>

            {/* ASHA Card */}
            <View style={[styles.card, { borderColor: GREEN }]}>
                <View style={[styles.iconBox, { backgroundColor: '#0d3d2a' }]}>
                    <Image source={require('../../assets/asha_worker.png')} style={styles.roleImage} />
                </View>
                <Text style={styles.roleTitle}>ASHA Worker</Text>
                <Text style={styles.roleSubtitle}>ACCREDITED SOCIAL WORKER ASSISTANT</Text>
                <Text style={styles.roleDesc}>
                    Monitor pregnancies, record vitals, manage ANC visits and trigger emergency alerts.
                </Text>
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: GREEN }]}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.88}>
                    <Text style={[styles.primaryBtnText, { color: BG }]}>Sign In as ASHA</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: GREEN }]}
                    onPress={() => navigation.navigate('AshaRegister')}
                    activeOpacity={0.85}>
                    <Text style={[styles.outlineBtnText, { color: YELLOW}]}>Register as ASHA</Text>
                </TouchableOpacity>
            </View>

            {/* Driver Card */}
            <View style={[styles.card, { borderColor: PURPLE_LIGHT }]}>
                <View style={[styles.iconBox, { backgroundColor: '#1e0635' }]}>
                    <Image source={require('../../assets/ambulance_driver.png')} style={styles.roleImage} />
                </View>
                <Text style={styles.roleTitle}>Ambulance Driver</Text>
                <Text style={styles.roleSubtitle}>EMERGENCY RESPONSE PERSONNEL</Text>
                <Text style={styles.roleDesc}>
                    Accept emergency dispatches, navigate to patients and complete life-saving rides.
                </Text>
                <TouchableOpacity
                    style={[styles.primaryBtn, { backgroundColor: PURPLE_LIGHT }]}
                    onPress={() => navigation.navigate('DriverLogin')}
                    activeOpacity={0.88}>
                    <Text style={[styles.primaryBtnText, { color: WHITE }]}>Sign In as Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: PURPLE_LIGHT }]}
                    onPress={() => navigation.navigate('DriverRegister')}
                    activeOpacity={0.85}>
                    <Text style={[styles.outlineBtnText, { color: YELLOW }]}>Register as Driver</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.footer}>National Health Mission · Government of India</Text>
            <Text style={styles.footer}>Made By Team MaatriSahayak ❤️</Text>
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    tricolor: { flexDirection: 'row', height: 5 },
    strip: { flex: 1 },
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    brandRow: { alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
    appIcon: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 12 },
    appName: { fontSize: 28, fontWeight: '900', color: WHITE, letterSpacing: 0.4 },
    tagline: { fontSize: 10, color: DIM, marginTop: 4, letterSpacing: 2, fontWeight: '700' },
    subtitle: { fontSize: 14, color: DIM, marginTop: 10, opacity: 0.7 },

    card: {
        backgroundColor: CARD, borderRadius: 20, padding: 22,
        marginBottom: 16, borderWidth: 1.5,
    },
    iconBox: {
        width: 64, height: 64, borderRadius: 16,
        overflow: 'hidden', marginBottom: 14,
    },
    roleImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    roleTitle: { fontSize: 20, fontWeight: '900', color: WHITE, marginBottom: 4 },
    roleSubtitle: { fontSize: 10, color: DIM, letterSpacing: 1.5, fontWeight: '700', marginBottom: 10 },
    roleDesc: { fontSize: 13, color: DIM, lineHeight: 20, marginBottom: 18 },

    primaryBtn: {
        borderRadius: 12, paddingVertical: 15,
        alignItems: 'center', marginBottom: 10,
    },
    primaryBtnText: { fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },

    outlineBtn: {
        borderWidth: 2, borderRadius: 12,
        paddingVertical: 13, alignItems: 'center',
        backgroundColor: 'transparent',
    },
    outlineBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },

    footer: { textAlign: 'center', fontSize: 11, color: DIM, opacity: 0.5, marginTop: 8 },
});

export default RoleSelectScreen;
