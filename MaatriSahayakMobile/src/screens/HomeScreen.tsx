import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/slices/authSlice';
import { fetchPregnanciesThunk } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';

const BG       = '#0A1F1A';
const CARD     = '#112920';
const GREEN    = '#00E5A0';
const RED      = '#FF5252';
const DIM      = '#B8D4CC';
const WHITE    = '#FFFFFF';
const BORDER   = '#3A6B58';

const STRINGS = {
    en: {
        namaste: 'Namaste,',
        areaStatus: 'My Area Status',
        updatedToday: 'Updated Today',
        highRisk: 'High-Risk\nMothers',
        totalReg: 'Total Registered',
        priorityTasks: 'Priority Tasks',
        viewAll: 'View All',
        quickActions: 'Quick Actions',
        register: 'Register\nPregnancy',
        vitals: 'Vitals\nEntry',
        reports: 'View\nReports',
        emergency: 'EMERGENCY\nSOS',
        home: 'Home',
        alerts: 'Alerts',
        settings: 'Settings',
        logout: 'Logout',
        logoutMsg: 'Are you sure you want to logout?',
        cancel: 'Cancel',
        anemic: 'ANEMIC',
        month5: '5TH MONTH',
        dueToday: 'Due: Today',
        dueTomorrow: 'Due: Tomorrow',
        task1: 'Visit Smt. Kavita',
        task2: 'Follow-up ANC',
    },
    hi: {
        namaste: 'नमस्ते,',
        areaStatus: 'मेरे क्षेत्र की स्थिति',
        updatedToday: 'आज अपडेट हुआ',
        highRisk: 'उच्च-जोखिम\nमाताएं',
        totalReg: 'कुल पंजीकृत',
        priorityTasks: 'प्राथमिक कार्य',
        viewAll: 'सभी देखें',
        quickActions: 'त्वरित कार्य',
        register: 'गर्भावस्था\nपंजीकरण',
        vitals: 'स्वास्थ्य\nजांच',
        reports: 'रिपोर्ट\nदेखें',
        emergency: 'आपातकाल\nSOS',
        home: 'होम',
        alerts: 'अलर्ट',
        settings: 'सेटिंग',
        logout: 'लॉग आउट',
        logoutMsg: 'क्या आप लॉग आउट करना चाहते हैं?',
        cancel: 'रद्द करें',
        anemic: 'एनीमिक',
        month5: '5वां महीना',
        dueToday: 'आज देय',
        dueTomorrow: 'कल देय',
        task1: 'श्रीमती कविता से मिलें',
        task2: 'ANC फॉलो-अप',
    },
};

const HomeScreen = ({ navigation, route }: any) => {
    const username = route?.params?.username || 'ASHA Worker';
    const dispatch = useDispatch<AppDispatch>();
    const { pregnancies, loading } = useSelector((s: RootState) => s.pregnancy);
    const { user } = useSelector((s: RootState) => s.auth);
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const t = STRINGS[lang];

    const displayName = user?.name || username;
    const highRisk = pregnancies.filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL').length;
    const total = pregnancies.length;

    useEffect(() => {
        dispatch(fetchPregnanciesThunk());
    }, []);

    const handleLogout = () => {
        Alert.alert(t.logout, t.logoutMsg, [
            { text: t.cancel, style: 'cancel' },
            { text: t.logout, style: 'destructive', onPress: () => dispatch(logoutThunk()) },
        ]);
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.avatarWrap}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarLetter}>{username.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View style={styles.onlineDot} />
                    </View>
                    <View style={styles.headerMid}>
                        <Text style={styles.namaste}>{t.namaste}</Text>
                        <Text style={styles.username}>{displayName}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        {/* Language toggle */}
                        <TouchableOpacity style={styles.langToggle} onPress={() => setLang(l => l === 'en' ? 'hi' : 'en')}>
                            <Text style={[styles.langOption, lang === 'en' && styles.langActive]}>EN</Text>
                            <Text style={styles.langSlash}> / </Text>
                            <Text style={[styles.langOption, lang === 'hi' && styles.langActive]}>HI</Text>
                        </TouchableOpacity>
                        {/* Logout */}
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                            <Text style={styles.logoutText}>⏻</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Area Status ── */}
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>{t.areaStatus}</Text>
                        <View style={styles.updatedBadge}>
                            <Text style={styles.updatedText}>{t.updatedToday}</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, styles.statCardRed]}>
                            <View style={styles.statIconWrap}>
                                <Text style={styles.statIcon}>⚠</Text>
                            </View>
                            {loading
                                ? <ActivityIndicator color={RED} />
                                : <Text style={styles.statValueRed}>{highRisk}</Text>}
                            <Text style={styles.statLabel}>{t.highRisk}</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardGreen]}>
                            <View style={styles.statIconWrapGreen}>
                                <Text style={styles.statIcon}>👥</Text>
                            </View>
                            {loading
                                ? <ActivityIndicator color={GREEN} />
                                : <Text style={styles.statValueGreen}>{total}</Text>}
                            <Text style={styles.statLabel}>{t.totalReg}</Text>
                        </View>
                    </View>
                </View>

                {/* ── Priority Tasks ── */}
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>{t.priorityTasks}</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>{t.viewAll}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.taskCard}>
                        <View style={[styles.taskAvatar, { backgroundColor: '#C0392B' }]}>
                            <Text style={styles.taskAvatarText}>SK</Text>
                            <View style={styles.taskAlertDot} />
                        </View>
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskName}>{t.task1}</Text>
                            <View style={styles.taskMeta}>
                                <View style={styles.tagRed}><Text style={styles.tagText}>{t.anemic}</Text></View>
                                <Text style={styles.taskDue}>{t.dueToday}</Text>
                            </View>
                        </View>
                        <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>
                    </View>

                    <View style={styles.taskCard}>
                        <View style={[styles.taskAvatar, { backgroundColor: '#1A6B5A' }]}>
                            <Text style={styles.taskAvatarText}>RK</Text>
                        </View>
                        <View style={styles.taskInfo}>
                            <Text style={styles.taskName}>{t.task2}</Text>
                            <View style={styles.taskMeta}>
                                <View style={styles.tagBlue}><Text style={styles.tagText}>{t.month5}</Text></View>
                                <Text style={styles.taskDue}>{t.dueTomorrow}</Text>
                            </View>
                        </View>
                        <View style={styles.checkCircle}><Text style={styles.checkMark}>✓</Text></View>
                    </View>
                </View>

                {/* ── Quick Actions ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.quickActions}</Text>
                    <View style={styles.actionsGrid}>
                        <TouchableOpacity style={[styles.actionCard, styles.actionCardGreen]} onPress={() => navigation.navigate('Register')} activeOpacity={0.85}>
                            <View style={styles.actionIconCircle}>
                                <Text style={styles.actionEmoji}>✏️</Text>
                            </View>
                            <Text style={styles.actionLabelDark}>{t.register}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('NearbyPatients')} activeOpacity={0.85}>
                            <View style={styles.actionIconCircleGreen}>
                                <Text style={styles.actionEmoji}>📍</Text>
                            </View>
                            <Text style={styles.actionLabel}>Nearby\nPatients</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('PregnancyList')} activeOpacity={0.85}>
                            <View style={styles.actionIconCircleGreen}>
                                <Text style={styles.actionEmoji}>📈</Text>
                            </View>
                            <Text style={styles.actionLabel}>{t.vitals}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('PregnancyList')} activeOpacity={0.85}>
                            <View style={styles.actionIconCircleGreen}>
                                <Text style={styles.actionEmoji}>📊</Text>
                            </View>
                            <Text style={styles.actionLabel}>{t.reports}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionCard, styles.actionCardRed]} onPress={() => navigation.navigate('Emergency')} activeOpacity={0.85}>
                            <View style={styles.actionIconCircleRed}>
                                <Text style={styles.actionEmoji}>🚨</Text>
                            </View>
                            <Text style={styles.actionLabelBold}>{t.emergency}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* ── Bottom Tab Bar ── */}
            <View style={styles.tabBar}>
                {[
                    { key: 'home',     label: t.home,     icon: '🏠' },
                    { key: 'alerts',   label: t.alerts,   icon: '🔔' },
                    { key: 'settings', label: t.settings, icon: '⚙️' },
                ].map(tab => (
                    <TouchableOpacity key={tab.key} style={styles.tabItem}
                        onPress={() => {
                            if (tab.key === 'alerts')   navigation.navigate('Alerts');
                            if (tab.key === 'settings') navigation.navigate('Settings');
                        }}>
                        <View style={[styles.tabIconWrap, tab.key === 'home' && styles.tabIconActive]}>
                            <Text style={styles.tabIcon}>{tab.icon}</Text>
                        </View>
                        <Text style={[styles.tabLabel, tab.key === 'home' && styles.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { paddingBottom: 20 },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        gap: 12,
    },
    avatarWrap: { position: 'relative' },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#1A6B5A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: GREEN,
    },
    avatarLetter: { fontSize: 22, fontWeight: '800', color: WHITE },
    onlineDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: GREEN,
        borderWidth: 2,
        borderColor: BG,
    },
    headerMid: { flex: 1 },
    namaste: { fontSize: 13, color: DIM, fontWeight: '500' },
    username: { fontSize: 20, fontWeight: '900', color: WHITE, marginTop: 1 },
    headerRight: { alignItems: 'flex-end', gap: 8 },
    langToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: DIM,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    langOption: { fontSize: 13, fontWeight: '700', color: DIM },
    langActive: { color: WHITE },
    langSlash: { fontSize: 13, color: DIM },
    logoutBtn: { padding: 4 },
    logoutText: { fontSize: 18, color: DIM },

    // Sections
    section: { paddingHorizontal: 20, marginTop: 24 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '900', color: WHITE },
    updatedBadge: {
        backgroundColor: 'rgba(0,229,160,0.15)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.3)',
    },
    updatedText: { fontSize: 12, color: GREEN, fontWeight: '700' },
    viewAll: { fontSize: 14, color: GREEN, fontWeight: '700' },

    // Stats
    statsRow: { flexDirection: 'row', gap: 12 },
    statCard: {
        flex: 1,
        borderRadius: 20,
        padding: 18,
        minHeight: 150,
        justifyContent: 'space-between',
    },
    statCardRed: { backgroundColor: '#1F0A0A' },
    statCardGreen: { backgroundColor: CARD },
    statIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255,82,82,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIconWrapGreen: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(0,229,160,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIcon: { fontSize: 20 },
    statValueRed: { fontSize: 40, fontWeight: '900', color: RED },
    statValueGreen: { fontSize: 40, fontWeight: '900', color: WHITE },
    statLabel: { fontSize: 13, color: DIM, fontWeight: '600', lineHeight: 18 },

    // Tasks
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    taskAvatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    taskAvatarText: { fontSize: 15, fontWeight: '800', color: WHITE },
    taskAlertDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: RED,
        borderWidth: 2,
        borderColor: CARD,
    },
    taskInfo: { flex: 1 },
    taskName: { fontSize: 15, fontWeight: '800', color: WHITE, marginBottom: 6 },
    taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    tagRed: { backgroundColor: 'rgba(255,82,82,0.2)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    tagBlue: { backgroundColor: 'rgba(100,149,237,0.2)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    tagText: { fontSize: 10, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
    taskDue: { fontSize: 12, color: DIM, fontWeight: '600' },
    checkCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    checkMark: { fontSize: 14, color: DIM },

    // Quick Actions Grid
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        width: '47%',
        backgroundColor: CARD,
        borderRadius: 20,
        padding: 20,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        minHeight: 130,
    },
    actionCardGreen: { backgroundColor: GREEN },
    actionCardRed: { backgroundColor: RED },
    actionIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,0,0,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionIconCircleGreen: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,229,160,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionIconCircleRed: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionEmoji: { fontSize: 22 },
    actionLabel: { fontSize: 14, fontWeight: '800', color: WHITE, lineHeight: 20 },
    actionLabelDark: { fontSize: 14, fontWeight: '900', color: '#0A1F1A', lineHeight: 20 },
    actionLabelBold: { fontSize: 14, fontWeight: '900', color: WHITE, lineHeight: 20, letterSpacing: 0.3 },

    // Bottom Tab Bar
    tabBar: {
        flexDirection: 'row',
        backgroundColor: CARD,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    tabItem: { flex: 1, alignItems: 'center', gap: 4 },
    tabIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabIconActive: { backgroundColor: GREEN },
    tabIcon: { fontSize: 20 },
    tabLabel: { fontSize: 11, color: DIM, fontWeight: '600' },
    tabLabelActive: { color: WHITE, fontWeight: '800' },
});

export default HomeScreen;
