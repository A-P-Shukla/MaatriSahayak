import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    StatusBar, Image, ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG           = '#0A1F1A';
const CARD         = '#112920';
const GREEN        = '#00E5A0';
const DIM          = '#B8D4CC';
const WHITE        = '#FFFFFF';
const PURPLE_LIGHT = '#7B2FBE';
const YELLOW       = '#FFD700';

/* ── Reusable Role Card ─────────────────────────────────────────────────── */
interface RoleCardProps {
    borderColor: string;
    iconBg: string;
    image: any;
    title: string;
    subtitle: string;
    desc: string;
    primaryColor: string;
    primaryTextColor: string;
    primaryLabel: string;
    outlineColor: string;
    outlineLabel: string;
    onPrimary: () => void;
    onOutline: () => void;
}

const RoleCard = ({
    borderColor, iconBg, image, title, subtitle, desc,
    primaryColor, primaryTextColor, primaryLabel,
    outlineColor, outlineLabel, onPrimary, onOutline,
}: RoleCardProps) => (
    <View style={[styles.card, { borderColor }]}>

        {/* Icon + Title row */}
        <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                <Image source={image} style={styles.roleImage} />
            </View>
            <View style={styles.cardHeaderText}>
                <Text style={styles.roleTitle}>{title}</Text>
                <Text style={styles.roleSubtitle} numberOfLines={2}>{subtitle}</Text>
            </View>
        </View>

        {/* Description */}
        <Text style={styles.roleDesc}>{desc}</Text>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: borderColor + '40' }]} />

        {/* Primary Button */}
        <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: primaryColor }]}
            onPress={onPrimary}
            activeOpacity={0.88}
        >
            <Text style={[styles.primaryBtnText, { color: primaryTextColor }]}>
                {primaryLabel}
            </Text>
        </TouchableOpacity>

        {/* Outline Button */}
        <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: outlineColor }]}
            onPress={onOutline}
            activeOpacity={0.85}
        >
            <Text style={[styles.outlineBtnText, { color: YELLOW }]}>
                {outlineLabel}
            </Text>
        </TouchableOpacity>
    </View>
);

/* ── Main Screen ────────────────────────────────────────────────────────── */
const RoleSelectScreen = ({ navigation }: any) => {
    const { width } = useWindowDimensions();
    const cardWidth = Math.min(width - 40, 480); // max 480 on tablets

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Tricolor strip */}
            <View style={styles.tricolor}>
                <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
                <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.strip, { backgroundColor: '#138808' }]} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingHorizontal: (width - cardWidth) / 2 }]}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                {/* ── Brand Header ── */}
                <View style={styles.brandRow}>
                    <View style={styles.iconShadow}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.appIcon}
                        />
                    </View>
                    <Text style={styles.appName}>MaatriSahayak</Text>
                    <Text style={styles.tagline}>MATERNAL HEALTH MONITORING</Text>
                    <View style={styles.subtitleRow}>
                        <View style={styles.subtitleLine} />
                        <Text style={styles.subtitle}>Select your role to continue</Text>
                        <View style={styles.subtitleLine} />
                    </View>
                </View>

                {/* ── ASHA Card ── */}
                <RoleCard
                    borderColor={GREEN}
                    iconBg="#0d3d2a"
                    image={require('../../assets/asha_worker.png')}
                    title="ASHA Worker"
                    subtitle="ACCREDITED SOCIAL HEALTH ACTIVIST"
                    desc="Monitor pregnancies, record vitals, manage ANC visits and trigger emergency alerts for mothers in your area."
                    primaryColor={GREEN}
                    primaryTextColor={BG}
                    primaryLabel="Sign In as ASHA"
                    outlineColor={GREEN}
                    outlineLabel="Register as ASHA"
                    onPrimary={() => navigation.navigate('Login')}
                    onOutline={() => navigation.navigate('AshaRegister')}
                />

                {/* ── Driver Card ── */}
                <RoleCard
                    borderColor={PURPLE_LIGHT}
                    iconBg="#1e0635"
                    image={require('../../assets/ambulance_driver.png')}
                    title="Ambulance Driver"
                    subtitle="EMERGENCY RESPONSE PERSONNEL"
                    desc="Accept emergency dispatches, navigate to patients and complete life-saving ambulance rides across your district."
                    primaryColor={PURPLE_LIGHT}
                    primaryTextColor={WHITE}
                    primaryLabel="Sign In as Driver"
                    outlineColor={PURPLE_LIGHT}
                    outlineLabel="Register as Driver"
                    onPrimary={() => navigation.navigate('DriverLogin')}
                    onOutline={() => navigation.navigate('DriverRegister')}
                />

                {/* ── Footer ── */}
                <View style={styles.footerWrap}>
                    <Text style={styles.footer}>National Health Mission · Government of India</Text>
                    <Text style={styles.footer}>Made with ❤️ by Team MaatriSahayak</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

/* ── StyleSheet ─────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: BG,
    },

    tricolor: {
        flexDirection: 'row',
        height: 4,
        width: '100%',
    },
    strip: { flex: 1 },

    scroll: {
        flexGrow: 1,
        paddingBottom: 48,
    },

    /* Brand */
    brandRow: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 28,
        width: '100%',
    },
    iconShadow: {
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 14,
    },
    appIcon: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        borderRadius: 18,
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        color: WHITE,
        letterSpacing: 0.5,
        textAlign: 'center',
        marginBottom: 5,
    },
    tagline: {
        fontSize: 10,
        color: DIM,
        letterSpacing: 2.5,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 14,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '80%',
    },
    subtitleLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(184,212,204,0.2)',
    },
    subtitle: {
        fontSize: 13,
        color: DIM,
        opacity: 0.7,
        textAlign: 'center',
    },

    /* Card */
    card: {
        backgroundColor: CARD,
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 20,
        marginBottom: 16,
        width: '100%',
        alignSelf: 'stretch',
    },

    /* Card header — icon + title side by side */
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 12,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        overflow: 'hidden',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cardHeaderText: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: WHITE,
    },
    roleSubtitle: {
        fontSize: 10,
        color: DIM,
        letterSpacing: 1.4,
        fontWeight: '700',
        flexWrap: 'wrap',
    },

    roleDesc: {
        fontSize: 13,
        color: DIM,
        lineHeight: 20,
        marginBottom: 16,
    },

    divider: {
        height: 1,
        width: '100%',
        marginBottom: 16,
    },

    /* Buttons */
    primaryBtn: {
        width: '100%',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    primaryBtnText: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 0.4,
        textAlign: 'center',
    },
    outlineBtn: {
        width: '100%',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    outlineBtnText: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.3,
        textAlign: 'center',
    },

    /* Footer */
    footerWrap: {
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(184,212,204,0.1)',
    },
    footer: {
        textAlign: 'center',
        fontSize: 11,
        color: DIM,
        opacity: 0.45,
    },
});

export default RoleSelectScreen;
