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

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const PLACEHOLDER = '#7AADA0';

const STRINGS = {
    en: {
        appName: 'MaatriSahayak', tagline: 'ASHA Worker Portal',
        banner: 'Supported by National Health Mission (NHM)',
        heading: 'Worker Login', subheading: 'Sign in with your registered email and password',
        labelEmail: 'Email Address', placeholderEmail: 'your@email.com',
        labelPassword: 'Password', placeholderPassword: 'Your account password',
        signIn: 'Sign In',
        register: 'New ASHA Worker? Register Here',
        helpTitle: 'Need Help?', helpText: 'Contact your supervisor:',
        ok: 'OK', loginFailed: 'Login Failed',
        missingEmail: 'Please enter your email address.',
        missingPassword: 'Please enter your password.',
        show: 'Show', hide: 'Hide',
    },
    hi: {
        appName: 'मातृ सहायक', tagline: 'आशा कार्यकर्ता पोर्टल',
        banner: 'राष्ट्रीय स्वास्थ्य मिशन (NHM) द्वारा समर्थित',
        heading: 'कार्यकर्ता लॉगिन', subheading: 'अपने पंजीकृत ईमेल और पासवर्ड से साइन इन करें',
        labelEmail: 'ईमेल पता', placeholderEmail: 'your@email.com',
        labelPassword: 'पासवर्ड', placeholderPassword: 'आपका खाता पासवर्ड',
        signIn: 'लॉग इन करें',
        register: 'नई आशा कार्यकर्ता? यहाँ पंजीकरण करें',
        helpTitle: 'सहायता चाहिए?', helpText: 'अपने पर्यवेक्षक से संपर्क करें:',
        ok: 'ठीक है', loginFailed: 'लॉगिन विफल',
        missingEmail: 'कृपया अपना ईमेल पता दर्ज करें।',
        missingPassword: 'कृपया अपना पासवर्ड दर्ज करें।',
        show: 'दिखाएं', hide: 'छुपाएं',
    },
};

const LoginScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);

    const [lang, setLang] = useState<'en' | 'hi'>('hi'); // Default to Hindi
    const t = STRINGS[lang];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPendingApproval, setShowPendingApproval] = useState(false);
    const passwordRef = useRef<RNTextInput>(null);

    useEffect(() => {
        if (error) {
            if (error.includes('pending approval') || error.includes('disabled')) {
                setShowPendingApproval(true);
                dispatch(clearError());
            } else {
                // Show detailed error message
                const errorMsg = error.includes('Incorrect password')
                    ? 'Incorrect password. Please check and try again.'
                    : error.includes('No account found')
                        ? 'No account found with this email. Please register first.'
                        : error;
                Alert.alert(t.loginFailed, errorMsg, [{ text: t.ok, onPress: () => dispatch(clearError()) }]);
            }
        }
    }, [error, t.loginFailed, t.ok, dispatch]);

    const handleLogin = () => {
        if (!email.trim()) { Alert.alert('', t.missingEmail); return; }
        if (!password.trim()) { Alert.alert('', t.missingPassword); return; }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('', 'Please enter a valid email address.');
            return;
        }

        dispatch(loginThunk({ email: email.trim(), password }));
    };

    if (showPendingApproval) {
        return (
            <View style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor={BG} />
                <ScrollView contentContainerStyle={styles.pendingContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.pendingCard}>
                        <View style={styles.pendingIconBox}>
                            <Text style={styles.pendingIcon}>⏳</Text>
                        </View>
                        <Text style={styles.pendingTitle}>Waiting for Approval</Text>
                        <Text style={styles.pendingSubtitle}>Your registration is under review</Text>
                        <View style={styles.pendingInfoBox}>
                            <Text style={styles.pendingInfoText}>Your account has been created successfully, but it needs to be approved by a District Officer before you can log in.</Text>
                            <Text style={[styles.pendingInfoText, { marginTop: 12 }]}>You will receive an email notification once your account is activated.</Text>
                        </View>
                        <View style={styles.pendingSteps}>
                            <View style={styles.pendingStep}>
                                <View style={styles.pendingStepIconDone}><Text style={styles.pendingStepIconText}>✓</Text></View>
                                <Text style={styles.pendingStepText}>Registration Submitted</Text>
                            </View>
                            <View style={styles.pendingStepLine} />
                            <View style={styles.pendingStep}>
                                <View style={styles.pendingStepIconPending}><Text style={styles.pendingStepIconText}>⏳</Text></View>
                                <Text style={styles.pendingStepText}>Admin Approval Pending</Text>
                            </View>
                            <View style={styles.pendingStepLine} />
                            <View style={styles.pendingStep}>
                                <View style={styles.pendingStepIconWaiting}><Text style={styles.pendingStepIconText}>○</Text></View>
                                <Text style={[styles.pendingStepText, { color: '#7AADA0' }]}>Account Activated</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.pendingBackBtn} onPress={() => setShowPendingApproval(false)}>
                            <Text style={styles.pendingBackBtnText}>Back to Login</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@maatrisahayak.org')}>
                            <Text style={styles.pendingHelpText}>Need help? Contact support@maatrisahayak.org</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

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
                        <View style={styles.ashaImageBox}>
                            <Image source={require('../../assets/asha_worker.png')} style={styles.ashaImage} />
                        </View>
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

                    {/* Email */}
                    <Text style={styles.label}>{t.labelEmail}</Text>
                    <View style={[styles.inputBox, emailFocused && styles.inputFocused]}>
                        <Text style={styles.inputIcon}>✉️</Text>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.inputField}
                            placeholder={t.placeholderEmail}
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
                    <Text style={[styles.label, { marginTop: 20 }]}>{t.labelPassword}</Text>
                    <View style={[styles.inputBox, passwordFocused && styles.inputFocused]}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <View style={styles.inputDivider} />
                        <TextInput
                            ref={passwordRef}
                            style={styles.inputField}
                            placeholder={t.placeholderPassword}
                            placeholderTextColor={PLACEHOLDER}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            returnKeyType="done"
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onSubmitEditing={handleLogin}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Text style={styles.showToggle}>{showPassword ? t.hide : t.show}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={{ alignSelf: 'flex-end', marginTop: 8 }}
                        onPress={() => Alert.alert(
                            'Reset Password',
                            'Please contact your District Officer or support@maatrisahayak.org to reset your password.',
                            [{ text: 'OK' }]
                        )}
                    >
                        <Text style={{ fontSize: 12, color: GREEN, fontWeight: '700' }}>Forgot Password?</Text>
                    </TouchableOpacity>

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

                    <TouchableOpacity style={styles.googleBtn} onPress={() => Alert.alert('Coming Soon', 'Google Sign-In will be available soon!')} activeOpacity={0.85}>
                        <Image source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }} style={styles.googleIcon} />
                        <Text style={styles.googleBtnText}>Sign in with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('AshaRegister')} activeOpacity={0.85}>
                        <Text style={styles.registerBtnText}>{t.register}</Text>
                    </TouchableOpacity>

                    <View style={styles.helpBox}>
                        <Text style={styles.helpTitle}>{t.helpTitle}</Text>
                        <Text style={styles.helpText}>{t.helpText}</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@maatrisahayak.org')}>
                            <Text style={styles.helpName}>MaatriSahayak Support</Text>
                            <Text style={styles.helpEmail}>support@maatrisahayak.org</Text>
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
    ashaImageBox: {
        width: 90, height: 90, borderRadius: 45,
        overflow: 'hidden', marginBottom: 12,
        borderWidth: 3, borderColor: GREEN,
    },
    ashaImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    appName: { fontSize: 26, fontWeight: '900', color: WHITE, letterSpacing: 0.4, textAlign: 'center' },
    tagline: { fontSize: 11, color: DIM, marginTop: 5, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '600', textAlign: 'center' },

    bannerBox: { marginHorizontal: 24, marginTop: 16, backgroundColor: CARD, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderLeftWidth: 3, borderLeftColor: GREEN },
    bannerText: { fontSize: 12, color: DIM, fontWeight: '600', letterSpacing: 0.3 },

    sheet: { backgroundColor: CARD, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48, flex: 1 },
    heading: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 6 },
    subheading: { fontSize: 13, color: DIM, marginBottom: 24, lineHeight: 20 },
    label: { fontSize: 13, fontWeight: '800', color: DIM, marginBottom: 8, letterSpacing: 1.0, textTransform: 'uppercase' },

    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderWidth: 1.5, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, minHeight: 54 },
    inputFocused: { borderColor: GREEN },
    inputIcon: { fontSize: 18, marginRight: 10 },
    inputDivider: { width: 1.5, height: 22, backgroundColor: BORDER, marginRight: 10 },
    inputField: { flex: 1, fontSize: 16, color: WHITE, fontWeight: '600', paddingVertical: 14 },
    showToggle: { fontSize: 12, fontWeight: '700', color: GREEN, paddingLeft: 8 },

    loginBtn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 17, alignItems: 'center', marginTop: 28, elevation: 4, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    loginBtnText: { color: BG, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22 },
    divider: { flex: 1, height: 1, backgroundColor: BORDER },
    dividerLabel: { marginHorizontal: 12, fontSize: 13, color: DIM, fontWeight: '600' },

    googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE, borderRadius: 12, paddingVertical: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    googleIcon: { width: 20, height: 20, marginRight: 12 },
    googleBtnText: { color: '#1F1F1F', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

    registerBtn: { borderWidth: 2, borderColor: GREEN, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(0,229,160,0.07)' },
    registerBtnText: { color: GREEN, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },

    helpBox: { marginTop: 24, backgroundColor: BG, borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#FF9933' },
    helpTitle: { fontSize: 14, fontWeight: '800', color: WHITE, marginBottom: 6 },
    helpText: { fontSize: 12, color: DIM, marginBottom: 6 },
    helpName: { fontSize: 14, fontWeight: '800', color: WHITE },
    helpEmail: { fontSize: 12, color: '#FF9933', fontWeight: '600', marginTop: 2, textDecorationLine: 'underline' },

    pendingContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    pendingCard: { backgroundColor: CARD, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: BORDER },
    pendingIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFA500', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    pendingIcon: { fontSize: 40 },
    pendingTitle: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 8, textAlign: 'center' },
    pendingSubtitle: { fontSize: 14, color: DIM, marginBottom: 24, textAlign: 'center' },
    pendingInfoBox: { backgroundColor: BG, borderRadius: 12, padding: 20, marginBottom: 28, borderLeftWidth: 4, borderLeftColor: '#FFA500' },
    pendingInfoText: { fontSize: 14, color: DIM, lineHeight: 22, textAlign: 'center' },
    pendingSteps: { width: '100%', marginBottom: 28 },
    pendingStep: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    pendingStepIconDone: { width: 32, height: 32, borderRadius: 16, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    pendingStepIconPending: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFA500', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    pendingStepIconWaiting: { width: 32, height: 32, borderRadius: 16, backgroundColor: BORDER, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    pendingStepIconText: { fontSize: 16, color: BG, fontWeight: '700' },
    pendingStepText: { fontSize: 14, color: WHITE, fontWeight: '600', flex: 1 },
    pendingStepLine: { width: 2, height: 20, backgroundColor: BORDER, marginLeft: 15, marginVertical: 2 },
    pendingBackBtn: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 16, width: '100%', alignItems: 'center' },
    pendingBackBtnText: { color: BG, fontSize: 15, fontWeight: '900', letterSpacing: 0.5 },
    pendingHelpText: { fontSize: 12, color: '#FFA500', textDecorationLine: 'underline', textAlign: 'center' },
});

export default LoginScreen;
