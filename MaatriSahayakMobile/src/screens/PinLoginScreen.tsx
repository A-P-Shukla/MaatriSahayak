import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, StatusBar,
    Platform, Image, ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { verifyPinThunk, clearError, logoutThunk } from '../store/slices/authSlice';
import { StorageService } from '../services/storage';
import { AppDispatch, RootState } from '../store';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const RED = '#FF5252';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

const PinLoginScreen = ({ navigation, route }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, pinVerified } = useSelector((s: RootState) => s.auth);
    const fromSetup = route.params?.fromSetup;

    const [pin, setPin] = useState('');
    const [profile, setProfile] = useState<any>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        StorageService.getAshaProfile().then(p => setProfile(p));
        StorageService.getPhoto().then(p => setPhoto(p));
    }, []);

    // Navigate to Home once PIN is verified — AppNavigator re-renders to AppStack
    useEffect(() => {
        // Navigation is handled by AppNavigator switching stacks on pinVerified
    }, [pinVerified]);

    useEffect(() => {
        if (error) {
            setShake(true);
            setWrongAttempts(a => a + 1);
            setTimeout(() => { setShake(false); setPin(''); dispatch(clearError()); }, 600);
        }
    }, [error]);

    const handleKey = (key: string) => {
        if (key === '') return;
        if (key === '⌫') { setPin(p => p.slice(0, -1)); return; }
        const next = pin + key;
        setPin(next);
        if (next.length === 4) setTimeout(() => submitPin(next), 300);
    };

    const submitPin = async (entered: string) => {
        await dispatch(verifyPinThunk(entered));
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        navigation.replace('Login');
    };

    const firstName = profile?.fullName?.split(' ')[0] || 'ASHA';

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Top bar */}
            <View style={styles.topBar}>
                <View style={styles.tricolor}>
                    <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
                    <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
                    <View style={[styles.strip, { backgroundColor: '#138808' }]} />
                </View>
            </View>

            <View style={styles.body}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    {photo
                        ? <Image source={{ uri: photo }} style={styles.avatarImg} />
                        : <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarInitial}>{firstName[0]?.toUpperCase()}</Text>
                        </View>
                    }
                    <View style={styles.onlineDot} />
                </View>

                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.name}>{firstName} 👋</Text>
                {profile?.ashaId && <Text style={styles.ashaId}>{profile.ashaId}</Text>}

                <Text style={styles.title}>Enter your PIN</Text>

                {/* Dots */}
                <View style={[styles.dotsRow, shake && styles.dotsShake]}>
                    {[0,1,2,3].map(i => (
                        <View key={i} style={[
                            styles.dot,
                            i < pin.length && styles.dotFilled,
                            wrongAttempts > 0 && pin.length === 0 && styles.dotError,
                        ]} />
                    ))}
                </View>

                {wrongAttempts > 0 && pin.length === 0 && (
                    <Text style={styles.errorText}>Incorrect PIN. Try again.</Text>
                )}

                {/* Keypad */}
                <View style={styles.keypad}>
                    {KEYS.map((key, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.key, key === '' && styles.keyEmpty, key === '⌫' && styles.keyBack]}
                            onPress={() => handleKey(key)}
                            disabled={key === '' || loading}
                            activeOpacity={0.7}>
                            {loading && pin.length === 4 && key === '⌫'
                                ? <ActivityIndicator color={GREEN} size="small" />
                                : <Text style={[styles.keyText, key === '⌫' && styles.keyBackText]}>{key}</Text>
                            }
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Not you? */}
                <TouchableOpacity onPress={handleLogout} style={styles.switchBtn}>
                    <Text style={styles.switchText}>Not {firstName}? Switch account</Text>
                </TouchableOpacity>

                {fromSetup && (
                    <Text style={styles.setupNote}>✓ PIN set successfully! Log in to continue.</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    topBar: {},
    tricolor: { flexDirection: 'row', height: 5 },
    strip: { flex: 1 },
    body: { flex: 1, alignItems: 'center', paddingTop: 36, paddingHorizontal: 24 },

    avatarWrap: { position: 'relative', marginBottom: 16 },
    avatarImg: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: GREEN },
    avatarPlaceholder: {
        width: 88, height: 88, borderRadius: 44,
        backgroundColor: CARD, borderWidth: 3, borderColor: GREEN,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarInitial: { fontSize: 34, fontWeight: '900', color: GREEN },
    onlineDot: {
        position: 'absolute', bottom: 4, right: 4,
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: GREEN, borderWidth: 2, borderColor: BG,
    },

    greeting: { fontSize: 14, color: DIM, fontWeight: '600' },
    name: { fontSize: 22, fontWeight: '900', color: WHITE, marginBottom: 4 },
    ashaId: { fontSize: 11, color: GREEN, fontWeight: '700', letterSpacing: 1, marginBottom: 28 },
    title: { fontSize: 15, color: DIM, fontWeight: '600', marginBottom: 24 },

    dotsRow: { flexDirection: 'row', gap: 20, marginBottom: 8 },
    dotsShake: { transform: [{ translateX: 8 }] },
    dot: {
        width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: BORDER, backgroundColor: 'transparent',
    },
    dotFilled: { backgroundColor: GREEN, borderColor: GREEN },
    dotError: { borderColor: RED },
    errorText: { fontSize: 13, color: RED, marginBottom: 16, fontWeight: '600' },

    keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: 16, justifyContent: 'center', marginTop: 28 },
    key: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
        alignItems: 'center', justifyContent: 'center',
    },
    keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
    keyBack: { backgroundColor: 'transparent', borderColor: BORDER },
    keyText: { fontSize: 24, fontWeight: '700', color: WHITE },
    keyBackText: { fontSize: 20, color: DIM },

    switchBtn: { marginTop: 32 },
    switchText: { fontSize: 13, color: DIM, fontWeight: '600', textDecorationLine: 'underline' },
    setupNote: { marginTop: 16, fontSize: 12, color: GREEN, fontWeight: '600' },
});

export default PinLoginScreen;
