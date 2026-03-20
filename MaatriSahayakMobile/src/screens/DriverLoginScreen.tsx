import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, Image, ActivityIndicator,
    TextInput as RNTextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const BG          = '#0D0A1F';
const CARD        = '#1A1230';
const PURPLE      = '#7B2FBE';
const PURPLE_LIGHT = '#A855F7';
const DIM         = '#C4B8D4';
const WHITE       = '#FFFFFF';
const BORDER      = '#3D2A5A';
const PLACEHOLDER = '#7A6A9A';

const DriverLoginScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [emailFocused, setEmailFocused]       = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const passwordRef = useRef<RNTextInput>(null);

    useEffect(() => {
        if (error) Alert.alert('Login Failed', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }, [error]);

    const handleLogin = () => {
        if (!email.trim()) { Alert.alert('', 'Please enter your email address.'); return; }
        if (!password.trim()) { Alert.alert('', 'Please enter your password.'); return; }
        dispatch(loginThunk({ email: email.trim(), password, role: 'driver' }));
    };

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>

                {/* Hero */}
                <View style={styles.hero}>
                    <View style={styles.tricolor}>
                        <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
                        <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
                        <View style={[styles.strip, { backgroundColor: '#138808' }]} />
                    </View>

                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.logoRow}>
                        <View style={styles.iconBox}>
                            <Image source={require('../../assets/ambulance_driver.png')} style={styles.roleImage} />
                        </View>
                        <Text style={styles.appName}>MaatriSahayak</Text>
                        <Text style={styles.tagline}>AMBULANCE DRIVER PORTAL</Text>
                    </View>

                    <View style={styles.bannerBox}>
                        <Text style={styles.bannerText}>Emergency Response · National Health Mission (NHM)</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.sheet}>
                    <Text style={styles.heading}>Driver Login</Text>
                    <Text style={styles.subheading}>Sign in with your registered driver credentials</Text>

                    {/* Email */}
                    <Text style={styles.label}>Email Address</Text>
                    <View style={[styles.inputBox, emailFocused && styles.inputFocused]}>
                        <Text style={styles.inputIcon}>✉️</Text>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.inputField}
                            placeholder="your@email.com"
                            placeholderTextColor={PLACEHOLDER}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            returnKeyType="next"
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            onSubmitEditing={() => passwordRef.current?.focus()}
                        />
                    </View>

                    {/* Password */}
                    <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
                    <View style={[styles.inputBox, passwordFocused && styles.inputFocused]}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <View style={styles.inputDivider} />
                        <TextInput
                            ref={passwordRef}
                            style={styles.inputField}
                            placeholder="Your account password"
                            placeholderTextColor={PLACEHOLDER}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPw}
                            returnKeyType="done"
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onSubmitEditing={handleLogin}
                        />
                        <TouchableOpacity onPress={() => setShowPw(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.showToggle}>{showPw ? 'Hide' : 'Show'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.loginBtn, loading && { opacity: 0.75 }]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.88}>
                        {loading
                            ? <ActivityIndicator color={WHITE} size="small" />
                            : <Text style={styles.loginBtnText}>Sign In as Driver</Text>}
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerLabel}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('DriverRegister')} activeOpacity={0.85}>
                        <Text style={styles.registerBtnText}>New Driver? Register Here</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    scroll: { flexGrow: 1 },

    hero: { backgroundColor: BG, paddingBottom: 28 },
    tricolor: { flexDirection: 'row', height: 5 },
    strip: { flex: 1 },

    backBtn: { paddingHorizontal: 20, paddingTop: 16 },
    backText: { fontSize: 15, color: PURPLE_LIGHT, fontWeight: '700' },

    logoRow: { alignItems: 'center', paddingTop: 20, paddingBottom: 4 },
    iconBox: {
        width: 90, height: 90, borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 2, borderColor: PURPLE,
    },
    roleImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    appName: { fontSize: 26, fontWeight: '900', color: WHITE, letterSpacing: 0.4, textAlign: 'center' },
    tagline: { fontSize: 11, color: DIM, marginTop: 5, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '600', textAlign: 'center' },

    bannerBox: { marginHorizontal: 24, marginTop: 16, backgroundColor: CARD, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderLeftWidth: 3, borderLeftColor: PURPLE },
    bannerText: { fontSize: 12, color: DIM, fontWeight: '600', letterSpacing: 0.3 },

    sheet: { backgroundColor: CARD, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, flex: 1 },
    heading: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 6 },
    subheading: { fontSize: 13, color: DIM, marginBottom: 24, lineHeight: 20 },
    label: { fontSize: 13, fontWeight: '800', color: DIM, marginBottom: 8, letterSpacing: 1.0, textTransform: 'uppercase' },

    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, minHeight: 54 },
    inputFocused: { borderColor: PURPLE_LIGHT },
    inputIcon: { fontSize: 18, marginRight: 10 },
    inputDivider: { width: 1.5, height: 22, backgroundColor: BORDER, marginRight: 10 },
    inputField: { flex: 1, fontSize: 16, color: WHITE, fontWeight: '600', paddingVertical: 14 },
    showToggle: { fontSize: 12, fontWeight: '700', color: PURPLE_LIGHT, paddingLeft: 8 },

    loginBtn: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 17, alignItems: 'center', marginTop: 28, elevation: 4, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
    loginBtnText: { color: WHITE, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
    divider: { flex: 1, height: 1, backgroundColor: BORDER },
    dividerLabel: { marginHorizontal: 12, fontSize: 13, color: DIM, fontWeight: '600' },

    registerBtn: { borderWidth: 2, borderColor: PURPLE, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(123,47,190,0.08)' },
    registerBtnText: { color: PURPLE_LIGHT, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
});

export default DriverLoginScreen;
