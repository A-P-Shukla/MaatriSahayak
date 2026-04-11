import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView,
    StatusBar, Linking, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../services/authService';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { loginSuccess } from '../store/slices/authSlice';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const ORANGE = '#FFA500';
const DIM = '#7AADA0';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';

interface Props {
    navigation: any;
    route: any;
}

const WaitingApprovalScreen: React.FC<Props> = ({ navigation, route }) => {
    const { name, email, role, password } = route.params || {};
    const displayName = name || 'User';
    const userRole = role || 'ASHA Worker';
    const [checking, setChecking] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    const checkApprovalStatus = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Missing credentials. Please try logging in manually.');
            return;
        }

        setChecking(true);
        try {
            const response = await AuthService.login({
                email,
                password,
                role: role === 'Driver' ? 'driver' : 'asha'
            });

            // Dispatch login success to update Redux state
            dispatch(loginSuccess({
                token: response.token,
                user: response.user
            }));

            Alert.alert(
                '🎉 Approved!',
                'Your account has been approved! Redirecting to home...',
                [{ text: 'OK' }]
            );
            // Navigation will happen automatically via AppNavigator when auth state changes
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.message || '';
            if (msg.includes('pending approval') || msg.includes('disabled') || msg.includes('activated')) {
                Alert.alert('Still Pending', 'Your registration is still under review. Please check back later.');
            } else if (msg.includes('Incorrect password') || msg.includes('No account found')) {
                Alert.alert('Error', 'Unable to verify status. Please try logging in manually.');
            } else {
                Alert.alert('Error', 'Failed to check status. Please try again.');
            }
        } finally {
            setChecking(false);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.tricolor}>
                        <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
                        <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
                        <View style={[styles.strip, { backgroundColor: '#138808' }]} />
                    </View>
                    <Text style={styles.appName}>MaatriSahayak</Text>
                    <Text style={styles.tagline}>National Health Mission</Text>
                </View>

                {/* Main Card */}
                <View style={styles.card}>
                    {/* Icon */}
                    <View style={styles.iconBox}>
                        <Text style={styles.icon}>⏳</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Waiting for Approval</Text>
                    <Text style={styles.subtitle}>Your registration is under review</Text>

                    {/* User Info */}
                    <View style={styles.infoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{displayName}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>{email || '—'}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Role</Text>
                            <Text style={styles.infoValue}>{userRole}</Text>
                        </View>
                    </View>

                    {/* Message */}
                    <View style={styles.messageBox}>
                        <Text style={styles.message}>
                            Your account has been created successfully, but it needs to be approved by a District Officer before you can log in.
                        </Text>
                        <Text style={[styles.message, { marginTop: 12 }]}>
                            You will receive an email notification once your account is activated.
                        </Text>
                    </View>

                    {/* Timeline */}
                    <View style={styles.timeline}>
                        <Text style={styles.timelineTitle}>Registration Status</Text>

                        {/* Step 1 - Completed */}
                        <View style={styles.timelineStep}>
                            <View style={styles.stepLeft}>
                                <View style={styles.stepIconDone}>
                                    <Text style={styles.stepIconText}>✓</Text>
                                </View>
                                <View style={styles.stepLine} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={styles.stepTitle}>Registration Submitted</Text>
                                <Text style={styles.stepDesc}>Your details have been received</Text>
                            </View>
                        </View>

                        {/* Step 2 - In Progress */}
                        <View style={styles.timelineStep}>
                            <View style={styles.stepLeft}>
                                <View style={styles.stepIconPending}>
                                    <Text style={styles.stepIconText}>⏳</Text>
                                </View>
                                <View style={styles.stepLine} />
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={styles.stepTitle}>Admin Review Pending</Text>
                                <Text style={styles.stepDesc}>District Officer is reviewing your application</Text>
                            </View>
                        </View>

                        {/* Step 3 - Waiting */}
                        <View style={styles.timelineStep}>
                            <View style={styles.stepLeft}>
                                <View style={styles.stepIconWaiting}>
                                    <Text style={styles.stepIconText}>○</Text>
                                </View>
                            </View>
                            <View style={styles.stepRight}>
                                <Text style={[styles.stepTitle, { color: DIM }]}>Account Activated</Text>
                                <Text style={styles.stepDesc}>You'll receive an email when approved</Text>
                            </View>
                        </View>
                    </View>

                    {/* Help Section */}
                    <View style={styles.helpBox}>
                        <Text style={styles.helpTitle}>Need Help?</Text>
                        <Text style={styles.helpText}>
                            If you have any questions or concerns about your registration, please contact our support team.
                        </Text>
                        <TouchableOpacity
                            style={styles.helpBtn}
                            onPress={() => Linking.openURL('mailto:support@maatrisahayak.org')}
                        >
                            <Text style={styles.helpBtnText}>📧 Contact Support</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Check Status Button */}
                    <TouchableOpacity
                        style={[styles.checkBtn, checking && styles.checkBtnDisabled]}
                        onPress={checkApprovalStatus}
                        disabled={checking}
                    >
                        {checking ? (
                            <ActivityIndicator color={BG} size="small" />
                        ) : (
                            <Text style={styles.checkBtnText}>🔄 Check Approval Status</Text>
                        )}
                    </TouchableOpacity>

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.backBtnText}>Back to Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },

    // Header
    header: { alignItems: 'center', marginBottom: 32 },
    tricolor: { flexDirection: 'row', height: 4, width: '100%', marginBottom: 20 },
    strip: { flex: 1 },
    appName: { fontSize: 28, fontWeight: '900', color: WHITE, letterSpacing: 0.5, marginBottom: 4 },
    tagline: { fontSize: 12, color: DIM, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },

    // Card
    card: {
        backgroundColor: CARD,
        borderRadius: 24,
        padding: 28,
        borderWidth: 1,
        borderColor: BORDER,
        alignItems: 'center',
    },

    // Icon
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: ORANGE,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    icon: { fontSize: 40 },

    // Title
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: WHITE,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: DIM,
        marginBottom: 28,
        textAlign: 'center',
    },

    // Info Box
    infoBox: {
        width: '100%',
        backgroundColor: BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: BORDER,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 13,
        color: DIM,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 14,
        color: WHITE,
        fontWeight: '700',
        flex: 1,
        textAlign: 'right',
        marginLeft: 12,
    },
    divider: {
        height: 1,
        backgroundColor: BORDER,
        marginVertical: 4,
    },

    // Message
    messageBox: {
        width: '100%',
        backgroundColor: BG,
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
        borderLeftWidth: 4,
        borderLeftColor: ORANGE,
    },
    message: {
        fontSize: 14,
        color: DIM,
        lineHeight: 22,
        textAlign: 'center',
    },

    // Timeline
    timeline: {
        width: '100%',
        marginBottom: 28,
    },
    timelineTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: WHITE,
        marginBottom: 20,
        textAlign: 'center',
    },
    timelineStep: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    stepLeft: {
        alignItems: 'center',
        marginRight: 16,
    },
    stepIconDone: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: GREEN,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIconPending: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: ORANGE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIconWaiting: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: BORDER,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIconText: {
        fontSize: 16,
        color: BG,
        fontWeight: '700',
    },
    stepLine: {
        width: 2,
        flex: 1,
        backgroundColor: BORDER,
        marginVertical: 4,
    },
    stepRight: {
        flex: 1,
        paddingVertical: 4,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: WHITE,
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 13,
        color: DIM,
        lineHeight: 18,
    },

    // Help
    helpBox: {
        width: '100%',
        backgroundColor: BG,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: BORDER,
    },
    helpTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: WHITE,
        marginBottom: 8,
        textAlign: 'center',
    },
    helpText: {
        fontSize: 13,
        color: DIM,
        lineHeight: 20,
        textAlign: 'center',
        marginBottom: 16,
    },
    helpBtn: {
        backgroundColor: GREEN,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    helpBtnText: {
        color: BG,
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    // Check Button
    checkBtn: {
        width: '100%',
        backgroundColor: GREEN,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    checkBtnDisabled: {
        opacity: 0.6,
    },
    checkBtnText: {
        color: BG,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    // Back Button
    backBtn: {
        width: '100%',
        borderWidth: 2,
        borderColor: GREEN,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(0,229,160,0.07)',
    },
    backBtnText: {
        color: GREEN,
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
});

export default WaitingApprovalScreen;
