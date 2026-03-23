import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG     = '#0D0A1F';
const CARD   = '#1A1230';
const PURPLE = '#7B2FBE';
const PURPLE_LIGHT = '#A855F7';
const DIM    = '#C4B8D4';
const WHITE  = '#FFFFFF';
const GREEN  = '#00E5A0';
const RED    = '#FF5252';
const GOLD   = '#F59E0B';

const TABS = ['All', 'Completed', 'Active', 'Cancelled'];

const RIDES = [
    {
        id: 'RD-001',
        patient: 'Smt. Kavita Devi',
        from: 'Village Rampur, Lucknow',
        to: 'KGMU Hospital, Lucknow',
        date: '20 Mar 2026',
        time: '10:32 AM',
        distance: '12.4 km',
        duration: '28 min',
        status: 'Completed',
        emergency: 'Labour Pain',
    },
    {
        id: 'RD-002',
        patient: 'Smt. Rekha Singh',
        from: 'Mohalla Shivaji Nagar',
        to: 'District Hospital, Kanpur',
        date: '19 Mar 2026',
        time: '02:15 PM',
        distance: '8.7 km',
        duration: '19 min',
        status: 'Completed',
        emergency: 'High BP',
    },
    {
        id: 'RD-003',
        patient: 'Smt. Anita Kumari',
        from: 'Village Bhatpur',
        to: 'PHC Sarojini Nagar',
        date: '18 Mar 2026',
        time: '07:45 AM',
        distance: '5.2 km',
        duration: '14 min',
        status: 'Completed',
        emergency: 'Bleeding',
    },
    {
        id: 'RD-004',
        patient: 'Smt. Pushpa Yadav',
        from: 'Colony Indira Nagar',
        to: 'Ram Manohar Lohia Hospital',
        date: '21 Mar 2026',
        time: '09:10 AM',
        distance: '3.1 km',
        duration: '—',
        status: 'Active',
        emergency: 'Premature Labour',
    },
    {
        id: 'RD-005',
        patient: 'Smt. Geeta Mishra',
        from: 'Village Chinhat',
        to: 'Balrampur Hospital',
        date: '17 Mar 2026',
        time: '11:00 PM',
        distance: '15.8 km',
        duration: '—',
        status: 'Cancelled',
        emergency: 'False Alarm',
    },
];

const statusColor = (s: string) => {
    if (s === 'Completed') return GREEN;
    if (s === 'Active') return GOLD;
    return RED;
};

const DriverMyRidesScreen = ({ navigation }: any) => {
    const [tab, setTab] = useState('All');

    const filtered = tab === 'All' ? RIDES : RIDES.filter(r => r.status === tab);

    return (
        <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Rides</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{RIDES.length}</Text>
                </View>
            </View>

            {/* Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
                {TABS.map(t => (
                    <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
                        <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statNum}>{RIDES.filter(r => r.status === 'Completed').length}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={[styles.statBox, { borderColor: GOLD }]}>
                    <Text style={[styles.statNum, { color: GOLD }]}>{RIDES.filter(r => r.status === 'Active').length}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={[styles.statBox, { borderColor: RED }]}>
                    <Text style={[styles.statNum, { color: RED }]}>{RIDES.filter(r => r.status === 'Cancelled').length}</Text>
                    <Text style={styles.statLabel}>Cancelled</Text>
                </View>
                <View style={[styles.statBox, { borderColor: PURPLE_LIGHT }]}>
                    <Text style={[styles.statNum, { color: PURPLE_LIGHT }]}>46.2</Text>
                    <Text style={styles.statLabel}>Total km</Text>
                </View>
            </View>

            {/* Ride List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                {filtered.length === 0 && (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No rides found</Text>
                    </View>
                )}
                {filtered.map(ride => (
                    <View key={ride.id} style={styles.rideCard}>
                        {/* Top row */}
                        <View style={styles.rideTop}>
                            <View>
                                <Text style={styles.rideId}>{ride.id}</Text>
                                <Text style={styles.rideDate}>{ride.date} · {ride.time}</Text>
                            </View>
                            <View style={[styles.statusBadge, { borderColor: statusColor(ride.status) }]}>
                                <Text style={[styles.statusText, { color: statusColor(ride.status) }]}>{ride.status}</Text>
                            </View>
                        </View>

                        {/* Patient */}
                        <View style={styles.patientRow}>
                            <Text style={styles.patientIcon}>👩</Text>
                            <View>
                                <Text style={styles.patientName}>{ride.patient}</Text>
                                <View style={styles.emergencyTag}>
                                    <Text style={styles.emergencyText}>🚨 {ride.emergency}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Route */}
                        <View style={styles.routeBox}>
                            <View style={styles.routeRow}>
                                <View style={[styles.routeDot, { backgroundColor: GREEN }]} />
                                <Text style={styles.routeText} numberOfLines={1}>{ride.from}</Text>
                            </View>
                            <View style={styles.routeLine} />
                            <View style={styles.routeRow}>
                                <View style={[styles.routeDot, { backgroundColor: RED }]} />
                                <Text style={styles.routeText} numberOfLines={1}>{ride.to}</Text>
                            </View>
                        </View>

                        {/* Footer */}
                        <View style={styles.rideFooter}>
                            <Text style={styles.footerItem}>📏 {ride.distance}</Text>
                            <Text style={styles.footerItem}>⏱ {ride.duration}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12 },
    back: { fontSize: 15, color: PURPLE_LIGHT, fontWeight: '700' },
    title: { flex: 1, fontSize: 22, fontWeight: '900', color: WHITE },
    countBadge: { backgroundColor: PURPLE, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    countText: { fontSize: 13, fontWeight: '800', color: WHITE },

    tabsScroll: { maxHeight: 48 },
    tabs: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
    tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
    tabActive: { backgroundColor: PURPLE, borderColor: PURPLE },
    tabText: { fontSize: 13, fontWeight: '700', color: DIM },
    tabTextActive: { color: WHITE },

    statsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
    statBox: {
        flex: 1, backgroundColor: CARD, borderRadius: 12, padding: 10,
        alignItems: 'center', borderWidth: 1.5, borderColor: GREEN,
    },
    statNum: { fontSize: 20, fontWeight: '900', color: GREEN },
    statLabel: { fontSize: 10, fontWeight: '700', color: DIM, marginTop: 2 },

    list: { paddingHorizontal: 20, paddingBottom: 30, gap: 14 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 16, color: DIM, fontWeight: '600' },

    rideCard: { backgroundColor: CARD, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },

    rideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    rideId: { fontSize: 13, fontWeight: '800', color: PURPLE_LIGHT },
    rideDate: { fontSize: 12, color: DIM, marginTop: 2 },
    statusBadge: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 12, fontWeight: '800' },

    patientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    patientIcon: { fontSize: 28 },
    patientName: { fontSize: 15, fontWeight: '800', color: WHITE },
    emergencyTag: { marginTop: 4, backgroundColor: 'rgba(255,82,82,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
    emergencyText: { fontSize: 11, fontWeight: '700', color: RED },

    routeBox: { backgroundColor: BG, borderRadius: 12, padding: 12, marginBottom: 12 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    routeDot: { width: 10, height: 10, borderRadius: 5 },
    routeText: { flex: 1, fontSize: 13, color: DIM, fontWeight: '600' },
    routeLine: { width: 2, height: 14, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 4, marginVertical: 2 },

    rideFooter: { flexDirection: 'row', gap: 20 },
    footerItem: { fontSize: 13, color: DIM, fontWeight: '600' },
});

export default DriverMyRidesScreen;
