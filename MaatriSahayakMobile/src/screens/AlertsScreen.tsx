import React, { useEffect, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPregnanciesThunk } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';

const BG     = '#0A1F1A';
const CARD   = '#112920';
const GREEN  = '#00E5A0';
const RED    = '#FF5252';
const ORANGE = '#FFA040';
const DIM    = '#B8D4CC';
const WHITE  = '#FFFFFF';
const BORDER = '#3A6B58';

type AlertItem = {
    id: string;
    type: 'HIGH_RISK' | 'CRITICAL' | 'OVERDUE' | 'MEDIUM';
    title: string;
    subtitle: string;
    time: string;
    read: boolean;
};

const typeConfig = {
    CRITICAL: { color: RED,    bg: 'rgba(255,82,82,0.12)',   icon: '🚨', label: 'CRITICAL' },
    HIGH_RISK:{ color: RED,    bg: 'rgba(255,82,82,0.12)',   icon: '⚠️',  label: 'HIGH RISK' },
    OVERDUE:  { color: ORANGE, bg: 'rgba(255,160,64,0.12)',  icon: '⏰',  label: 'OVERDUE' },
    MEDIUM:   { color: ORANGE, bg: 'rgba(255,160,64,0.12)',  icon: '📋',  label: 'FOLLOW UP' },
};

const AlertsScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { pregnancies, loading } = useSelector((s: RootState) => s.pregnancy);
    const [refreshing, setRefreshing] = useState(false);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    useEffect(() => { dispatch(fetchPregnanciesThunk()); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchPregnanciesThunk());
        setRefreshing(false);
    };

    // Build alert items from real pregnancy data
    const alerts: AlertItem[] = pregnancies
        .filter(p => p.risk_level === 'HIGH' || p.risk_level === 'CRITICAL' || p.risk_level === 'MEDIUM')
        .map(p => ({
            id: p.id,
            type: (p.risk_level === 'CRITICAL' ? 'CRITICAL' : p.risk_level === 'HIGH' ? 'HIGH_RISK' : 'MEDIUM') as AlertItem['type'],
            title: p.patient_name,
            subtitle: p.risk_level === 'CRITICAL'
                ? 'Critical risk — immediate attention required'
                : p.risk_level === 'HIGH'
                ? 'High risk pregnancy — schedule visit soon'
                : 'Follow-up ANC visit recommended',
            time: p.edd ? `EDD: ${p.edd.slice(0, 10)}` : 'EDD not set',
            read: readIds.has(p.id),
        }));

    const unreadCount = alerts.filter(a => !a.read).length;

    const markAllRead = () => setReadIds(new Set(alerts.map(a => a.id)));

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Alerts</Text>
                    {unreadCount > 0 && (
                        <Text style={styles.headerSub}>{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</Text>
                    )}
                </View>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
                        <Text style={styles.markAllText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {loading && !refreshing && (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={GREEN} size="large" />
                </View>
            )}

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}>

                {!loading && alerts.length === 0 && (
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyIcon}>✅</Text>
                        <Text style={styles.emptyTitle}>All clear!</Text>
                        <Text style={styles.emptyText}>No alerts at the moment. All patients are in good condition.</Text>
                    </View>
                )}

                {alerts.map(alert => {
                    const cfg = typeConfig[alert.type];
                    return (
                        <TouchableOpacity
                            key={alert.id}
                            style={[styles.alertCard, !alert.read && styles.alertCardUnread]}
                            activeOpacity={0.85}
                            onPress={() => {
                                setReadIds(prev => new Set([...prev, alert.id]));
                                navigation.navigate('PregnancyList');
                            }}>
                            <View style={[styles.alertIconWrap, { backgroundColor: cfg.bg }]}>
                                <Text style={styles.alertIcon}>{cfg.icon}</Text>
                            </View>
                            <View style={styles.alertBody}>
                                <View style={styles.alertTop}>
                                    <Text style={styles.alertTitle}>{alert.title}</Text>
                                    <View style={[styles.alertBadge, { backgroundColor: cfg.bg }]}>
                                        <Text style={[styles.alertBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                                    </View>
                                </View>
                                <Text style={styles.alertSubtitle}>{alert.subtitle}</Text>
                                <Text style={styles.alertTime}>{alert.time}</Text>
                            </View>
                            {!alert.read && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    );
                })}

                {/* Static system alerts */}
                <View style={styles.sectionLabel}>
                    <Text style={styles.sectionLabelText}>SYSTEM</Text>
                </View>

                <View style={[styles.alertCard, styles.alertCardRead]}>
                    <View style={[styles.alertIconWrap, { backgroundColor: 'rgba(0,229,160,0.1)' }]}>
                        <Text style={styles.alertIcon}>📡</Text>
                    </View>
                    <View style={styles.alertBody}>
                        <Text style={styles.alertTitle}>API Connected</Text>
                        <Text style={styles.alertSubtitle}>All services are running normally</Text>
                        <Text style={styles.alertTime}>Today</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
                {[
                    { key: 'home',     icon: '🏠', label: 'Home' },
                    { key: 'alerts',   icon: '🔔', label: 'Alerts' },
                    { key: 'settings', icon: '⚙️', label: 'Settings' },
                ].map(tab => (
                    <TouchableOpacity key={tab.key} style={styles.tabItem}
                        onPress={() => {
                            if (tab.key === 'home') navigation.navigate('Home');
                            if (tab.key === 'settings') navigation.navigate('Settings');
                        }}>
                        <View style={[styles.tabIconWrap, tab.key === 'alerts' && styles.tabIconActive]}>
                            <Text style={styles.tabIcon}>{tab.icon}</Text>
                            {tab.key === 'alerts' && unreadCount > 0 && (
                                <View style={styles.tabBadge}>
                                    <Text style={styles.tabBadgeText}>{unreadCount}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.tabLabel, tab.key === 'alerts' && styles.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
    },
    headerTitle: { fontSize: 28, fontWeight: '900', color: WHITE },
    headerSub: { fontSize: 13, color: RED, fontWeight: '600', marginTop: 2 },
    markAllBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: BORDER },
    markAllText: { fontSize: 12, color: DIM, fontWeight: '700' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 10 },
    emptyWrap: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyIcon: { fontSize: 56 },
    emptyTitle: { fontSize: 20, fontWeight: '900', color: WHITE },
    emptyText: { fontSize: 14, color: DIM, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    sectionLabel: { marginTop: 8, marginBottom: 2 },
    sectionLabelText: { fontSize: 11, fontWeight: '700', color: DIM, letterSpacing: 1.2 },
    alertCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: CARD, borderRadius: 16,
        padding: 14, gap: 12,
        borderWidth: 1, borderColor: BORDER,
    },
    alertCardUnread: { borderColor: 'rgba(255,82,82,0.3)', backgroundColor: '#161F1A' },
    alertCardRead: { opacity: 0.7 },
    alertIconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    alertIcon: { fontSize: 22 },
    alertBody: { flex: 1, gap: 3 },
    alertTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    alertTitle: { fontSize: 14, fontWeight: '800', color: WHITE, flex: 1, marginRight: 8 },
    alertBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    alertBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
    alertSubtitle: { fontSize: 12, color: DIM, lineHeight: 18 },
    alertTime: { fontSize: 11, color: BORDER, fontWeight: '600', marginTop: 2 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: RED },
    tabBar: {
        flexDirection: 'row', backgroundColor: CARD,
        paddingVertical: 10, paddingHorizontal: 20,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    },
    tabItem: { flex: 1, alignItems: 'center', gap: 4 },
    tabIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    tabIconActive: { backgroundColor: GREEN },
    tabIcon: { fontSize: 20 },
    tabLabel: { fontSize: 11, color: DIM, fontWeight: '600' },
    tabLabelActive: { color: WHITE, fontWeight: '800' },
    tabBadge: {
        position: 'absolute', top: 6, right: 6,
        backgroundColor: RED, borderRadius: 8,
        minWidth: 16, height: 16,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 3,
    },
    tabBadgeText: { fontSize: 9, color: WHITE, fontWeight: '900' },
});

export default AlertsScreen;
