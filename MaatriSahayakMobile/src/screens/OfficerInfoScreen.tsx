import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, StatusBar,
    ActivityIndicator, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import apiClient from '../services/api';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#7FA898';
const WHITE = '#FFFFFF';
const BORDER = '#1E3D30';

const OfficerInfoScreen = ({ navigation }: any) => {
    const { user } = useSelector((s: RootState) => s.auth);
    const [loading, setLoading] = useState(true);
    const [officer, setOfficer] = useState<any>(null);

    useEffect(() => {
        fetchOfficerInfo();
    }, []);

    const fetchOfficerInfo = async () => {
        try {
            setLoading(true);
            // Mock API call - replace with actual endpoint
            const response = await apiClient.get(`/officers/district/${user?.district}`);
            setOfficer(response.data.data);
        } catch (error) {
            console.error('Failed to fetch officer info:', error);
            // Mock data for demonstration
            setOfficer({
                name: 'Dr. Rajesh Kumar',
                designation: 'District Health Officer',
                district: user?.district || 'Unknown',
                phone: '+91 98765 43210',
                email: 'rajesh.kumar@nhm.gov.in',
                office_address: 'District Health Office, Civil Lines',
                working_hours: 'Mon-Fri: 9:00 AM - 5:00 PM',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        if (officer?.phone) {
            Linking.openURL(`tel:${officer.phone}`);
        }
    };

    const handleEmail = () => {
        if (officer?.email) {
            Linking.openURL(`mailto:${officer.email}`);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor={BG} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={GREEN} />
                    <Text style={styles.loadingText}>Loading officer information...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>District Officer</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* Officer Card */}
                <View style={styles.officerCard}>
                    <View style={styles.officerHeader}>
                        <View style={styles.officerAvatar}>
                            <Text style={styles.officerAvatarText}>
                                {officer?.name?.charAt(0)?.toUpperCase() || 'O'}
                            </Text>
                        </View>
                        <View style={styles.officerBadge}>
                            <Text style={styles.officerBadgeText}>OFFICER</Text>
                        </View>
                    </View>

                    <Text style={styles.officerName}>{officer?.name || 'Not Assigned'}</Text>
                    <Text style={styles.officerDesignation}>{officer?.designation || '—'}</Text>

                    <View style={styles.districtPill}>
                        <Text style={styles.districtIcon}>📍</Text>
                        <Text style={styles.districtText}>{officer?.district || user?.district}</Text>
                    </View>
                </View>

                {/* Contact Information */}
                <Text style={styles.sectionLabel}>CONTACT INFORMATION</Text>
                <View style={styles.card}>
                    <InfoRow
                        icon="📞"
                        label="Phone Number"
                        value={officer?.phone || 'Not available'}
                        onPress={officer?.phone ? handleCall : undefined}
                    />
                    <Divider />
                    <InfoRow
                        icon="✉️"
                        label="Email Address"
                        value={officer?.email || 'Not available'}
                        onPress={officer?.email ? handleEmail : undefined}
                    />
                    <Divider />
                    <InfoRow
                        icon="🏢"
                        label="Office Address"
                        value={officer?.office_address || 'Not available'}
                    />
                    <Divider />
                    <InfoRow
                        icon="🕐"
                        label="Working Hours"
                        value={officer?.working_hours || 'Not available'}
                    />
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={handleCall}
                        disabled={!officer?.phone}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionIconWrap}>
                            <Text style={styles.actionIcon}>📞</Text>
                        </View>
                        <Text style={styles.actionLabel}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={handleEmail}
                        disabled={!officer?.email}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionIconWrap}>
                            <Text style={styles.actionIcon}>✉️</Text>
                        </View>
                        <Text style={styles.actionLabel}>Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => Alert.alert('Info', 'SMS feature coming soon')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.actionIconWrap}>
                            <Text style={styles.actionIcon}>💬</Text>
                        </View>
                        <Text style={styles.actionLabel}>Message</Text>
                    </TouchableOpacity>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoIcon}>ℹ️</Text>
                    <View style={styles.infoTextWrap}>
                        <Text style={styles.infoTitle}>Your District Officer</Text>
                        <Text style={styles.infoText}>
                            This officer oversees maternal health programs in your district and can assist with emergencies, resources, and guidance.
                        </Text>
                    </View>
                </View>

                <View style={{ height: 24 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const Divider = () => <View style={{ height: 1, backgroundColor: BORDER, marginHorizontal: 16 }} />;

const InfoRow = ({ icon, label, value, onPress }: {
    icon: string;
    label: string;
    value: string;
    onPress?: () => void;
}) => (
    <TouchableOpacity
        style={styles.infoRow}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
    >
        <View style={styles.infoIconWrap}>
            <Text style={styles.infoRowIcon}>{icon}</Text>
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, onPress && styles.infoValueLink]}>{value}</Text>
        </View>
        {onPress && <Text style={styles.infoArrow}>›</Text>}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: { fontSize: 14, color: DIM, fontWeight: '600' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: CARD,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
    },
    backIcon: { fontSize: 24, color: WHITE, fontWeight: '300' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: WHITE },

    body: { flex: 1, paddingHorizontal: 20 },

    officerCard: {
        backgroundColor: CARD,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 24,
    },
    officerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    officerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1A6B5A',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: GREEN,
    },
    officerAvatarText: { fontSize: 32, fontWeight: '900', color: WHITE },
    officerBadge: {
        backgroundColor: 'rgba(0,229,160,0.15)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.3)',
    },
    officerBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: GREEN,
        letterSpacing: 1,
    },
    officerName: {
        fontSize: 24,
        fontWeight: '900',
        color: WHITE,
        textAlign: 'center',
        marginBottom: 4,
    },
    officerDesignation: {
        fontSize: 14,
        color: DIM,
        textAlign: 'center',
        marginBottom: 16,
    },
    districtPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,229,160,0.1)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.2)',
    },
    districtIcon: { fontSize: 16 },
    districtText: { fontSize: 14, fontWeight: '700', color: GREEN },

    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: DIM,
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    card: {
        backgroundColor: CARD,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: 'hidden',
        marginBottom: 24,
    },

    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    infoIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0,229,160,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoRowIcon: { fontSize: 20 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: DIM, marginBottom: 4, fontWeight: '600' },
    infoValue: { fontSize: 15, color: WHITE, fontWeight: '600' },
    infoValueLink: { color: GREEN },
    infoArrow: { fontSize: 24, color: BORDER, fontWeight: '300' },

    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: CARD,
        borderRadius: 16,
        paddingVertical: 20,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: BORDER,
    },
    actionIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0,229,160,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: { fontSize: 24 },
    actionLabel: { fontSize: 13, fontWeight: '700', color: WHITE },

    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,229,160,0.08)',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.2)',
    },
    infoIcon: { fontSize: 24 },
    infoTextWrap: { flex: 1 },
    infoTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: GREEN,
        marginBottom: 4,
    },
    infoText: {
        fontSize: 13,
        color: DIM,
        lineHeight: 20,
    },
});

export default OfficerInfoScreen;
