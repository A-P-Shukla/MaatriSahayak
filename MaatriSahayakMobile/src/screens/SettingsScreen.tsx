import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Switch, Alert, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const BG     = '#0A1F1A';
const CARD   = '#112920';
const GREEN  = '#00E5A0';
const RED    = '#FF5252';
const DIM    = '#B8D4CC';
const WHITE  = '#FFFFFF';
const BORDER = '#3A6B58';

const SettingsScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((s: RootState) => s.auth);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [highRiskAlerts, setHighRiskAlerts] = useState(true);
    const [syncOnWifi, setSyncOnWifi] = useState(false);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutThunk()) },
        ]);
    };

    const handleChangePin = () => {
        navigation.navigate('SetPin', {
            fullName: user?.name,
            phone: user?.phone,
            district: user?.district,
        });
    };

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <Text style={styles.profileAvatarText}>
                            {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                        </Text>
                        <View style={styles.onlineDot} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user?.name ?? 'ASHA Worker'}</Text>
                        <Text style={styles.profileDistrict}>{user?.district ?? '—'}</Text>
                        {user?.ashaId && <Text style={styles.profileId}>{user.ashaId}</Text>}
                    </View>
                    <View style={styles.profileBadge}>
                        <Text style={styles.profileBadgeText}>ASHA</Text>
                    </View>
                </View>

                {/* Notifications */}
                <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
                <View style={styles.card}>
                    <Row
                        icon="🔔"
                        label="Push Notifications"
                        sub="Receive alerts on your device"
                        toggle value={notificationsEnabled}
                        onToggle={setNotificationsEnabled}
                    />
                    <Divider />
                    <Row
                        icon="🚨"
                        label="High Risk Alerts"
                        sub="Immediate alerts for critical cases"
                        toggle value={highRiskAlerts}
                        onToggle={setHighRiskAlerts}
                    />
                </View>

                {/* Data & Sync */}
                <Text style={styles.sectionLabel}>DATA & SYNC</Text>
                <View style={styles.card}>
                    <Row
                        icon="📶"
                        label="Sync on Wi-Fi Only"
                        sub="Save mobile data"
                        toggle value={syncOnWifi}
                        onToggle={setSyncOnWifi}
                    />
                    <Divider />
                    <Row
                        icon="🔄"
                        label="Sync Now"
                        sub="Last synced just now"
                        onPress={() => Alert.alert('Sync', 'Data is up to date.')}
                        arrow
                    />
                </View>

                {/* Account */}
                <Text style={styles.sectionLabel}>ACCOUNT</Text>
                <View style={styles.card}>
                    <Row
                        icon="👮"
                        label="District Officer"
                        sub="View assigned officer details"
                        onPress={() => navigation.navigate('OfficerInfo')}
                        arrow
                    />
                    <Divider />
                    <Row
                        icon="🔑"
                        label="Change PIN"
                        sub="Update your 4-digit login PIN"
                        onPress={handleChangePin}
                        arrow
                    />
                    <Divider />
                    <Row
                        icon="📞"
                        label="Contact Support"
                        sub="support@maatrisahayak.org"
                        onPress={() => Linking.openURL('mailto:support@maatrisahayak.org')}
                        arrow
                    />
                    <Divider />
                    <Row
                        icon="ℹ️"
                        label="App Version"
                        sub="MaatriSahayak v1.0.0"
                    />
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
                    <Text style={styles.logoutIcon}>⏻</Text>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.footer}>MaatriSahayak  •  National Health Mission{'\n'}Built for ASHA Workers across India</Text>

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
                            if (tab.key === 'alerts') navigation.navigate('Alerts');
                        }}>
                        <View style={[styles.tabIconWrap, tab.key === 'settings' && styles.tabIconActive]}>
                            <Text style={styles.tabIcon}>{tab.icon}</Text>
                        </View>
                        <Text style={[styles.tabLabel, tab.key === 'settings' && styles.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
};

const Divider = () => <View style={{ height: 1, backgroundColor: 'rgba(58,107,88,0.4)', marginHorizontal: 16 }} />;

const Row = ({ icon, label, sub, toggle, value, onToggle, onPress, arrow }: {
    icon: string; label: string; sub?: string;
    toggle?: boolean; value?: boolean; onToggle?: (v: boolean) => void;
    onPress?: () => void; arrow?: boolean;
}) => (
    <TouchableOpacity style={rowStyles.row} onPress={onPress} disabled={!onPress && !toggle} activeOpacity={0.7}>
        <View style={rowStyles.iconWrap}>
            <Text style={rowStyles.icon}>{icon}</Text>
        </View>
        <View style={rowStyles.labelWrap}>
            <Text style={rowStyles.label}>{label}</Text>
            {sub && <Text style={rowStyles.sub}>{sub}</Text>}
        </View>
        {toggle && <Switch value={value} onValueChange={onToggle} trackColor={{ false: '#3A6B58', true: '#00E5A0' }} thumbColor="#FFFFFF" />}
        {arrow && <Text style={rowStyles.arrow}>›</Text>}
    </TouchableOpacity>
);

const rowStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
    iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,229,160,0.1)', justifyContent: 'center', alignItems: 'center' },
    icon: { fontSize: 18 },
    labelWrap: { flex: 1 },
    label: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
    sub: { fontSize: 12, color: '#B8D4CC', marginTop: 2 },
    arrow: { fontSize: 22, color: '#3A6B58', fontWeight: '300' },
});

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
    headerTitle: { fontSize: 28, fontWeight: '900', color: WHITE },
    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },

    profileCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: CARD, borderRadius: 20,
        padding: 18, gap: 14, marginBottom: 8,
        borderWidth: 1, borderColor: BORDER,
    },
    profileAvatar: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#1A6B5A',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: GREEN,
        position: 'relative',
    },
    profileAvatarText: { fontSize: 22, fontWeight: '900', color: WHITE },
    onlineDot: {
        position: 'absolute', bottom: 2, right: 2,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: GREEN, borderWidth: 2, borderColor: CARD,
    },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 17, fontWeight: '900', color: WHITE },
    profileDistrict: { fontSize: 13, color: DIM, marginTop: 2 },
    profileId: { fontSize: 11, color: GREEN, fontWeight: '700', marginTop: 3, letterSpacing: 0.5 },
    profileBadge: {
        backgroundColor: 'rgba(0,229,160,0.15)',
        borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
        borderWidth: 1, borderColor: 'rgba(0,229,160,0.3)',
    },
    profileBadgeText: { fontSize: 11, fontWeight: '800', color: GREEN, letterSpacing: 0.5 },

    sectionLabel: { fontSize: 11, fontWeight: '700', color: DIM, letterSpacing: 1.2, marginTop: 8, marginBottom: 4, marginLeft: 4 },
    card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(255,82,82,0.1)',
        borderRadius: 14, paddingVertical: 16, gap: 10,
        borderWidth: 1.5, borderColor: 'rgba(255,82,82,0.3)',
        marginTop: 8,
    },
    logoutIcon: { fontSize: 18 },
    logoutText: { fontSize: 16, fontWeight: '800', color: RED, letterSpacing: 0.3 },

    footer: { textAlign: 'center', color: BORDER, fontSize: 12, lineHeight: 20, marginTop: 16 },

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
});

export default SettingsScreen;
