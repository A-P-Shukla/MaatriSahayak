import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    StatusBar,
    Platform,
} from 'react-native';

const PURPLE = '#4A148C';
const PINK = '#D81B60';

const pregnancies = [
    { id: 1, name: 'Priya Sharma', age: 26, weeks: 24, risk: 'low', phone: '9876543210' },
    { id: 2, name: 'Anjali Devi', age: 32, weeks: 18, risk: 'high', phone: '9876543211' },
    { id: 3, name: 'Sunita Kumar', age: 28, weeks: 32, risk: 'medium', phone: '9876543212' },
    { id: 4, name: 'Rekha Singh', age: 24, weeks: 12, risk: 'low', phone: '9876543213' },
];

const riskConfig: Record<string, { color: string; bg: string }> = {
    high:   { color: '#C62828', bg: '#FFEBEE' },
    medium: { color: '#E65100', bg: '#FFF3E0' },
    low:    { color: '#2E7D32', bg: '#E8F5E9' },
};

const PregnancyListScreen = ({ navigation }: any) => {
    const [query, setQuery] = useState('');

    const filtered = pregnancies.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query)
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={PURPLE} />

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
                    placeholderTextColor="#B0B0B0"
                    value={query}
                    onChangeText={setQuery}
                />
            </View>

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}>

                <Text style={styles.count}>{filtered.length} cases found</Text>

                {filtered.map(p => {
                    const risk = riskConfig[p.risk];
                    return (
                        <TouchableOpacity
                            key={p.id}
                            style={styles.card}
                            activeOpacity={0.85}
                            onPress={() => navigation.navigate('PregnancyDetails', { id: p.id })}>

                            <View style={styles.cardTop}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarLetter}>{p.name.charAt(0)}</Text>
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardName}>{p.name}</Text>
                                    <Text style={styles.cardMeta}>Age {p.age}  ·  Week {p.weeks}</Text>
                                    <Text style={styles.cardPhone}>{p.phone}</Text>
                                </View>
                                <View style={[styles.riskBadge, { backgroundColor: risk.bg }]}>
                                    <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                                    <Text style={[styles.riskText, { color: risk.color }]}>{p.risk.toUpperCase()}</Text>
                                </View>
                            </View>

                            <View style={styles.cardActions}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Text style={styles.actionText}>Call</Text>
                                </TouchableOpacity>
                                <View style={styles.actionDivider} />
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => navigation.navigate('Vitals')}>
                                    <Text style={styles.actionText}>Record Vitals</Text>
                                </TouchableOpacity>
                                <View style={styles.actionDivider} />
                                <TouchableOpacity
                                    style={styles.actionBtn}
                                    onPress={() => navigation.navigate('Emergency')}>
                                    <Text style={[styles.actionText, { color: '#C62828' }]}>Emergency</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.9}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8F4FC' },
    header: {
        backgroundColor: PURPLE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 20,
        paddingBottom: 18,
        paddingHorizontal: 20,
    },
    back: { fontSize: 22, color: '#fff', fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
    searchBox: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    searchInput: {
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 11,
        fontSize: 15,
        color: '#1A1A1A',
        borderWidth: 1.5,
        borderColor: '#EBEBEB',
    },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 90 },
    count: {
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
        letterSpacing: 0.3,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#EDE7F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarLetter: { fontSize: 18, fontWeight: '700', color: PURPLE },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    cardMeta: { fontSize: 12, color: '#888', marginBottom: 2 },
    cardPhone: { fontSize: 12, color: PURPLE, fontWeight: '600' },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 5,
    },
    riskDot: { width: 6, height: 6, borderRadius: 3 },
    riskText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
    cardActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    actionDivider: { width: 1, backgroundColor: '#F5F5F5' },
    actionText: { fontSize: 13, fontWeight: '600', color: PURPLE },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: PINK,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
    },
    fabText: { fontSize: 28, color: '#fff', fontWeight: '300', lineHeight: 32 },
});

export default PregnancyListScreen;
