import React from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const BG     = '#0D0A1F';
const CARD   = '#1A1230';
const PURPLE = '#7B2FBE';
const PURPLE_LIGHT = '#A855F7';
const DIM    = '#C4B8D4';
const WHITE  = '#FFFFFF';
const GREEN  = '#00E5A0';
const GOLD   = '#F59E0B';

const DriverProfileScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((s: RootState) => s.auth);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
        ]);
    };

    const STATS = [
        { label: 'Total Rides',   value: '5',    icon: '🚑', color: PURPLE_LIGHT },
        { label: 'Completed',     value: '3',    icon: '✅', color: GREEN },
        { label: 'Rating',        value: '5.0',  icon: '⭐', color: GOLD },
        { label: 'Km Covered',    value: '46.2', icon: '📏', color: DIM },
    ];

    const INFO = [
        { label: 'Full Name',   value: user?.name  || '—' },
        { label: 'Email',       value: user?.email || '—' },
        { label: 'Phone',       value: user?.phone || '—' },
        { label: 'Role',        value: 'Ambulance Driver' },
        { label: 'Status',      value: 'Available' },
        { label: 'Driver ID',   value: user?.id    || '—' },
    ];

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Avatar Card */}
                <View style={styles.avatarCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarLetter}>{(user?.name || 'D').charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.avatarName}>{user?.name || 'Driver'}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>🚑 AMBULANCE DRIVER · NHM</Text>
                    </View>
                    <View style={styles.verifiedRow}>
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedText}>✅ Verified</Text>
                        </View>
                        <View style={styles.activeBadge}>
                            <View style={styles.activeDot} />
                            <Text style={styles.activeText}>Active</Text>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsGrid}>
                    {STATS.map(s => (
                        <View key={s.label} style={[styles.statCard, { borderColor: s.color + '40' }]}>
                            <Text style={styles.statIcon}>{s.icon}</Text>
                            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                            <Text style={styles.statLabel}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    {INFO.map((item, i) => (
                        <View key={item.label} style={[styles.infoRow, i < INFO.length - 1 && styles.infoRowBorder]}>
                            <Text style={styles.infoLabel}>{item.label}</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Actions */}
                <View style={styles.actionsCard}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.75}>
                        <Text style={styles.actionIcon}>🔒</Text>
                        <Text style={styles.actionLabel}>Change Password</Text>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.75}>
                        <Text style={styles.actionIcon}>🔔</Text>
                        <Text style={styles.actionLabel}>Notifications</Text>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionRow} activeOpacity={0.75}>
                        <Text style={styles.actionIcon}>📞</Text>
                        <Text style={styles.actionLabel}>Contact Support</Text>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                    <Text style={styles.logoutText}>⏻  Logout</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { padding: 20, paddingBottom: 40 },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 },
    back: { fontSize: 15, color: PURPLE_LIGHT, fontWeight: '700' },
    title: { fontSize: 22, fontWeight: '900', color: WHITE },

    avatarCard: {
        backgroundColor: CARD, borderRadius: 24, padding: 24,
        alignItems: 'center', marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(123,47,190,0.3)',
    },
    avatarCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: PURPLE_LIGHT, marginBottom: 12,
    },
    avatarLetter: { fontSize: 34, fontWeight: '900', color: WHITE },
    avatarName: { fontSize: 22, fontWeight: '900', color: WHITE, marginBottom: 6 },
    roleBadge: {
        backgroundColor: 'rgba(123,47,190,0.2)', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 5,
        borderWidth: 1, borderColor: PURPLE, marginBottom: 12,
    },
    roleText: { fontSize: 11, fontWeight: '800', color: PURPLE_LIGHT, letterSpacing: 0.5 },
    verifiedRow: { flexDirection: 'row', gap: 10 },
    verifiedBadge: { backgroundColor: 'rgba(0,229,160,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    verifiedText: { fontSize: 12, fontWeight: '700', color: GREEN },
    activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,229,160,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: GREEN },
    activeText: { fontSize: 12, fontWeight: '700', color: GREEN },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
    statCard: {
        width: '47%', backgroundColor: CARD, borderRadius: 16, padding: 16,
        alignItems: 'center', borderWidth: 1.5,
    },
    statIcon: { fontSize: 24, marginBottom: 6 },
    statValue: { fontSize: 22, fontWeight: '900' },
    statLabel: { fontSize: 11, fontWeight: '700', color: DIM, marginTop: 2 },

    infoCard: { backgroundColor: CARD, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    sectionTitle: { fontSize: 16, fontWeight: '900', color: WHITE, marginBottom: 14 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    infoRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
    infoLabel: { fontSize: 13, fontWeight: '700', color: DIM },
    infoValue: { fontSize: 13, fontWeight: '700', color: WHITE, maxWidth: '55%', textAlign: 'right' },

    actionsCard: { backgroundColor: CARD, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 12 },
    actionIcon: { fontSize: 20 },
    actionLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: WHITE },
    actionArrow: { fontSize: 20, color: DIM },

    logoutBtn: {
        backgroundColor: 'rgba(255,82,82,0.12)', borderRadius: 14, paddingVertical: 16,
        alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,82,82,0.4)',
    },
    logoutText: { fontSize: 15, fontWeight: '900', color: '#FF5252' },
});

export default DriverProfileScreen;
