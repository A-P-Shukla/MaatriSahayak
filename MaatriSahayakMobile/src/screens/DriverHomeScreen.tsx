import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, StatusBar, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import {
    registerForPushNotifications,
    addNotificationListener,
    addNotificationResponseListener,
    removeNotificationSubscription,
} from '../services/notificationService';

const BG = '#0A0F1A';
const CARD = '#111827';
const CARD2 = '#0D1520';
const PURPLE = '#7C3AED';
const PURPLEL = '#A78BFA';
const GREEN = '#00E5A0';
const RED = '#FF5252';
const ORANGE = '#FF9F43';
const DIM = '#6B7FA8';
const WHITE = '#FFFFFF';
const BORDER = '#1E2D45';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const QUICK_ACTIONS = [
    { key: 'DriverMyRides', icon: '📋', label: 'My Rides', sub: 'Trip history' },
    { key: 'DriverUpdateLocation', icon: '📍', label: 'Location', sub: 'Update GPS' },
    { key: 'DriverProfile', icon: '👤', label: 'Profile', sub: 'View details' },
    { key: 'DriverEmergencyTracking', icon: '🗺️', label: 'Navigate', sub: 'Active route' },
];

const DriverHomeScreen = ({ navigation }: any) => {
    const { width } = useWindowDimensions();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((s: RootState) => s.auth);
    const notifListener = useRef<any>(null);
    const responseListener = useRef<any>(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [totalRides, setTotalRides] = useState(0);

    const displayName = user?.name || 'Driver';
    const firstName = displayName.split(' ')[0];

    useEffect(() => {
        const initNotifications = async () => {
            await registerForPushNotifications();
        };
        initNotifications();

        notifListener.current = addNotificationListener((notification) => {
            const data = notification.request.content.data as any;
            const title = notification.request.content.title ?? 'New Alert';
            const body = notification.request.content.body ?? '';
            Alert.alert(`🚨 ${title}`, body, [
                { text: 'Dismiss', style: 'cancel' },
                { text: 'View Emergency', onPress: () => navigation.navigate('DriverEmergencyTracking', { emergency: data }) },
            ]);
        });

        responseListener.current = addNotificationResponseListener((response) => {
            const data = response.notification.request.content.data as any;
            if (data?.type === 'EMERGENCY') {
                navigation.navigate('DriverEmergencyTracking', { emergency: data });
            }
        });

        return () => {
            if (notifListener.current) removeNotificationSubscription(notifListener.current);
            if (responseListener.current) removeNotificationSubscription(responseListener.current);
        };
    }, [navigation]);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
        ]);
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                        <Text style={styles.username} numberOfLines={1}>{firstName}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={[styles.availBtn, isAvailable ? styles.availBtnOn : styles.availBtnOff]}
                            onPress={() => setIsAvailable(v => !v)}>
                            <View style={[styles.availDot, { backgroundColor: isAvailable ? GREEN : RED }]} />
                            <Text style={[styles.availText, { color: isAvailable ? GREEN : RED }]}>
                                {isAvailable ? 'On Duty' : 'Off Duty'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
                            <Text style={styles.avatarLetter}>{firstName.charAt(0).toUpperCase()}</Text>
                            <View style={[styles.onlineDot, { backgroundColor: isAvailable ? GREEN : RED }]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Hero Banner ── */}
                <View style={[styles.heroBanner, { width: width - 40 }]}>
                    <View style={styles.heroLeft}>
                        <View style={[styles.heroBadge, isAvailable ? styles.heroBadgeOn : styles.heroBadgeOff]}>
                            <View style={[styles.heroBadgeDot, { backgroundColor: isAvailable ? GREEN : RED }]} />
                            <Text style={[styles.heroBadgeText, { color: isAvailable ? GREEN : RED }]}>
                                {isAvailable ? 'Available' : 'Unavailable'}
                            </Text>
                        </View>
                        <Text style={styles.heroTitle}>Ambulance{'\n'}Driver</Text>
                        <Text style={styles.heroSub}>🚑 {user?.vehicle_number || '—'}</Text>
                    </View>
                    <View style={styles.heroRight}>
                        <View style={styles.heroStatBox}>
                            <Text style={styles.heroStatNum}>{totalRides}</Text>
                            <Text style={styles.heroStatLabel}>Total Rides</Text>
                        </View>
                        <View style={[styles.heroStatBox, styles.heroStatBoxGreen]}>
                            <Text style={[styles.heroStatNum, { color: GREEN }]}>0</Text>
                            <Text style={styles.heroStatLabel}>Active</Text>
                        </View>
                        <View style={[styles.heroStatBox, styles.heroStatBoxPurple]}>
                            <Text style={[styles.heroStatNum, { color: PURPLEL }]}>
                                {user?.district ? user.district.slice(0, 3).toUpperCase() : 'STP'}
                            </Text>
                            <Text style={styles.heroStatLabel}>District</Text>
                        </View>
                    </View>
                </View>

                {/* ── Quick Actions ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
                    <View style={styles.qaRow}>
                        {QUICK_ACTIONS.map(a => (
                            <TouchableOpacity
                                key={a.key}
                                style={styles.qaCard}
                                activeOpacity={0.75}
                                onPress={() => navigation.navigate(a.key, a.key === 'DriverEmergencyTracking' ? { emergency: {} } : undefined)}>
                                <View style={styles.qaIconWrap}>
                                    <Text style={styles.qaIcon}>{a.icon}</Text>
                                </View>
                                <Text style={styles.qaLabel}>{a.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Active Emergency Card ── */}
                <View style={styles.sectionPx}>
                    <TouchableOpacity
                        style={styles.emergencyCard}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('DriverEmergencyTracking', { emergency: {} })}>
                        <View style={styles.emergencyPulse} />
                        <View style={styles.emergencyIconWrap}>
                            <Text style={styles.emergencyIcon}>🚨</Text>
                        </View>
                        <View style={styles.emergencyText}>
                            <Text style={styles.emergencyTitle}>Active Emergency</Text>
                            <Text style={styles.emergencySub}>View assigned emergency & navigate</Text>
                        </View>
                        <View style={styles.emergencyArrow}>
                            <Text style={styles.emergencyArrowText}>›</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Driver Info ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DRIVER DETAILS</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Driver ID</Text>
                                <Text style={styles.infoValue} numberOfLines={1}>{user?.id || '—'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Phone</Text>
                                <Text style={styles.infoValue}>{user?.phone || '—'}</Text>
                            </View>
                        </View>
                        <View style={styles.infoDivider} />
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Vehicle</Text>
                                <Text style={styles.infoValue}>{user?.vehicle_number || '—'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>District</Text>
                                <Text style={styles.infoValue}>{user?.district || '—'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>

            {/* ── Bottom Tab Bar ── */}
            <View style={styles.tabBar}>
                {[
                    { key: 'home', label: 'Home', icon: '🏠', active: true },
                    { key: 'DriverMyRides', label: 'Rides', icon: '📋', active: false },
                    { key: 'DriverUpdateLocation', label: 'Location', icon: '📍', active: false },
                    { key: 'DriverProfile', label: 'Profile', icon: '👤', active: false },
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onPress={() => { if (!tab.active) navigation.navigate(tab.key); }}>
                        <View style={[styles.tabIconWrap, tab.active && styles.tabIconActive]}>
                            <Text style={styles.tabIcon}>{tab.icon}</Text>
                        </View>
                        <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { paddingBottom: 16 },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    },
    headerLeft: { flex: 1 },
    greeting: { fontSize: 13, color: DIM, fontWeight: '500', marginBottom: 2 },
    username: { fontSize: 24, fontWeight: '800', color: WHITE, letterSpacing: -0.5 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    availBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1,
    },
    availBtnOn: { backgroundColor: 'rgba(0,229,160,0.08)', borderColor: 'rgba(0,229,160,0.25)' },
    availBtnOff: { backgroundColor: 'rgba(255,82,82,0.08)', borderColor: 'rgba(255,82,82,0.25)' },
    availDot: { width: 7, height: 7, borderRadius: 4 },
    availText: { fontSize: 12, fontWeight: '700' },
    avatarBtn: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: PURPLE, borderWidth: 2, borderColor: PURPLEL,
        justifyContent: 'center', alignItems: 'center',
    },
    avatarLetter: { fontSize: 17, fontWeight: '800', color: WHITE },
    onlineDot: {
        position: 'absolute', bottom: 0, right: 0,
        width: 11, height: 11, borderRadius: 6,
        borderWidth: 2, borderColor: BG,
    },

    // Hero Banner
    heroBanner: {
        alignSelf: 'center', marginHorizontal: 20,
        backgroundColor: CARD, borderRadius: 24, padding: 20,
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
    },
    heroLeft: { flex: 1, gap: 6 },
    heroBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'flex-start', borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1,
    },
    heroBadgeOn: { backgroundColor: 'rgba(0,229,160,0.08)', borderColor: 'rgba(0,229,160,0.2)' },
    heroBadgeOff: { backgroundColor: 'rgba(255,82,82,0.08)', borderColor: 'rgba(255,82,82,0.2)' },
    heroBadgeDot: { width: 6, height: 6, borderRadius: 3 },
    heroBadgeText: { fontSize: 11, fontWeight: '700' },
    heroTitle: { fontSize: 26, fontWeight: '900', color: WHITE, lineHeight: 30, letterSpacing: -0.5 },
    heroSub: { fontSize: 12, color: DIM, fontWeight: '500' },
    heroRight: { gap: 8, alignItems: 'flex-end' },
    heroStatBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
        alignItems: 'center', minWidth: 72,
        borderWidth: 1, borderColor: BORDER,
    },
    heroStatBoxGreen: { borderColor: 'rgba(0,229,160,0.3)', backgroundColor: 'rgba(0,229,160,0.06)' },
    heroStatBoxPurple: { borderColor: 'rgba(167,139,250,0.3)', backgroundColor: 'rgba(124,58,237,0.08)' },
    heroStatNum: { fontSize: 22, fontWeight: '900', color: WHITE },
    heroStatLabel: { fontSize: 10, color: DIM, fontWeight: '600', marginTop: 1 },

    // Sections
    section: { paddingHorizontal: 20, marginTop: 28 },
    sectionPx: { paddingHorizontal: 20, marginTop: 16 },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: DIM, letterSpacing: 1.2, marginBottom: 14 },

    // Quick Actions
    qaRow: { flexDirection: 'row', gap: 10 },
    qaCard: {
        flex: 1, backgroundColor: CARD2,
        borderRadius: 18, paddingVertical: 16, alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: BORDER,
    },
    qaIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(124,58,237,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    qaIcon: { fontSize: 20 },
    qaLabel: { fontSize: 11, fontWeight: '700', color: WHITE },

    // Emergency Card
    emergencyCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,82,82,0.1)',
        borderRadius: 20, padding: 18, gap: 14,
        borderWidth: 1.5, borderColor: 'rgba(255,82,82,0.35)',
        overflow: 'hidden',
    },
    emergencyPulse: {
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,82,82,0.08)',
    },
    emergencyIconWrap: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,82,82,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    emergencyIcon: { fontSize: 22 },
    emergencyText: { flex: 1 },
    emergencyTitle: { fontSize: 16, fontWeight: '800', color: WHITE },
    emergencySub: { fontSize: 12, color: 'rgba(255,82,82,0.8)', marginTop: 2, fontWeight: '500' },
    emergencyArrow: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255,82,82,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    emergencyArrowText: { fontSize: 20, color: RED, fontWeight: '700', lineHeight: 24 },

    // Info Card
    infoCard: {
        backgroundColor: CARD2, borderRadius: 20,
        borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
    },
    infoRow: { flexDirection: 'row', padding: 18, gap: 12 },
    infoItem: { flex: 1 },
    infoLabel: { fontSize: 10, fontWeight: '700', color: DIM, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
    infoValue: { fontSize: 14, fontWeight: '700', color: WHITE },
    infoDivider: { height: 1, backgroundColor: BORDER, marginHorizontal: 18 },

    // Bottom Tab Bar
    tabBar: {
        flexDirection: 'row',
        backgroundColor: CARD,
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: BORDER,
        paddingBottom: 16,
    },
    tabItem: { flex: 1, alignItems: 'center', gap: 3 },
    tabIconWrap: {
        width: 44, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    tabIconActive: { backgroundColor: 'rgba(124,58,237,0.2)' },
    tabIcon: { fontSize: 18 },
    tabLabel: { fontSize: 10, color: DIM, fontWeight: '600' },
    tabLabelActive: { color: PURPLEL, fontWeight: '800' },
});

export default DriverHomeScreen;
