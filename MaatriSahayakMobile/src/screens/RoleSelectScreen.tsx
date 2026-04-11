import React, { useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    StatusBar, Image, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const WHITE = '#FFFFFF';
const DIM = '#7FA898';
const BORDER = '#1E3D30';

/* ── Main Screen ──────────────────────────────────────────────────────────── */
const RoleSelectScreen = ({ navigation }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUp1 = useRef(new Animated.Value(30)).current;
    const slideUp2 = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.stagger(150, [
                Animated.spring(slideUp1, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(slideUp2, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Tricolor strip */}
            <View style={styles.tricolor}>
                <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
                <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.strip, { backgroundColor: '#138808' }]} />
            </View>

            <View style={styles.container}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoGlow} />
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.appName}>MaatriSahayak</Text>
                    <View style={styles.taglineRow}>
                        <View style={styles.taglineDot} />
                        <Text style={styles.tagline}>मातृ स्वास्थ्य निगरानी</Text>
                        <View style={styles.taglineDot} />
                    </View>
                </Animated.View>

                {/* Main Content */}
                <View style={styles.content}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <Text style={styles.heading}>अपनी भूमिका चुनें</Text>
                        <Text style={styles.subheading}>Choose Your Role</Text>
                    </Animated.View>

                    {/* Role Cards */}
                    <View style={styles.cardsContainer}>
                        {/* ASHA Worker Card */}
                        <Animated.View
                            style={[
                                styles.cardWrapper,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideUp1 }],
                                },
                            ]}>
                            <TouchableOpacity
                                style={[styles.roleCard, styles.ashaCard]}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('Login')}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconCircle, styles.ashaIconCircle]}>
                                        <Text style={styles.iconEmoji}>👩‍⚕️</Text>
                                    </View>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>HEALTH WORKER</Text>
                                    </View>
                                </View>
                                <View style={styles.cardBody}>
                                    <Text style={styles.roleTitle}>आशा कार्यकर्ता</Text>
                                    <Text style={styles.roleTitleEn}>ASHA Worker</Text>
                                    <Text style={styles.roleDesc}>
                                        Monitor pregnancies, record vitals, and trigger emergency alerts
                                    </Text>
                                </View>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.actionText}>Continue</Text>
                                    <View style={styles.arrowCircle}>
                                        <Text style={styles.arrowIcon}>→</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Driver Card */}
                        <Animated.View
                            style={[
                                styles.cardWrapper,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideUp2 }],
                                },
                            ]}>
                            <TouchableOpacity
                                style={[styles.roleCard, styles.driverCard]}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('DriverLogin')}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconCircle, styles.driverIconCircle]}>
                                        <Text style={styles.iconEmoji}>🚑</Text>
                                    </View>
                                    <View style={[styles.badge, styles.driverBadge]}>
                                        <Text style={[styles.badgeText, styles.driverBadgeText]}>EMERGENCY</Text>
                                    </View>
                                </View>
                                <View style={styles.cardBody}>
                                    <Text style={styles.roleTitle}>एम्बुलेंस चालक</Text>
                                    <Text style={styles.roleTitleEn}>Ambulance Driver</Text>
                                    <Text style={styles.roleDesc}>
                                        Respond to emergencies and transport patients safely
                                    </Text>
                                </View>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.actionText}>Continue</Text>
                                    <View style={styles.arrowCircle}>
                                        <Text style={styles.arrowIcon}>→</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Register Link */}
                    <Animated.View style={[styles.registerContainer, { opacity: fadeAnim }]}>
                        <Text style={styles.registerText}>नया उपयोगकर्ता?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AshaRegister')}>
                            <Text style={styles.registerLink}>यहाँ पंजीकरण करें</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Footer */}
                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <View style={styles.footerDivider} />
                    <Text style={styles.footerText}>राष्ट्रीय स्वास्थ्य मिशन · भारत सरकार</Text>
                    <Text style={styles.footerTextEn}>National Health Mission · Government of India</Text>
                </Animated.View>
            </View>
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
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    /* Header */
    header: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 24,
    },
    logoContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logoGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: GREEN,
        opacity: 0.12,
    },
    logo: {
        width: 64,
        height: 64,
        borderRadius: 18,
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        color: WHITE,
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    taglineDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: GREEN,
    },
    tagline: {
        fontSize: 11,
        color: GREEN,
        fontWeight: '700',
        letterSpacing: 0.8,
    },

    /* Content */
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: '900',
        color: WHITE,
        textAlign: 'center',
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    subheading: {
        fontSize: 14,
        fontWeight: '600',
        color: DIM,
        textAlign: 'center',
        marginBottom: 32,
        letterSpacing: 0.3,
    },

    /* Cards */
    cardsContainer: {
        gap: 16,
    },
    cardWrapper: {
        width: '100%',
    },
    roleCard: {
        backgroundColor: CARD,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1.5,
        borderColor: BORDER,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    ashaCard: {
        borderLeftWidth: 4,
        borderLeftColor: GREEN,
    },
    driverCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#9D4EDD',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    ashaIconCircle: {
        backgroundColor: 'rgba(0,229,160,0.1)',
        borderColor: 'rgba(0,229,160,0.3)',
    },
    driverIconCircle: {
        backgroundColor: 'rgba(157,78,221,0.1)',
        borderColor: 'rgba(157,78,221,0.3)',
    },
    iconEmoji: {
        fontSize: 28,
    },
    badge: {
        backgroundColor: 'rgba(0,229,160,0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.3)',
    },
    driverBadge: {
        backgroundColor: 'rgba(157,78,221,0.15)',
        borderColor: 'rgba(157,78,221,0.3)',
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: GREEN,
        letterSpacing: 0.8,
    },
    driverBadgeText: {
        color: '#C77DFF',
    },
    cardBody: {
        marginBottom: 16,
    },
    roleTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: WHITE,
        marginBottom: 2,
        letterSpacing: -0.3,
    },
    roleTitleEn: {
        fontSize: 13,
        fontWeight: '700',
        color: DIM,
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    roleDesc: {
        fontSize: 12,
        color: DIM,
        lineHeight: 18,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: BORDER,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '800',
        color: GREEN,
        letterSpacing: 0.3,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: 'rgba(0,229,160,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.2)',
    },
    arrowIcon: {
        fontSize: 18,
        color: GREEN,
        fontWeight: '700',
    },

    /* Register */
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        marginTop: 24,
    },
    registerText: {
        fontSize: 13,
        color: DIM,
        fontWeight: '600',
    },
    registerLink: {
        fontSize: 13,
        fontWeight: '800',
        color: GREEN,
    },

    /* Footer */
    footer: {
        alignItems: 'center',
        paddingBottom: 16,
        gap: 6,
    },
    footerDivider: {
        width: 40,
        height: 3,
        borderRadius: 2,
        backgroundColor: BORDER,
        marginBottom: 8,
    },
    footerText: {
        fontSize: 10,
        color: DIM,
        fontWeight: '700',
        letterSpacing: 0.3,
        opacity: 0.7,
    },
    footerTextEn: {
        fontSize: 9,
        color: DIM,
        fontWeight: '600',
        letterSpacing: 0.3,
        opacity: 0.5,
    },
});

export default RoleSelectScreen;
