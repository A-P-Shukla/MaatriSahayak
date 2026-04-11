import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Alert, ActivityIndicator, useWindowDimensions, Linking, RefreshControl, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/slices/authSlice';
import { fetchPregnanciesThunk } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';
import { DatabaseService } from '../services/database';
import { SyncService } from '../services/sync';
import { PregnancyService } from '../services/pregnancyService';
import { StorageService } from '../services/storage';

const BG = '#0A1F1A';
const CARD = '#112920';
const CARD2 = '#0F2318';
const GREEN = '#00E5A0';
const RED = '#FF5252';
const ORANGE = '#FF9F43';
const DIM = '#7FA898';
const WHITE = '#FFFFFF';
const BORDER = '#1E3D30';

const RISK_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const getDueLabel = (edd: string): string | null => {
    if (!edd) return null;
    const diff = Math.ceil((new Date(edd).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Due Today';
    if (diff === 1) return 'Due Tomorrow';
    if (diff <= 7) return `Due in ${diff}d`;
    return null;
};

const getGreeting = (lang: 'en' | 'hi' = 'hi') => {
    const h = new Date().getHours();
    if (lang === 'hi') {
        if (h < 12) return 'सुप्रभात';
        if (h < 17) return 'नमस्ते';
        return 'शुभ संध्या';
    }
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const QUICK_ACTIONS_HI = [
    { key: 'Register', icon: '✏️', label: 'पंजीकरण', sub: 'नई गर्भावस्था' },
    { key: 'PregnancyList', icon: '📋', label: 'मरीज', sub: 'सभी मामले देखें' },
    { key: 'NearbyPatients', icon: '📍', label: 'आस-पास', sub: 'क्षेत्र मानचित्र' },
    { key: 'Alerts', icon: '🔔', label: 'अलर्ट', sub: 'सूचनाएं' },
];

const QUICK_ACTIONS_EN = [
    { key: 'Register', icon: '✏️', label: 'Register', sub: 'New pregnancy' },
    { key: 'PregnancyList', icon: '📋', label: 'Patients', sub: 'View all cases' },
    { key: 'NearbyPatients', icon: '📍', label: 'Nearby', sub: 'Area map' },
    { key: 'Alerts', icon: '🔔', label: 'Alerts', sub: 'Notifications' },
];

const HomeScreen = ({ navigation, route }: any) => {
    const { width } = useWindowDimensions();
    const username = route?.params?.username || 'ASHA Worker';
    const dispatch = useDispatch<AppDispatch>();
    const { pregnancies, loading } = useSelector((s: RootState) => s.pregnancy);
    const { user } = useSelector((s: RootState) => s.auth);
    const [lang, setLang] = useState<'en' | 'hi'>('hi'); // Default to Hindi
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [activeEmergency, setActiveEmergency] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Show welcome screen on first login
    useEffect(() => {
        const checkFirstLogin = async () => {
            try {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');
                if (!hasSeenWelcome) {
                    setShowWelcome(true);
                    await AsyncStorage.setItem('hasSeenWelcome', 'true');
                }
            } catch (error) {
                console.error('Error checking first login:', error);
            }
        };
        checkFirstLogin();
    }, []);

    // Pick up emergency passed back from EmergencyScreen
    useEffect(() => {
        if (route?.params?.activeEmergency) {
            const e = route.params.activeEmergency;
            setActiveEmergency({
                emergency_id: e?.emergency?.id,
                status: e?.emergency?.status,
                driver_name: e?.ambulance?.driver_name,
                driver_phone: e?.ambulance?.driver_phone,
                vehicle_number: e?.ambulance?.vehicle_number,
                eta_minutes: e?.ambulance?.eta_minutes ?? null,
                hospital_name: e?.hospital?.name,
            });
        }
    }, [route?.params?.activeEmergency]);

    const displayName = user?.name || username;
    const firstName = displayName.split(' ')[0];
    const highRisk = pregnancies.filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length;
    const medium = pregnancies.filter(p => p.risk_level === 'MEDIUM').length;
    const total = pregnancies.length;

    const priorityTasks = pregnancies
        .filter(p => {
            const isHighRisk = p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL';
            return isHighRisk || getDueLabel(p.edd) !== null;
        })
        .sort((a, b) => {
            const riskDiff = (RISK_ORDER[a.risk_level] ?? 3) - (RISK_ORDER[b.risk_level] ?? 3);
            if (riskDiff !== 0) return riskDiff;
            return new Date(a.edd).getTime() - new Date(b.edd).getTime();
        })
        .slice(0, 5);

    useEffect(() => {
        const setup = async () => {
            try {
                await DatabaseService.init();
                SyncService.startBackgroundSync();
                await dispatch(fetchPregnanciesThunk()).unwrap();
                const count = await DatabaseService.getPendingSyncCount();
                setPendingCount(count);
                const online = await SyncService.isOnline();
                setIsOnline(online);
            } catch (error) {
                console.error('Setup error:', error);
                // Still show UI even if data fetch fails
                const online = await SyncService.isOnline();
                setIsOnline(online);
            }
        };
        setup();
        const unsub = SyncService.addSyncListener((status, count) => {
            setPendingCount(count);
            SyncService.isOnline().then(setIsOnline);
        });
        return () => { unsub(); SyncService.stopBackgroundSync(); };
    }, [dispatch]);

    // Poll emergency status every 8s when there's an active emergency
    useEffect(() => {
        if (!activeEmergency?.emergency_id) {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
            return;
        }
        const poll = async () => {
            try {
                const status = await PregnancyService.getEmergencyStatus(activeEmergency.emergency_id);
                if (status?.status === 'IN_TRANSIT' || status?.status === 'DISPATCHED') {
                    setActiveEmergency((prev: any) => ({ ...prev, ...status }));
                } else if (status?.status === 'COMPLETED' || status?.status === 'CANCELLED') {
                    setActiveEmergency(null);
                    if (pollRef.current) {
                        clearInterval(pollRef.current);
                        pollRef.current = null;
                    }
                }
            } catch { /* non-blocking */ }
        };
        poll();
        pollRef.current = setInterval(poll, 8000);
        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [activeEmergency?.emergency_id]);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
        ]);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(fetchPregnanciesThunk()).unwrap();
            const count = await DatabaseService.getPendingSyncCount();
            setPendingCount(count);
            const online = await SyncService.isOnline();
            setIsOnline(online);
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const riskColor = (level: string) => {
        if (level === 'CRITICAL' || level === 'HIGH') return RED;
        if (level === 'MEDIUM') return ORANGE;
        return GREEN;
    };

    const riskBg = (level: string) => {
        if (level === 'CRITICAL' || level === 'HIGH') return 'rgba(255,82,82,0.12)';
        if (level === 'MEDIUM') return 'rgba(255,159,67,0.12)';
        return 'rgba(0,229,160,0.12)';
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Welcome Modal */}
            <Modal visible={showWelcome} transparent animationType="fade">
                <View style={styles.welcomeOverlay}>
                    <View style={styles.welcomeCard}>
                        <View style={styles.welcomeIconBox}>
                            <Text style={styles.welcomeIcon}>🎉</Text>
                        </View>
                        <Text style={styles.welcomeTitle}>Welcome, {firstName}!</Text>
                        <Text style={styles.welcomeSubtitle}>Your account has been approved</Text>
                        <View style={styles.welcomeMessageBox}>
                            <Text style={styles.welcomeMessage}>You're all set to start managing maternal health cases in your area. Your dedication helps save lives.</Text>
                        </View>
                        <View style={styles.welcomeFeatures}>
                            <View style={styles.welcomeFeature}>
                                <Text style={styles.welcomeFeatureIcon}>✏️</Text>
                                <Text style={styles.welcomeFeatureText}>Register pregnancies</Text>
                            </View>
                            <View style={styles.welcomeFeature}>
                                <Text style={styles.welcomeFeatureIcon}>📊</Text>
                                <Text style={styles.welcomeFeatureText}>Track vitals & risks</Text>
                            </View>
                            <View style={styles.welcomeFeature}>
                                <Text style={styles.welcomeFeatureIcon}>🚨</Text>
                                <Text style={styles.welcomeFeatureText}>Trigger emergencies</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.welcomeBtn} onPress={() => setShowWelcome(false)}>
                            <Text style={styles.welcomeBtnText}>Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={GREEN}
                        colors={[GREEN]}
                    />
                }
            >

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                        <Text style={styles.username} numberOfLines={1}>{firstName}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.langBtn}
                            onPress={() => setLang(l => l === 'en' ? 'hi' : 'en')}>
                            <Text style={styles.langBtnText}>{lang === 'en' ? 'हि' : 'EN'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.avatarBtn} onPress={handleLogout}>
                            <Text style={styles.avatarLetter}>{firstName.charAt(0).toUpperCase()}</Text>
                            <View style={[styles.onlineDot, { backgroundColor: isOnline ? GREEN : RED }]} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Hero Banner ── */}
                <View style={[styles.heroBanner, { width: width - 40 }]}>
                    <View style={styles.heroLeft}>
                        <View style={styles.heroBadge}>
                            <View style={[styles.heroBadgeDot, { backgroundColor: isOnline ? GREEN : RED }]} />
                            <Text style={[styles.heroBadgeText, { color: isOnline ? GREEN : RED }]}>
                                {isOnline ? 'Live Sync' : pendingCount > 0 ? `${pendingCount} pending` : 'Offline'}
                            </Text>
                        </View>
                        <Text style={styles.heroTitle}>Area{'\n'}Overview</Text>
                        <Text style={styles.heroSub}>{user?.district || '—'}</Text>
                    </View>
                    <View style={styles.heroRight}>
                        <View style={styles.heroStatBox}>
                            <Text style={styles.heroStatNum}>{loading ? '–' : total}</Text>
                            <Text style={styles.heroStatLabel}>Total</Text>
                        </View>
                        <View style={[styles.heroStatBox, styles.heroStatBoxRed]}>
                            <Text style={[styles.heroStatNum, { color: RED }]}>{loading ? '–' : highRisk}</Text>
                            <Text style={styles.heroStatLabel}>High Risk</Text>
                        </View>
                        <View style={[styles.heroStatBox, styles.heroStatBoxOrange]}>
                            <Text style={[styles.heroStatNum, { color: ORANGE }]}>{loading ? '–' : medium}</Text>
                            <Text style={styles.heroStatLabel}>Medium</Text>
                        </View>
                    </View>
                </View>

                {/* ── Active Emergency Driver Card ── */}
                {activeEmergency && (
                    <View style={styles.sectionPx}>
                        <View style={styles.driverCard}>
                            {/* Header row */}
                            <View style={styles.driverCardHeader}>
                                <View style={styles.driverCardBadge}>
                                    <View style={styles.driverCardBadgeDot} />
                                    <Text style={styles.driverCardBadgeText}>
                                        {activeEmergency.status === 'IN_TRANSIT' ? 'En Route' : 'Dispatched'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => setActiveEmergency(null)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Text style={styles.driverCardDismiss}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.driverCardTitle}>🚑 Ambulance Assigned</Text>

                            {/* Driver info grid */}
                            <View style={styles.driverInfoGrid}>
                                <View style={styles.driverInfoItem}>
                                    <Text style={styles.driverInfoLabel}>DRIVER</Text>
                                    <Text style={styles.driverInfoValue}>
                                        {activeEmergency.driver_name || 'Assigned'}
                                    </Text>
                                </View>
                                <View style={styles.driverInfoItem}>
                                    <Text style={styles.driverInfoLabel}>VEHICLE</Text>
                                    <Text style={styles.driverInfoValue}>
                                        {activeEmergency.vehicle_number || '—'}
                                    </Text>
                                </View>
                                <View style={styles.driverInfoItem}>
                                    <Text style={styles.driverInfoLabel}>ETA</Text>
                                    <Text style={[styles.driverInfoValue, { color: ORANGE }]}>
                                        {activeEmergency.eta_minutes != null
                                            ? `~${activeEmergency.eta_minutes} min`
                                            : 'Calculating...'}
                                    </Text>
                                </View>
                                <View style={styles.driverInfoItem}>
                                    <Text style={styles.driverInfoLabel}>HOSPITAL</Text>
                                    <Text style={styles.driverInfoValue} numberOfLines={1}>
                                        {activeEmergency.hospital_name || '—'}
                                    </Text>
                                </View>
                            </View>

                            {/* Call driver button */}
                            {activeEmergency.driver_phone && (
                                <TouchableOpacity
                                    style={styles.callDriverBtn}
                                    activeOpacity={0.85}
                                    onPress={() => Linking.openURL(`tel:${activeEmergency.driver_phone}`)}>
                                    <Text style={styles.callDriverIcon}>📞</Text>
                                    <Text style={styles.callDriverText}>Call Driver  {activeEmergency.driver_phone}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* ── Quick Actions ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
                    <View style={styles.qaRow}>
                        {(lang === 'hi' ? QUICK_ACTIONS_HI : QUICK_ACTIONS_EN).map((a: { key: string; icon: string; label: string; sub: string }) => (
                            <TouchableOpacity
                                key={a.key}
                                style={styles.qaCard}
                                activeOpacity={0.75}
                                onPress={() => navigation.navigate(a.key)}>
                                <View style={styles.qaIconWrap}>
                                    <Text style={styles.qaIcon}>{a.icon}</Text>
                                </View>
                                <Text style={styles.qaLabel}>{a.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Emergency SOS ── */}
                <View style={styles.sectionPx}>
                    <TouchableOpacity
                        style={styles.sosCard}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('Emergency')}>
                        <View style={styles.sosPulse} />
                        <View style={styles.sosIconWrap}>
                            <Text style={styles.sosIcon}>🚨</Text>
                        </View>
                        <View style={styles.sosText}>
                            <Text style={styles.sosTitle}>Emergency SOS</Text>
                            <Text style={styles.sosSub}>Trigger immediate ambulance dispatch</Text>
                        </View>
                        <View style={styles.sosArrow}>
                            <Text style={styles.sosArrowText}>›</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Priority Tasks ── */}
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionLabel}>PRIORITY TASKS</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('PregnancyList')}>
                            <Text style={styles.viewAll}>View All →</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && (
                        <View style={styles.loadingWrap}>
                            <ActivityIndicator color={GREEN} size="small" />
                            <Text style={styles.loadingText}>Loading patients...</Text>
                        </View>
                    )}

                    {!loading && priorityTasks.length === 0 && (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyIcon}>✅</Text>
                            <Text style={styles.emptyTitle}>All clear!</Text>
                            <Text style={styles.emptySub}>No priority tasks right now</Text>
                        </View>
                    )}

                    {!loading && priorityTasks.map((p, idx) => {
                        const initials = (p.patient_name || '?')
                            .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                        const isCritical = p.risk_level === 'CRITICAL';
                        const isHigh = p.risk_level === 'HIGH';
                        const dueLabel = getDueLabel(p.edd);
                        const rc = riskColor(p.risk_level);
                        const rb = riskBg(p.risk_level);
                        return (
                            <TouchableOpacity
                                key={p.id}
                                style={[styles.taskCard, { borderLeftColor: rc }]}
                                activeOpacity={0.8}
                                onPress={() => navigation.navigate('Vitals', { pregnancyId: p.id, patientName: p.patient_name })}>
                                <View style={[styles.taskAvatar, { backgroundColor: rb }]}>
                                    <Text style={[styles.taskInitials, { color: rc }]}>{initials}</Text>
                                    {(isCritical || isHigh) && <View style={[styles.taskDot, { backgroundColor: rc }]} />}
                                </View>
                                <View style={styles.taskBody}>
                                    <Text style={styles.taskName} numberOfLines={1}>{p.patient_name}</Text>
                                    <View style={styles.taskTags}>
                                        <View style={[styles.riskPill, { backgroundColor: rb }]}>
                                            <Text style={[styles.riskPillText, { color: rc }]}>{p.risk_level}</Text>
                                        </View>
                                        {dueLabel && (
                                            <View style={styles.duePill}>
                                                <Text style={styles.duePillText}>{dueLabel}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={styles.taskAction}>
                                    <Text style={[styles.taskActionText, { color: rc }]}>›</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>

            {/* ── Bottom Tab Bar ── */}
            <View style={styles.tabBar}>
                {[
                    { key: 'home', label: 'Home', icon: '🏠', active: true },
                    { key: 'PregnancyList', label: 'Patients', icon: '🤰', active: false },
                    { key: 'Alerts', label: 'Alerts', icon: '🔔', active: false },
                    { key: 'Settings', label: 'Settings', icon: '⚙️', active: false },
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tabItem}
                        onPress={() => { if (tab.key !== 'home') navigation.navigate(tab.key); }}>
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
    langBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
        justifyContent: 'center', alignItems: 'center',
    },
    langBtnText: { fontSize: 13, fontWeight: '800', color: GREEN },
    avatarBtn: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#1A6B5A', borderWidth: 2, borderColor: GREEN,
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
        alignSelf: 'center',
        marginHorizontal: 20,
        backgroundColor: CARD,
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        overflow: 'hidden',
    },
    heroLeft: { flex: 1, gap: 6 },
    heroBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,229,160,0.08)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 1, borderColor: 'rgba(0,229,160,0.2)',
    },
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
    heroStatBoxRed: { borderColor: 'rgba(255,82,82,0.3)', backgroundColor: 'rgba(255,82,82,0.06)' },
    heroStatBoxOrange: { borderColor: 'rgba(255,159,67,0.3)', backgroundColor: 'rgba(255,159,67,0.06)' },
    heroStatNum: { fontSize: 22, fontWeight: '900', color: WHITE },
    heroStatLabel: { fontSize: 10, color: DIM, fontWeight: '600', marginTop: 1 },

    // Sections
    section: { paddingHorizontal: 20, marginTop: 28 },
    sectionPx: { paddingHorizontal: 20, marginTop: 16 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionLabel: { fontSize: 11, fontWeight: '800', color: DIM, letterSpacing: 1.2, marginBottom: 14 },
    viewAll: { fontSize: 13, color: GREEN, fontWeight: '700' },

    // Quick Actions
    qaRow: { flexDirection: 'row', gap: 10 },
    qaCard: {
        flex: 1, backgroundColor: CARD2,
        borderRadius: 18, paddingVertical: 16, alignItems: 'center', gap: 8,
        borderWidth: 1, borderColor: BORDER,
    },
    qaIconWrap: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(0,229,160,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    qaIcon: { fontSize: 20 },
    qaLabel: { fontSize: 11, fontWeight: '700', color: WHITE },

    // SOS Card
    sosCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,82,82,0.1)',
        borderRadius: 20, padding: 18, gap: 14,
        borderWidth: 1.5, borderColor: 'rgba(255,82,82,0.35)',
        overflow: 'hidden',
    },
    sosPulse: {
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(255,82,82,0.08)',
    },
    sosIconWrap: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,82,82,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    sosIcon: { fontSize: 22 },
    sosText: { flex: 1 },
    sosTitle: { fontSize: 16, fontWeight: '800', color: WHITE },
    sosSub: { fontSize: 12, color: 'rgba(255,82,82,0.8)', marginTop: 2, fontWeight: '500' },
    sosArrow: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255,82,82,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    sosArrowText: { fontSize: 20, color: RED, fontWeight: '700', lineHeight: 24 },

    // Task Cards
    loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
    loadingText: { color: DIM, fontSize: 13, fontWeight: '500' },
    emptyCard: {
        backgroundColor: CARD2, borderRadius: 20, padding: 28,
        alignItems: 'center', gap: 6, borderWidth: 1, borderColor: BORDER,
    },
    emptyIcon: { fontSize: 32, marginBottom: 4 },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: WHITE },
    emptySub: { fontSize: 13, color: DIM, fontWeight: '500' },
    taskCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: CARD2, borderRadius: 18,
        padding: 14, marginBottom: 10, gap: 12,
        borderWidth: 1, borderColor: BORDER,
        borderLeftWidth: 3,
    },
    taskAvatar: {
        width: 48, height: 48, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        position: 'relative',
    },
    taskInitials: { fontSize: 16, fontWeight: '800' },
    taskDot: {
        position: 'absolute', top: -2, right: -2,
        width: 10, height: 10, borderRadius: 5,
        borderWidth: 2, borderColor: CARD2,
    },
    taskBody: { flex: 1, gap: 6 },
    taskName: { fontSize: 15, fontWeight: '700', color: WHITE },
    taskTags: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    riskPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    riskPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
    duePill: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
        borderWidth: 1, borderColor: BORDER,
    },
    duePillText: { fontSize: 10, fontWeight: '600', color: DIM },
    taskAction: {
        width: 30, height: 30, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center', alignItems: 'center',
    },
    taskActionText: { fontSize: 20, fontWeight: '700', lineHeight: 24 },

    // Driver Emergency Card
    driverCard: {
        backgroundColor: 'rgba(255,159,67,0.07)',
        borderRadius: 20, padding: 18,
        borderWidth: 1.5, borderColor: 'rgba(255,159,67,0.35)',
        gap: 14,
    },
    driverCardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    driverCardBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(255,159,67,0.15)',
        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 1, borderColor: 'rgba(255,159,67,0.3)',
    },
    driverCardBadgeDot: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE,
    },
    driverCardBadgeText: { fontSize: 11, fontWeight: '700', color: ORANGE },
    driverCardDismiss: { fontSize: 16, color: DIM, fontWeight: '600' },
    driverCardTitle: { fontSize: 16, fontWeight: '800', color: WHITE },
    driverInfoGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    driverInfoItem: {
        flex: 1, minWidth: '45%',
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: BORDER,
    },
    driverInfoLabel: {
        fontSize: 9, fontWeight: '800', color: DIM,
        letterSpacing: 1, marginBottom: 4,
    },
    driverInfoValue: { fontSize: 14, fontWeight: '700', color: WHITE },
    callDriverBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, backgroundColor: 'rgba(0,229,160,0.1)',
        borderRadius: 14, paddingVertical: 13,
        borderWidth: 1, borderColor: 'rgba(0,229,160,0.25)',
    },
    callDriverIcon: { fontSize: 16 },
    callDriverText: { fontSize: 14, fontWeight: '700', color: GREEN },

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
    tabIconActive: { backgroundColor: 'rgba(0,229,160,0.15)' },
    tabIcon: { fontSize: 18 },
    tabLabel: { fontSize: 10, color: DIM, fontWeight: '600' },
    tabLabelActive: { color: GREEN, fontWeight: '800' },

    // Welcome Modal
    welcomeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    welcomeCard: { backgroundColor: CARD, borderRadius: 24, padding: 32, width: '100%', maxWidth: 400, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
    welcomeIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    welcomeIcon: { fontSize: 40 },
    welcomeTitle: { fontSize: 26, fontWeight: '900', color: WHITE, marginBottom: 8, textAlign: 'center' },
    welcomeSubtitle: { fontSize: 14, color: GREEN, marginBottom: 24, textAlign: 'center', fontWeight: '600' },
    welcomeMessageBox: { backgroundColor: BG, borderRadius: 16, padding: 20, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: GREEN },
    welcomeMessage: { fontSize: 14, color: DIM, lineHeight: 22, textAlign: 'center' },
    welcomeFeatures: { width: '100%', gap: 12, marginBottom: 28 },
    welcomeFeature: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: BG, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: BORDER },
    welcomeFeatureIcon: { fontSize: 24 },
    welcomeFeatureText: { fontSize: 14, color: WHITE, fontWeight: '600', flex: 1 },
    welcomeBtn: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 48, width: '100%', alignItems: 'center' },
    welcomeBtnText: { color: BG, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});

export default HomeScreen;
