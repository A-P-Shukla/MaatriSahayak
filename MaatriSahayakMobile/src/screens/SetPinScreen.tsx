import React, { useState, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, StatusBar,
    Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setPinThunk } from '../store/slices/authSlice';
import { AppDispatch } from '../store';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#7A9E90';
const WHITE = '#FFFFFF';
const BORDER = '#1E3D33';
const RED = '#FF5252';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

const SetPinScreen = ({ navigation, route }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { fullName, phone, district, ashaId, photo } = route.params || {};
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [step, setStep] = useState<'set' | 'confirm'>('set');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleKey = (key: string) => {
        if (key === '') return;
        if (key === '⌫') {
            if (step === 'set') setPin(p => p.slice(0, -1));
            else setConfirmPin(p => p.slice(0, -1));
            return;
        }
        if (step === 'set') {
            const next = pin + key;
            setPin(next);
            if (next.length === 4) setTimeout(() => setStep('confirm'), 300);
        } else {
            const next = confirmPin + key;
            setConfirmPin(next);
            if (next.length === 4) setTimeout(() => handleConfirm(next), 300);
        }
    };

    const handleConfirm = async (entered: string) => {
        if (entered !== pin) {
            setShake(true);
            setTimeout(() => { setShake(false); setConfirmPin(''); setStep('set'); setPin(''); }, 600);
            Alert.alert('', 'PINs do not match. Please try again.');
            return;
        }
        setLoading(true);
        await dispatch(setPinThunk(pin));
        setLoading(false);
        // Navigate to login — user will use PIN from now on
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        setTimeout(() => Alert.alert('PIN Set!', 'Your PIN has been saved. Please log in with your phone number once, then use PIN next time.'), 400);
    };

    const current = step === 'set' ? pin : confirmPin;

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set Login PIN</Text>
                <View style={{ width: 32 }} />
            </View>

            <View style={styles.body}>
                <Text style={styles.greeting}>Hi, {fullName?.split(' ')[0] || 'ASHA'} 👋</Text>
                <Text style={styles.title}>
                    {step === 'set' ? 'Create a 4-digit PIN' : 'Confirm your PIN'}
                </Text>
                <Text style={styles.sub}>
                    {step === 'set'
                        ? 'You will use this PIN every time you log in'
                        : 'Enter the same PIN again to confirm'}
                </Text>

                {/* Dots */}
                <View style={[styles.dotsRow, shake && styles.dotsShake]}>
                    {[0,1,2,3].map(i => (
                        <View key={i} style={[styles.dot, i < current.length && styles.dotFilled]} />
                    ))}
                </View>

                {/* Step indicator */}
                <View style={styles.stepRow}>
                    <View style={[styles.stepDot, step === 'set' && styles.stepDotActive]} />
                    <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
                </View>

                {/* Keypad */}
                <View style={styles.keypad}>
                    {KEYS.map((key, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.key, key === '' && styles.keyEmpty, key === '⌫' && styles.keyBack]}
                            onPress={() => handleKey(key)}
                            disabled={key === '' || loading}
                            activeOpacity={0.7}>
                            <Text style={[styles.keyText, key === '⌫' && styles.keyBackText]}>{key}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading && <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />}
            </View>
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
    body: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 },
    greeting: { fontSize: 16, color: DIM, fontWeight: '600', marginBottom: 8 },
    title: { fontSize: 24, fontWeight: '900', color: WHITE, textAlign: 'center', marginBottom: 8 },
    sub: { fontSize: 13, color: DIM, textAlign: 'center', lineHeight: 20, marginBottom: 40 },

    dotsRow: { flexDirection: 'row', gap: 20, marginBottom: 16 },
    dotsShake: { transform: [{ translateX: 10 }] },
    dot: {
        width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: BORDER, backgroundColor: 'transparent',
    },
    dotFilled: { backgroundColor: GREEN, borderColor: GREEN },

    stepRow: { flexDirection: 'row', gap: 8, marginBottom: 48 },
    stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BORDER },
    stepDotActive: { backgroundColor: GREEN, width: 24 },

    keypad: { flexDirection: 'row', flexWrap: 'wrap', width: 280, gap: 16, justifyContent: 'center' },
    key: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
        alignItems: 'center', justifyContent: 'center',
    },
    keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
    keyBack: { backgroundColor: 'transparent', borderColor: BORDER },
    keyText: { fontSize: 24, fontWeight: '700', color: WHITE },
    keyBackText: { fontSize: 20, color: DIM },
});

export default SetPinScreen;
