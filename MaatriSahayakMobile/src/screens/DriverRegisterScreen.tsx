import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, ActivityIndicator, Image, TextInput as RNTextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { driverRegisterThunk, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const BG = '#0D0A1F';
const CARD = '#1A1230';
const PURPLE = '#7B2FBE';
const PURPLE_LIGHT = '#A855F7';
const RED = '#FF6B6B';
const ORANGE = '#FFA040';
const YELLOW = '#FFD700';
const DIM = '#C4B8D4';
const WHITE = '#FFFFFF';
const BORDER = '#3D2A5A';
const PLACEHOLDER = '#7A6A9A';

// Sample ambulance IDs - replace with actual API data
const AMBULANCE_IDS = [
    'AMB-001', 'AMB-002', 'AMB-003', 'AMB-004', 'AMB-005',
    'AMB-101', 'AMB-102', 'AMB-103', 'AMB-201', 'AMB-202',
    'AMB-301', 'AMB-302', 'AMB-401', 'AMB-501', 'AMB-601',
];

const STRINGS = {
    EN: {
        title: 'Driver Registration',
        heading: 'Create Driver Account',
        sub: 'Register as an ambulance driver to receive emergency dispatches',
        fullName: 'Full Name', fullNamePH: 'As per official records',
        phone: 'Phone Number', phonePH: '10-digit mobile number',
        email: 'Email Address', emailPH: 'your@email.com',
        license: 'Driving License Number', licensePH: 'e.g. DL-1420110012345',
        vehicle: 'Ambulance ID (Optional)', vehiclePH: 'e.g. AMB-001 — leave blank if unknown',
        experience: 'Years of Experience', experiencePH: 'e.g. 5',
        password: 'Create Password', passwordPH: 'Minimum 8 characters',
        confirm: 'Repeat Password', confirmPH: 'Type your password again',
        note: 'Your registration will be reviewed by the district coordinator. You will be notified once your account is activated.',
        submit: 'Submit Registration',
        signIn: 'Already registered?',
        signInLink: 'Sign In',
        show: 'Show', hide: 'Hide',
        errName: 'Full name is required',
        errPhone: 'Enter a valid 10-digit phone number',
        errEmail: 'Enter a valid email address',
        errLicense: 'Driving license number is required',
        errVehicle: 'Vehicle number is required',
        errExperience: 'Enter valid years of experience',
        errPassword: 'Password must be at least 8 characters',
        errPasswordWeak: 'Password must have uppercase, lowercase, number & special character',
        errConfirm: 'Passwords do not match',
        pwStrength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
        failTitle: 'Registration Failed',
        ok: 'OK',
    },
    HI: {
        title: 'ड्राइवर पंजीकरण',
        heading: 'ड्राइवर खाता बनाएं',
        sub: 'आपातकालीन प्रेषण प्राप्त करने के लिए एम्बुलेंस ड्राइवर के रूप में पंजीकरण करें',
        fullName: 'पूरा नाम', fullNamePH: 'आधिकारिक रिकॉर्ड के अनुसार',
        phone: 'फ़ोन नंबर', phonePH: '10 अंकों का मोबाइल नंबर',
        email: 'ईमेल पता', emailPH: 'your@email.com',
        license: 'ड्राइविंग लाइसेंस नंबर', licensePH: 'जैसे DL-1420110012345',
        vehicle: 'एम्बुलेंस आईडी (वैकल्पिक)', vehiclePH: 'खाली छोड़ सकते हैं',
        experience: 'अनुभव (वर्षों में)', experiencePH: 'जैसे 5',
        password: 'पासवर्ड बनाएं', passwordPH: 'न्यूनतम 8 अक्षर',
        confirm: 'पासवर्ड दोहराएं', confirmPH: 'पासवर्ड फिर से टाइप करें',
        note: 'आपका पंजीकरण जिला समन्वयक द्वारा समीक्षा किया जाएगा। खाता सक्रिय होने पर सूचित किया जाएगा।',
        submit: 'पंजीकरण जमा करें',
        signIn: 'पहले से पंजीकृत हैं?',
        signInLink: 'साइन इन करें',
        show: 'दिखाएं', hide: 'छुपाएं',
        errName: 'पूरा नाम आवश्यक है',
        errPhone: 'वैध 10 अंकों का नंबर दर्ज करें',
        errEmail: 'वैध ईमेल पता दर्ज करें',
        errLicense: 'ड्राइविंग लाइसेंस नंबर आवश्यक है',
        errVehicle: 'वाहन नंबर आवश्यक है',
        errExperience: 'वैध अनुभव वर्ष दर्ज करें',
        errPassword: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
        errPasswordWeak: 'पासवर्ड में बड़े, छोटे अक्षर, संख्या और विशेष चिह्न होना चाहिए',
        errConfirm: 'पासवर्ड मेल नहीं खाते',
        pwStrength: ['', 'कमज़ोर', 'ठीक', 'अच्छा', 'मज़बूत'],
        failTitle: 'पंजीकरण विफल',
        ok: 'ठीक है',
    },
};

type Lang = 'EN' | 'HI';

interface FormData {
    fullName: string; phone: string; email: string;
    license: string; vehicle: string; experience: string;
    password: string; confirmPassword: string;
}
interface FormErrors {
    fullName?: string; phone?: string; email?: string;
    license?: string; vehicle?: string; experience?: string;
    password?: string; confirmPassword?: string;
}

const getPasswordStrength = (pw: string): number => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(4, Math.floor(score * 4 / 5) + (score === 5 ? 1 : 0));
};

const strengthColor = (s: number) => [RED, RED, ORANGE, YELLOW, PURPLE_LIGHT][s];

interface FieldProps {
    label: string; placeholder: string; value: string;
    onChangeText: (v: string) => void; error?: string;
    keyboardType?: any; inputRef?: React.RefObject<RNTextInput>;
    nextRef?: React.RefObject<RNTextInput>; secure?: boolean;
    showToggle?: boolean; toggleLabel?: string; onToggle?: () => void;
    returnKeyType?: any; autoCapitalize?: any; autoCorrect?: boolean;
    suggestions?: string[]; onSelectSuggestion?: (v: string) => void;
    showSuggestions?: boolean;
}

const Field = ({
    label, placeholder, value, onChangeText, error,
    keyboardType = 'default', inputRef, nextRef, secure,
    showToggle, toggleLabel, onToggle,
    returnKeyType = 'next', autoCapitalize = 'none', autoCorrect = false,
    suggestions, onSelectSuggestion, showSuggestions,
}: FieldProps) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputBox, !!error && styles.inputError]}>
            <TextInput
                ref={inputRef}
                style={styles.inputText}
                placeholder={placeholder}
                placeholderTextColor={PLACEHOLDER}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                secureTextEntry={secure}
                returnKeyType={returnKeyType}
                onSubmitEditing={() => nextRef?.current?.focus()}
                autoCapitalize={autoCapitalize}
                autoCorrect={autoCorrect}
            />
            {showToggle && (
                <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.toggleLabel}>{toggleLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
        {showSuggestions && suggestions && suggestions.length > 0 && (
            <View style={styles.dropdown}>
                <ScrollView 
                    style={styles.dropdownScroll}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled">
                    {suggestions.map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={styles.dropdownItem}
                            onPress={() => onSelectSuggestion?.(item)}>
                            <Text style={styles.dropdownText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const DriverRegisterScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);
    const [lang, setLang] = useState<Lang>('EN');
    const S = STRINGS[lang];

    const [form, setForm] = useState<FormData>({
        fullName: '', phone: '', email: '',
        license: '', vehicle: '', experience: '',
        password: '', confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    
    const [vehicleSuggestions, setVehicleSuggestions] = useState<string[]>([]);
    const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

    const phoneRef = useRef<RNTextInput>(null);
    const emailRef = useRef<RNTextInput>(null);
    const licenseRef = useRef<RNTextInput>(null);
    const vehicleRef = useRef<RNTextInput>(null);
    const experienceRef = useRef<RNTextInput>(null);
    const passwordRef = useRef<RNTextInput>(null);
    const confirmRef = useRef<RNTextInput>(null);

    useEffect(() => {
        if (error) Alert.alert(S.failTitle, error, [{ text: S.ok, onPress: () => dispatch(clearError()) }]);
    }, [error, S.failTitle, S.ok]);

    const set = (key: keyof FormData) => (val: string) => {
        setForm(f => ({ ...f, [key]: val }));
        if (errors[key as keyof FormErrors]) setErrors(e => ({ ...e, [key]: undefined }));
        
        // Handle autocomplete for vehicle/ambulance ID
        if (key === 'vehicle') {
            if (val.trim().length > 0) {
                const filtered = AMBULANCE_IDS.filter(v => 
                    v.toLowerCase().startsWith(val.toLowerCase())
                );
                setVehicleSuggestions(filtered);
                setShowVehicleDropdown(true);
            } else {
                setShowVehicleDropdown(false);
            }
        }
    };
    
    const selectVehicle = (vehicle: string) => {
        setForm(f => ({ ...f, vehicle }));
        setShowVehicleDropdown(false);
        experienceRef.current?.focus();
    };

    const validate = (): boolean => {
        const e: FormErrors = {};

        // Enhanced name validation
        const name = form.fullName.trim();
        if (!name) {
            e.fullName = S.errName;
        } else {
            if (name.length < 3) {
                e.fullName = 'Name must be at least 3 characters long';
            }
            else if (name.split(/\s+/).length < 2) {
                e.fullName = 'Please enter your full name (first and last name)';
            }
            else if (/^(mr\.?|mrs\.?|ms\.?|dr\.?|test|demo|user|admin|sample|example|abc|xyz|xxx|aaa|bbb|driver)\s/i.test(name)) {
                e.fullName = 'Please enter your real name (no titles or test names)';
            }
            else if (/(.)\1{2,}/.test(name.replace(/\s/g, ''))) {
                e.fullName = 'Please enter a valid name';
            }
            else if (/\d/.test(name)) {
                e.fullName = 'Name cannot contain numbers';
            }
            else if (/[^a-zA-Z\s\-']/.test(name)) {
                e.fullName = 'Name contains invalid characters';
            }
            else if (name.split(/\s+/).some(word => word.length < 2)) {
                e.fullName = 'Each name part must be at least 2 characters';
            }
        }

        // Phone validation - check for repeated digits
        if (!form.phone.trim() || form.phone.length !== 10) {
            e.phone = S.errPhone;
        } else if (/^(\d)\1{9}$/.test(form.phone)) {
            e.phone = 'Please enter a valid phone number (not all same digits)';
        } else if (/^(0{10}|1{10}|9{10})$/.test(form.phone)) {
            e.phone = 'Please enter a valid phone number';
        }

        // Email validation - block disposable domains
        const disposableDomains = ['tempmail', 'throwaway', '10minutemail', 'guerrillamail', 'mailinator', 'trashmail', 'fakeinbox'];
        const emailDomain = form.email.toLowerCase().split('@')[1];
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            e.email = S.errEmail;
        } else if (disposableDomains.some(d => emailDomain?.includes(d))) {
            e.email = 'Please use a valid email (temporary emails not allowed)';
        }

        // License validation - must be at least 8 characters and contain letters and numbers
        const license = form.license.trim();
        if (!license) {
            e.license = S.errLicense;
        } else if (license.length < 8) {
            e.license = 'License number must be at least 8 characters';
        } else if (!/[A-Za-z]/.test(license) || !/\d/.test(license)) {
            e.license = 'License must contain both letters and numbers';
        } else if (/^(test|demo|sample|abc|xyz|xxx|aaa|123)$/i.test(license)) {
            e.license = 'Please enter a valid license number';
        }

        const exp = parseInt(form.experience, 10);
        if (!form.experience.trim() || isNaN(exp) || exp < 0 || exp > 50) e.experience = S.errExperience;
        if (form.password.length < 8) e.password = S.errPassword;
        else if (getPasswordStrength(form.password) < 3) e.password = S.errPasswordWeak;
        if (form.password !== form.confirmPassword) e.confirmPassword = S.errConfirm;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        const result = await dispatch(driverRegisterThunk({
            name: form.fullName,
            phone: `+91${form.phone}`,
            email: form.email,
            license_number: form.license,
            ambulance_id: form.vehicle.trim() || undefined,
            password: form.password,
        }));
        if (driverRegisterThunk.fulfilled.match(result)) {
            navigation.replace('WaitingApproval', {
                name: form.fullName,
                email: form.email,
                role: 'Driver',
                password: form.password,
            });
        }
    };

    const pwStrength = getPasswordStrength(form.password);
    const confirmMatch = form.confirmPassword.length > 0 && form.confirmPassword === form.password;

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{S.title}</Text>
                <View style={styles.toggle}>
                    {(['EN', 'HI'] as Lang[]).map(l => (
                        <TouchableOpacity key={l} onPress={() => setLang(l)}
                            style={[styles.togglePill, lang === l && styles.toggleActive]}>
                            <Text style={[styles.toggleText, lang === l && styles.toggleTextActive]}>
                                {l === 'EN' ? 'EN' : 'हिं'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={styles.card}>
                    {/* Icon + heading */}
                    <View style={styles.iconRow}>
                        <View style={styles.iconBox}>
                            <Image source={require('../../assets/ambulance_driver.png')} style={styles.roleImage} />
                        </View>
                    </View>
                    <Text style={styles.heading}>{S.heading}</Text>
                    <Text style={styles.sub}>{S.sub}</Text>

                    {/* Section: Personal Info */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>👤  Personal Information</Text>
                    </View>

                    <Field label={S.fullName} placeholder={S.fullNamePH} value={form.fullName}
                        onChangeText={set('fullName')} error={errors.fullName}
                        nextRef={phoneRef} autoCapitalize="words" />

                    <Field label={S.phone} placeholder={S.phonePH} value={form.phone}
                        onChangeText={set('phone')} error={errors.phone}
                        keyboardType="phone-pad" inputRef={phoneRef} nextRef={emailRef} />

                    <Field label={S.email} placeholder={S.emailPH} value={form.email}
                        onChangeText={set('email')} error={errors.email}
                        keyboardType="email-address" inputRef={emailRef} nextRef={licenseRef} />

                    {/* Section: Vehicle Info */}
                    <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                        <Text style={styles.sectionTitle}>🚗  Vehicle & License Details</Text>
                    </View>

                    <Field label={S.license} placeholder={S.licensePH} value={form.license}
                        onChangeText={set('license')} error={errors.license}
                        inputRef={licenseRef} nextRef={vehicleRef} autoCapitalize="characters" />

                    <Field label={S.vehicle} placeholder={S.vehiclePH} value={form.vehicle}
                        onChangeText={set('vehicle')} error={errors.vehicle}
                        inputRef={vehicleRef} nextRef={experienceRef} autoCapitalize="characters"
                        suggestions={vehicleSuggestions}
                        onSelectSuggestion={selectVehicle}
                        showSuggestions={showVehicleDropdown} />

                    <Field label={S.experience} placeholder={S.experiencePH} value={form.experience}
                        onChangeText={set('experience')} error={errors.experience}
                        keyboardType="numeric" inputRef={experienceRef} nextRef={passwordRef} />

                    {/* Section: Security */}
                    <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                        <Text style={styles.sectionTitle}>🔐  Account Security</Text>
                    </View>

                    <Field label={S.password} placeholder={S.passwordPH} value={form.password}
                        onChangeText={set('password')} error={errors.password}
                        secure={!showPassword} showToggle
                        toggleLabel={showPassword ? S.hide : S.show}
                        onToggle={() => setShowPassword(p => !p)}
                        inputRef={passwordRef} nextRef={confirmRef} />

                    {/* Password strength */}
                    {form.password.length > 0 && (
                        <View style={styles.strengthWrap}>
                            <View style={styles.strengthBars}>
                                {[1, 2, 3, 4].map(i => (
                                    <View key={i} style={[
                                        styles.strengthBar,
                                        { backgroundColor: i <= pwStrength ? strengthColor(pwStrength) : BORDER },
                                    ]} />
                                ))}
                            </View>
                            <Text style={[styles.strengthLabel, { color: strengthColor(pwStrength) }]}>
                                {S.pwStrength[pwStrength]}
                            </Text>
                        </View>
                    )}

                    {/* Confirm password */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{S.confirm}</Text>
                        <View style={[
                            styles.inputBox,
                            !!errors.confirmPassword && styles.inputError,
                            confirmMatch && styles.inputSuccess,
                        ]}>
                            <TextInput
                                ref={confirmRef}
                                style={styles.inputText}
                                placeholder={S.confirmPH}
                                placeholderTextColor={PLACEHOLDER}
                                value={form.confirmPassword}
                                onChangeText={set('confirmPassword')}
                                secureTextEntry
                                returnKeyType="done"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {confirmMatch && <Text style={styles.matchIcon}>✓</Text>}
                        </View>
                        {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    {/* Note */}
                    <View style={styles.note}>
                        <Text style={styles.noteText}>{S.note}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}>
                        {loading
                            ? <ActivityIndicator color={WHITE} size="small" />
                            : <Text style={styles.submitText}>{S.submit}</Text>}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{S.signIn} </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('DriverLogin')}>
                            <Text style={styles.footerLink}>{S.signInLink}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        backgroundColor: CARD,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: PURPLE_LIGHT, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
    toggle: { flexDirection: 'row', backgroundColor: BG, borderRadius: 20, padding: 2 },
    togglePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18 },
    toggleActive: { backgroundColor: PURPLE },
    toggleText: { fontSize: 12, fontWeight: '600', color: DIM },
    toggleTextActive: { color: WHITE },

    scroll: { padding: 16, paddingBottom: 48 },
    card: { backgroundColor: CARD, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: BORDER },

    iconRow: { alignItems: 'center', marginBottom: 16 },
    iconBox: {
        width: 72, height: 72, borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2, borderColor: PURPLE,
    },
    roleImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    heading: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 6, textAlign: 'center' },
    sub: { fontSize: 14, color: DIM, marginBottom: 24, lineHeight: 22, textAlign: 'center' },

    sectionHeader: {
        backgroundColor: 'rgba(123,47,190,0.15)',
        borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
        marginBottom: 18, borderLeftWidth: 3, borderLeftColor: PURPLE,
    },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: PURPLE_LIGHT, letterSpacing: 0.5 },

    fieldGroup: { marginBottom: 18 },
    label: { fontSize: 13, fontWeight: '700', color: DIM, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.7 },
    inputBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: BG, borderWidth: 1, borderColor: BORDER,
        borderRadius: 10, paddingHorizontal: 14,
    },
    inputError: { borderColor: RED },
    inputSuccess: { borderColor: PURPLE_LIGHT },
    matchIcon: { fontSize: 18, color: PURPLE_LIGHT, fontWeight: '900', paddingLeft: 8 },
    inputText: { flex: 1, fontSize: 16, color: WHITE, paddingVertical: 13 },
    toggleLabel: { fontSize: 12, fontWeight: '700', color: PURPLE_LIGHT, paddingLeft: 8 },
    errorText: { fontSize: 13, color: RED, marginTop: 5, marginLeft: 2, fontWeight: '600' },

    strengthWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4, gap: 10 },
    strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 12, fontWeight: '700', width: 50, textAlign: 'right' },

    note: {
        backgroundColor: BG, borderRadius: 10, padding: 14,
        marginBottom: 24, marginTop: 4,
        borderLeftWidth: 3, borderLeftColor: PURPLE,
    },
    noteText: { fontSize: 14, color: DIM, lineHeight: 22 },

    submitBtn: {
        backgroundColor: PURPLE, borderRadius: 12,
        paddingVertical: 16, alignItems: 'center',
        elevation: 4, shadowColor: PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8,
    },
    submitText: { color: WHITE, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    footerText: { fontSize: 14, color: DIM },
    footerLink: { fontSize: 14, color: PURPLE_LIGHT, fontWeight: '700' },
    
    dropdown: {
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 8,
        marginTop: 4,
        maxHeight: 200,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dropdownScroll: {
        maxHeight: 200,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
    },
    dropdownText: {
        fontSize: 15,
        color: WHITE,
        fontWeight: '500',
    },
});

export default DriverRegisterScreen;
