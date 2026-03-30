import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, StatusBar, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../services/api';

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

const statusColor = (s: string) => {
    if (s === 'Completed' || s === 'COMPLETED') return GREEN;
    if (s === 'Active'    || s === 'IN_TRANSIT' || s === 'DISPATCHED') return GOLD;
    return RED;
};

const statusLabel = (s: string) => {
    if (s === 'COMPLETED') return 'Completed';
    if (s === 'IN_TRANSIT' || s === 'DISPATCHED') return 'Active';
    if (s === 'CANCELLED') return 'Cancelled';
    return s;
};

const DriverMyRidesScreen = ({ navigation }: any) => {
    const { user } = useSelector((s: RootState) => s.auth);
    const [tab, setTab] = useState('All');
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRides = async () => {
        try {
            const { data } = await api.get('/driver/emergencies');
            const list = data?.data?.emergencies || data?.data || [];
            setRides(Array.isArray(list) ? list : []);
        } catch {
            setRides([]);
        }
    };

    useEffect(() => {
        fetchRides().finally(() => setLoading(false));
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRides();
        setRefreshing(false);
    };

    const normalised = rides.map(r => ({
        id: r.id || r.emergency_id,
        patient: r.patient_name || r.patientName || 'Patient',
        from: r.pickup_address || r.village || '—',
        to: r.hospital_name || r.hospitalName || '—',
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—',
        time: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—',
        distance: r.distance_km ? `${r.distance_km} km` : '—',
        duration: r.duration_minutes ? `${r.duration_minutes} min` : '—',
        status: statusLabel(r.status || ''),
        emergency: (r.event_type || 'EMERGENCY').replace(/_/g, ' '),
    }));

    const filtered = tab === 'All' ? normalised : normalised.filter(r => r.status === tab);
    const completed = normalised.filter(r => r.status === 'Completed').length;
    const active    = normalised.filter(r => r.status === 'Active').length;
    const cancelled = normalised.filter(r => r.status === 'Cancelled').length;

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
                    <Text style={styles.statNum}>{completed}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={[styles.statBox, { borderColor: GOLD }]}>
                    <Text style={[styles.statNum, { color: GOLD }]}>{active}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={[styles.statBox, { borderColor: RED }]}>
                    <Text style={[styles.statNum, { color: RED }]}>{cancelled}</Text>
                    <Text style={styles.statLabel}>Cancelled</Text>
                </View>
                <View style={[styles.statBox, { borderColor: PURPLE_LIGHT }]}>
                    <Text style={[styles.statNum, { color: PURPLE_LIGHT }]}>{normalised.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
            </View>

            {/* Ride List */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}>
                {loading && (
                    <ActivityIndicator color={GREEN} size="large" style={{ marginTop: 40 }} />
                )}
                {!loading && filtered.length === 0 && (
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
