import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, Image, ActivityIndicator, Linking,
    TextInput as RNTextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const BG     = '#0A1F1A';
const CARD   = '#112920';
const GREEN  = '#00E5A0';
const DIM    = '#7A9E90';
const WHITE  = '#FFFFFF';
const BORDER = '#1E3D33';

const STRINGS = {
    en: {
        appName: 'MaatriSahayak', tagline: 'ASHA Worker Portal',
        banner: 'Supported by National Health Mission (NHM)',
        heading: 'Worker Login', subheading: 'Enter your ASHA ID and 4-digit PIN to continue',
        labelId: 'ASHA Worker ID', placeholderId: 'e.g. ASHA-DIS-24XXXX-123',
        labelPin: '4-Digit PIN', placeholderPin: '● ● ● ●',
        signIn: 'Sign In',
        register: 'New ASHA Worker? Register Here',
        helpTitle: 'Need Help?', helpText: 'Contact your supervisor:',
        ok: 'OK', loginFailed: 'Login Failed',
        missingId: 'Please enter your ASHA Worker ID.',
        missingPin: 'Please enter your 4-digit PIN.',
    },
    hi: {
        appName: 'मातृ सहायक', tagline: 'आशा कार्यकर्ता पोर्टल',
        banner: 'राष्ट्रीय स्वास्थ्य मिशन (NHM) द्वारा समर्थित',
        heading: 'कार्यकर्ता लॉगिन', subheading: 'जारी रखने के लिए ASHA ID और 4-अंकीय PIN दर्ज करें',
        labelId: 'ASHA कार्यकर्ता ID', placeholderId: 'जैसे ASHA-DIS-24XXXX-123',
        labelPin: '4-अंकीय PIN', placeholderPin: '● ● ● ●',
        signIn: 'लॉग इन करें',
        register: 'नई आशा कार्यकर्ता? यहाँ पंजीकरण करें',
        helpTitle: 'सहायता चाहिए?', helpText: 'अपने पर्यवेक्षक से संपर्क करें:',
        ok: 'ठीक है', loginFailed: 'लॉगिन विफल',
        missingId: 'कृपया अपना ASHA ID दर्ज करें।',
        missingPin: 'कृपया अपना 4-अंकीय PIN दर्ज करें।',
    },
};

const LoginScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error, isAuthenticated, user } = useSelector((s: RootState) => s.auth);

    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const t = STRINGS[lang];

    const [ashaId, setAshaId] = useState('');
    const [pin, setPin] = useState('');
    const [idFocused, setIdFocused] = useState(false);
    const [pinFocused, setPinFocused] = useState(false);
    const pinRef = useRef<RNTextInput>(null);

    useEffect(() => {
        if (isAuthenticated && user) navigation.replace('Home');
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (error) Alert.alert(t.loginFailed, error, [{ text: t.ok, onPress: () => dispatch(clearError()) }]);
    }, [error]);

    const handleLogin = () => {
        if (!ashaId.trim()) { Alert.alert('', t.missingId); return; }
        if (pin.length < 4)  { Alert.alert('', t.missingPin); return; }
        dispatch(loginThunk({ phone: ashaId.trim(), password: pin }));
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

                    <View style={styles.langRow}>
                        {(['en', 'hi'] as const).map(l => (
                            <TouchableOpacity key={l} style={[styles.langBtn, lang === l && styles.langBtnActive]} onPress={() => setLang(l)}>
                                <Text style={[styles.langBtnText, lang === l && styles.langBtnTextActive]}>
                                    {l === 'en' ? 'EN' : 'हिं'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.logoRow}>
                        <Image source={require('../../assets/icon.png')} style={styles.appIcon} />
                        <Text style={styles.appName}>{t.appName}</Text>
                        <Text style={styles.tagline}>{t.tagline}</Text>
                    </View>

                    <View style={styles.bannerBox}>
                        <Text style={styles.bannerText}>{t.banner}</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.sheet}>
                    <Text style={styles.heading}>{t.heading}</Text>
                    <Text style={styles.subheading}>{t.subheading}</Text>

                    {/* ASHA ID */}
                    <Text style={styles.label}>{t.labelId}</Text>
                    <View style={[styles.inputBox, idFocused && styles.inputFocused]}>
                        <Text style={styles.inputIcon}>🪪</Text>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.inputField}
                            placeholder={t.placeholderId}
                            placeholderTextColor="#3A6B5A"
                            value={ashaId}
                            onChangeText={v => setAshaId(v.toUpperCase())}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            returnKeyType="next"
                            onFocus={() => setIdFocused(true)}
                            onBlur={() => setIdFocused(false)}
                            onSubmitEditing={() => pinRef.current?.focus()}
                        />
                    </View>

                    {/* PIN */}
                    <Text style={[styles.label, { marginTop: 20 }]}>{t.labelPin}</Text>
                    <View style={[styles.inputBox, pinFocused && styles.inputFocused]}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <View style={styles.inputDivider} />
                        <TextInput
                            ref={pinRef}
                            style={[styles.inputField, { letterSpacing: 10, fontSize: 18 }]}
                            placeholder={t.placeholderPin}
                            placeholderTextColor="#3A6B5A"
                            value={pin}
                            onChangeText={v => setPin(v.replace(/[^0-9]/g, '').slice(0, 4))}
                            keyboardType="number-pad"
                            secureTextEntry
                            maxLength={4}
                            returnKeyType="done"
                            onFocus={() => setPinFocused(true)}
                            onBlur={() => setPinFocused(false)}
                            onSubmitEditing={handleLogin}
                        />
                    </View>

                    {/* Sign In */}
                    <TouchableOpacity
                        style={[styles.loginBtn, loading && { opacity: 0.75 }]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.88}>
                        {loading
                            ? <ActivityIndicator color={BG} size="small" />
                            : <Text style={styles.loginBtnText}>{t.signIn}</Text>}
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerLabel}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('AshaRegister')} activeOpacity={0.85}>
                        <Text style={styles.registerBtnText}>{t.register}</Text>
                    </TouchableOpacity>

                    <View style={styles.helpBox}>
                        <Text style={styles.helpTitle}>{t.helpTitle}</Text>
                        <Text style={styles.helpText}>{t.helpText}</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:Krishnatripathi07042005@gmail.com')}>
                            <Text style={styles.helpName}>Krishna Tripathi</Text>
                            <Text style={styles.helpEmail}>Krishnatripathi07042005@gmail.com</Text>
                        </TouchableOpacity>
                    </View>
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

    langRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 16, gap: 8 },
    langBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: DIM },
    langBtnActive: { backgroundColor: GREEN, borderColor: GREEN },
    langBtnText: { fontSize: 13, fontWeight: '700', color: DIM },
    langBtnTextActive: { color: BG },

    logoRow: { alignItems: 'center', paddingTop: 24, paddingBottom: 4 },
    appIcon: { width: 90, height: 90, resizeMode: 'contain', marginBottom: 12 },
    appName: { fontSize: 26, fontWeight: '900', color: WHITE, letterSpacing: 0.4, textAlign: 'center' },
    tagline: { fontSize: 11, color: DIM, marginTop: 5, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '600', textAlign: 'center' },

    bannerBox: { marginHorizontal: 24, marginTop: 16, backgroundColor: CARD, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderLeftWidth: 3, borderLeftColor: GREEN },
    bannerText: { fontSize: 12, color: DIM, fontWeight: '600', letterSpacing: 0.3 },

    sheet: { backgroundColor: CARD, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, flex: 1 },
    heading: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 6 },
    subheading: { fontSize: 13, color: DIM, marginBottom: 24, lineHeight: 20 },
    label: { fontSize: 11, fontWeight: '800', color: DIM, marginBottom: 8, letterSpacing: 1.0, textTransform: 'uppercase' },

    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, minHeight: 54 },
    inputFocused: { borderColor: GREEN },
    inputIcon: { fontSize: 18, marginRight: 10 },
    inputDivider: { width: 1.5, height: 22, backgroundColor: BORDER, marginRight: 10 },
    inputField: { flex: 1, fontSize: 15, color: WHITE, fontWeight: '600', paddingVertical: 14 },

    loginBtn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 17, alignItems: 'center', marginTop: 28, elevation: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    loginBtnText: { color: BG, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
    divider: { flex: 1, height: 1, backgroundColor: BORDER },
    dividerLabel: { marginHorizontal: 12, fontSize: 13, color: DIM, fontWeight: '600' },

    registerBtn: { borderWidth: 2, borderColor: GREEN, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(0,229,160,0.07)' },
    registerBtnText: { color: GREEN, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

    helpBox: { marginTop: 24, backgroundColor: BG, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#FF9933' },
    helpTitle: { fontSize: 14, fontWeight: '800', color: WHITE, marginBottom: 6 },
    helpText: { fontSize: 12, color: DIM, marginBottom: 6 },
    helpName: { fontSize: 14, fontWeight: '800', color: WHITE },
    helpEmail: { fontSize: 12, color: '#FF9933', fontWeight: '600', marginTop: 2, textDecorationLine: 'underline' },
});

export default LoginScreen;
