import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    TextInput, StatusBar, Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPregnanciesThunk } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const RED = '#FF6B6B';
const ORANGE = '#FFA040';

const riskConfig: Record<string, { color: string; bg: string; label: string }> = {
    HIGH:     { color: RED,    bg: 'rgba(255,107,107,0.15)', label: 'HIGH' },
    CRITICAL: { color: RED,    bg: 'rgba(255,107,107,0.15)', label: 'CRITICAL' },
    MEDIUM:   { color: ORANGE, bg: 'rgba(255,160,64,0.15)',  label: 'MEDIUM' },
    LOW:      { color: GREEN,  bg: 'rgba(0,229,160,0.15)',   label: 'LOW' },
};

const PregnancyListScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { pregnancies, loading, error } = useSelector((s: RootState) => s.pregnancy);
    const [query, setQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { dispatch(fetchPregnanciesThunk()); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchPregnanciesThunk());
        setRefreshing(false);
    };

    const filtered = pregnancies.filter(p =>
        p.patient_name?.toLowerCase().includes(query.toLowerCase()) ||
        p.phone?.includes(query)
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pregnancy Cases</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchBox}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or phone..."
                    placeholderTextColor={DIM}
                    value={query}
                    onChangeText={setQuery}
                />
            </View>

            {loading && !refreshing && (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={GREEN} size="large" />
                </View>
            )}

            {!!error && (
                <View style={styles.errorWrap}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => dispatch(fetchPregnanciesThunk())}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && (
                <ScrollView
                    style={styles.body}
                    contentContainerStyle={styles.bodyContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}>

                    <Text style={styles.count}>{filtered.length} cases found</Text>

                    {filtered.length === 0 && !loading && (
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyText}>No pregnancies registered yet.</Text>
                        </View>
                    )}

                    {filtered.map(p => {
                        const risk = riskConfig[p.risk_level] || riskConfig.LOW;
                        return (
                            <TouchableOpacity
                                key={p.id}
                                style={styles.card}
                                activeOpacity={0.85}
                                onPress={() => navigation.navigate('PregnancyDetails', { id: p.id })}>

                                <View style={styles.cardTop}>
                                    <View style={styles.avatarCircle}>
                                        <Text style={styles.avatarLetter}>{p.patient_name?.charAt(0) ?? '?'}</Text>
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.cardName}>{p.patient_name}</Text>
                                        <Text style={styles.cardMeta}>Age {p.age}  ·  EDD: {p.edd?.slice(0, 10)}</Text>
                                        <Text style={styles.cardPhone}>{p.phone}</Text>
                                    </View>
                                    <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                                        <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                                        <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardActions}>
                                    <TouchableOpacity style={styles.actionBtn}
                                        onPress={() => navigation.navigate('Vitals', { pregnancyId: p.id, patientName: p.patient_name })}>
                                        <Text style={styles.actionText}>Record Vitals</Text>
                                    </TouchableOpacity>
                                    <View style={styles.actionDivider} />
                                    <TouchableOpacity style={styles.actionBtn}
                                        onPress={() => navigation.navigate('Emergency', { pregnancyId: p.id, patientName: p.patient_name, phone: p.phone })}>
                                        <Text style={[styles.actionText, { color: RED }]}>Emergency</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Register')} activeOpacity={0.9}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        backgroundColor: CARD,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE },
    searchBox: { backgroundColor: CARD, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER },
    searchInput: {
        backgroundColor: BG, borderRadius: 12, paddingHorizontal: 16,
        paddingVertical: 11, fontSize: 15, color: WHITE,
        borderWidth: 1.5, borderColor: BORDER,
    },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorWrap: { padding: 20, alignItems: 'center' },
    errorText: { color: RED, fontSize: 14, marginBottom: 8 },
    retryText: { color: GREEN, fontSize: 14, fontWeight: '700' },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 90 },
    count: { fontSize: 12, color: DIM, fontWeight: '600', letterSpacing: 0.3, marginBottom: 12, textTransform: 'uppercase' },
    emptyWrap: { alignItems: 'center', paddingTop: 60 },
    emptyText: { color: DIM, fontSize: 15 },
    card: {
        backgroundColor: CARD, borderRadius: 16, marginBottom: 12,
        borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    avatarCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(0,229,160,0.15)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    avatarLetter: { fontSize: 18, fontWeight: '700', color: GREEN },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700', color: WHITE, marginBottom: 2 },
    cardMeta: { fontSize: 12, color: DIM, marginBottom: 2 },
    cardPhone: { fontSize: 12, color: GREEN, fontWeight: '600' },
    riskBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    riskDot: { width: 6, height: 6, borderRadius: 3 },
    riskText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
    cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
    actionBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    actionDivider: { width: 1, backgroundColor: BORDER },
    actionText: { fontSize: 13, fontWeight: '600', color: GREEN },
    fab: {
        position: 'absolute', right: 20, bottom: 24,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: GREEN, justifyContent: 'center', alignItems: 'center',
        elevation: 6, shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
    },
    fabText: { fontSize: 28, color: BG, fontWeight: '300', lineHeight: 32 },
});

export default PregnancyListScreen;
