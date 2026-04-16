import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, KeyboardAvoidingView, Platform, ScrollView,
    StatusBar, ActivityIndicator, TextInput as RNTextInput, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk, clearError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { getAllDistricts, searchVillages } from '../services/locationService';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const RED = '#FF6B6B';
const ORANGE = '#FFA040';
const YELLOW = '#FFD700';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const PLACEHOLDER = '#7AADA0';

const STRINGS = {
    EN: {
        title: 'New Registration',
        heading: 'Create Account',
        sub: 'Register as an ASHA worker to get started',
        fullName: 'Full Name', fullNamePH: 'As per official records',
        phone: 'Phone Number', phonePH: '10-digit mobile number',
        email: 'Email', emailPH: 'Your email address',
        village: 'Village', villagePH: 'Your village name',
        age: 'Age', agePH: 'Your age in years',
        district: 'District', districtPH: 'Your assigned district',
        password: 'Create Password', passwordPH: 'Minimum 8 characters',
        confirm: 'Repeat Password', confirmPH: 'Type your password again',
        note: 'Your registration will be reviewed by your district supervisor. ASHA Worker ID will be assigned after verification.',
        submit: 'Submit Registration',
        signIn: 'Already have an account?',
        signInLink: 'Sign In',
        show: 'Show', hide: 'Hide',
        errName: 'Full name is required',
        errPhone: 'Enter a valid 10-digit phone number',
        errEmail: 'Enter a valid email address',
        errVillage: 'Village is required',
        errAge: 'Enter a valid age',
        errDistrict: 'District is required',
        errPassword: 'Password must be at least 8 characters',
        errPasswordWeak: 'Password must have uppercase, lowercase, number & special character',
        errConfirm: 'Passwords do not match',
        pwStrength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
        failTitle: 'Registration Failed',
        successMsg: 'Your request has been sent for approval. You will be notified once verified.',
        ok: 'OK',
    },
    HI: {
        title: 'नया पंजीकरण',
        heading: 'खाता बनाएं',
        sub: 'ASHA कार्यकर्ता के रूप में पंजीकरण करें',
        fullName: 'पूरा नाम', fullNamePH: 'आधिकारिक रिकॉर्ड के अनुसार',
        phone: 'फ़ोन नंबर', phonePH: '10 अंकों का मोबाइल नंबर',
        email: 'ईमेल', emailPH: 'आपका ईमेल पता',
        village: 'गाँव', villagePH: 'आपके गाँव का नाम',
        age: 'आयु', agePH: 'आपकी आयु वर्षों में',
        district: 'जिला', districtPH: 'आपका नियुक्त जिला',
        password: 'पासवर्ड बनाएं', passwordPH: 'न्यूनतम 8 अक्षर',
        confirm: 'पासवर्ड दोहराएं', confirmPH: 'पासवर्ड फिर से टाइप करें',
        note: 'आपका पंजीकरण जिला पर्यवेक्षक द्वारा समीक्षा किया जाएगा। सत्यापन के बाद ASHA ID दी जाएगी।',
        submit: 'पंजीकरण जमा करें',
        signIn: 'पहले से खाता है?',
        signInLink: 'साइन इन करें',
        show: 'दिखाएं', hide: 'छुपाएं',
        errName: 'पूरा नाम आवश्यक है',
        errPhone: 'वैध 10 अंकों का नंबर दर्ज करें',
        errEmail: 'वैध ईमेल पता दर्ज करें',
        errVillage: 'गाँव आवश्यक है',
        errAge: 'वैध आयु दर्ज करें',
        errDistrict: 'जिला आवश्यक है',
        errPassword: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
        errPasswordWeak: 'पासवर्ड में बड़े, छोटे अक्षर, संख्या और विशेष चिह्न होना चाहिए',
        errConfirm: 'पासवर्ड मेल नहीं खाते',
        pwStrength: ['', 'कमज़ोर', 'ठीक', 'अच्छा', 'मज़बूत'],
        failTitle: 'पंजीकरण विफल',
        successMsg: 'आपका अनुरोध अनुमोदन के लिए भेज दिया गया है। सत्यापन के बाद सूचित किया जाएगा।',
        ok: 'ठीक है',
    },
};

type Lang = 'EN' | 'HI';

interface FormData {
    fullName: string; phone: string; email: string; village: string;
    age: string; district: string; password: string; confirmPassword: string;
}
interface FormErrors {
    fullName?: string; phone?: string; email?: string; village?: string;
    age?: string; district?: string; password?: string; confirmPassword?: string;
}
interface FieldProps {
    label: string; placeholder: string; value: string;
    onChangeText: (v: string) => void; error?: string;
    keyboardType?: any; nextRef?: React.RefObject<RNTextInput>;
    inputRef?: React.RefObject<RNTextInput>; secure?: boolean;
    showToggle?: boolean; toggleLabel?: string; onToggle?: () => void;
    returnKeyType?: any; autoCapitalize?: any;
    suggestions?: string[]; onSelectSuggestion?: (v: string) => void;
    showSuggestions?: boolean;
}

// Returns 0-4 strength score
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

const strengthColor = (s: number) => [RED, RED, ORANGE, YELLOW, GREEN][s];

const Field = ({
    label, placeholder, value, onChangeText, error,
    keyboardType = 'default', nextRef, inputRef, secure,
    showToggle, toggleLabel, onToggle,
    returnKeyType = 'next', autoCapitalize = 'none',
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
                autoCorrect={false}
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

const AshaRegisterScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);
    const [lang, setLang] = useState<Lang>('EN');
    const S = STRINGS[lang];

    const [form, setForm] = useState<FormData>({
        fullName: '', phone: '', email: '', village: '', age: '', district: '', password: '', confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const confirmMatch = form.confirmPassword.length > 0 && form.confirmPassword === form.password;

    const [villageSuggestions, setVillageSuggestions] = useState<string[]>([]);
    const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
    const [showVillageDropdown, setShowVillageDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    const pickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow photo access.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow camera access.'); return; }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
        });
        if (!result.canceled && result.assets?.[0]) setPhoto(result.assets[0].uri);
    };

    const showPhotoOptions = () => {
        Alert.alert('Add Photo', 'Choose an option', [
            { text: '📷  Camera', onPress: takePhoto },
            { text: '🖼️  Gallery', onPress: pickPhoto },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const phoneRef = useRef<RNTextInput>(null);
    const emailRef = useRef<RNTextInput>(null);
    const villageRef = useRef<RNTextInput>(null);
    const ageRef = useRef<RNTextInput>(null);
    const districtRef = useRef<RNTextInput>(null);
    const passwordRef = useRef<RNTextInput>(null);
    const confirmRef = useRef<RNTextInput>(null);

    useEffect(() => {
        if (error) Alert.alert(S.failTitle, error, [{ text: S.ok, onPress: () => dispatch(clearError()) }]);
    }, [error, S.failTitle, S.ok]);

    const set = (key: keyof FormData) => (val: string) => {
        setForm(f => ({ ...f, [key]: val }));
        if (errors[key as keyof FormErrors]) setErrors(e => ({ ...e, [key]: undefined }));

        // Handle autocomplete for village - fetch from API based on district
        if (key === 'village') {
            if (val.trim().length > 0 && form.district.trim()) {
                setLoadingVillages(true);
                searchVillages(form.district, val)
                    .then(villages => {
                        setVillageSuggestions(villages);
                        setShowVillageDropdown(true);
                    })
                    .catch(() => setShowVillageDropdown(false))
                    .finally(() => setLoadingVillages(false));
            } else {
                setShowVillageDropdown(false);
            }
        }

        // Handle autocomplete for district
        if (key === 'district') {
            if (val.trim().length > 0) {
                const allDistricts = getAllDistricts();
                const filtered = allDistricts.filter(d =>
                    d.toLowerCase().startsWith(val.toLowerCase())
                );
                setDistrictSuggestions(filtered);
                setShowDistrictDropdown(true);
            } else {
                setShowDistrictDropdown(false);
            }
        }
    };

    const selectVillage = (village: string) => {
        setForm(f => ({ ...f, village }));
        setShowVillageDropdown(false);
        ageRef.current?.focus();
    };

    const selectDistrict = (district: string) => {
        setForm(f => ({ ...f, district, village: '' }));
        setShowDistrictDropdown(false);
        setVillageSuggestions([]);
        villageRef.current?.focus();
    };

    const validate = (): boolean => {
        const e: FormErrors = {};

        // Photo validation - Strongly encourage but don't block
        if (!photo) {
            Alert.alert(
                'Photo Highly Recommended',
                'Your photo is required for identity verification by the district officer. Without a photo, your registration may be delayed or rejected.\n\nDo you want to add your photo now?',
                [
                    { text: 'Add Photo Now', onPress: () => showPhotoOptions(), style: 'default' },
                    { text: 'Skip (Not Recommended)', onPress: () => { }, style: 'cancel' }
                ]
            );
        }

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
            else if (/^(mr\.?|mrs\.?|ms\.?|dr\.?|test|demo|user|admin|sample|example|abc|xyz|xxx|aaa|bbb)\s/i.test(name)) {
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

        if (!form.village.trim()) e.village = S.errVillage;
        const ageNum = parseInt(form.age, 10);
        if (!form.age.trim() || isNaN(ageNum) || ageNum < 18 || ageNum > 80) e.age = S.errAge;
        if (!form.district.trim()) e.district = S.errDistrict;
        if (form.password.length < 8) e.password = S.errPassword;
        else if (getPasswordStrength(form.password) < 3) e.password = S.errPasswordWeak;
        if (form.password !== form.confirmPassword) e.confirmPassword = S.errConfirm;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        // Convert photo to base64 if available
        let photoBase64 = undefined;
        if (photo) {
            try {
                const response = await fetch(photo);
                const blob = await response.blob();
                const reader = new FileReader();
                photoBase64 = await new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (photoError) {
                console.error("Failed to convert photo to base64", photoError);
                // Continue without photo
            }
        }

        const result = await dispatch(registerThunk({
            name: form.fullName,
            phone: `+91${form.phone}`,
            email: form.email,
            village: form.village,
            age: parseInt(form.age, 10),
            district: form.district,
            password: form.password,
            photo: photoBase64,
        }));
        if (registerThunk.fulfilled.match(result)) {
            navigation.replace('WaitingApproval', {
                name: form.fullName,
                email: form.email,
                role: 'ASHA Worker',
                password: form.password,
            });
        }
    };

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

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

            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <Text style={styles.heading}>{S.heading}</Text>
                    <Text style={styles.sub}>{S.sub}</Text>

                    <View style={styles.photoSection}>
                        <TouchableOpacity style={styles.photoPicker} onPress={showPhotoOptions} activeOpacity={0.8}>
                            {photo
                                ? <Image source={{ uri: photo }} style={styles.photoImg} />
                                : <View style={styles.photoEmpty}>
                                    <Text style={styles.photoEmoji}>📷</Text>
                                    <Text style={styles.photoLabel}>Add Photo</Text>
                                </View>
                            }
                            <View style={styles.photoBadge}>
                                <Text style={styles.photoBadgeText}>{photo ? '✎' : '+'}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.photoRequiredBadge}>
                            <Text style={styles.photoRequiredText}>* Required for Verification</Text>
                        </View>
                    </View>

                    <Field label={S.fullName} placeholder={S.fullNamePH} value={form.fullName}
                        onChangeText={set('fullName')} error={errors.fullName}
                        nextRef={phoneRef} autoCapitalize="words" />

                    <Field label={S.phone} placeholder={S.phonePH} value={form.phone}
                        onChangeText={set('phone')} error={errors.phone}
                        keyboardType="phone-pad" inputRef={phoneRef} nextRef={emailRef} />

                    <Field label={S.email} placeholder={S.emailPH} value={form.email}
                        onChangeText={set('email')} error={errors.email}
                        keyboardType="email-address" inputRef={emailRef} nextRef={villageRef} />

                    <Field label={S.village} placeholder={S.villagePH} value={form.village}
                        onChangeText={set('village')} error={errors.village}
                        inputRef={villageRef} nextRef={ageRef} autoCapitalize="words"
                        suggestions={villageSuggestions}
                        onSelectSuggestion={selectVillage}
                        showSuggestions={showVillageDropdown} />

                    <Field label={S.age} placeholder={S.agePH} value={form.age}
                        onChangeText={set('age')} error={errors.age}
                        keyboardType="numeric" inputRef={ageRef} nextRef={districtRef} />

                    <Field label={S.district} placeholder={S.districtPH} value={form.district}
                        onChangeText={set('district')} error={errors.district}
                        inputRef={districtRef} nextRef={passwordRef} autoCapitalize="words"
                        suggestions={districtSuggestions}
                        onSelectSuggestion={selectDistrict}
                        showSuggestions={showDistrictDropdown} />

                    <Field label={S.password} placeholder={S.passwordPH} value={form.password}
                        onChangeText={set('password')} error={errors.password}
                        secure={!showPassword} showToggle
                        toggleLabel={showPassword ? S.hide : S.show}
                        onToggle={() => setShowPassword(p => !p)}
                        inputRef={passwordRef} nextRef={confirmRef} />

                    {/* Password strength bar */}
                    {form.password.length > 0 && (() => {
                        const s = getPasswordStrength(form.password);
                        return (
                            <View style={styles.strengthWrap}>
                                <View style={styles.strengthBars}>
                                    {[1, 2, 3, 4].map(i => (
                                        <View key={i} style={[
                                            styles.strengthBar,
                                            { backgroundColor: i <= s ? strengthColor(s) : BORDER }
                                        ]} />
                                    ))}
                                </View>
                                <Text style={[styles.strengthLabel, { color: strengthColor(s) }]}>
                                    {S.pwStrength[s]}
                                </Text>
                            </View>
                        );
                    })()}

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{S.confirm}</Text>
                        <View style={[styles.inputBox, !!errors.confirmPassword && styles.inputError,
                        confirmMatch && styles.inputSuccess]}>
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

                    <View style={styles.note}>
                        <Text style={styles.noteText}>{S.note}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.85}>
                        {loading
                            ? <ActivityIndicator color={BG} size="small" />
                            : <Text style={styles.submitText}>{S.submit}</Text>}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{S.signIn} </Text>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
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
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
    toggle: { flexDirection: 'row', backgroundColor: BG, borderRadius: 20, padding: 2 },
    togglePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18 },
    toggleActive: { backgroundColor: GREEN },
    toggleText: { fontSize: 12, fontWeight: '600', color: DIM },
    toggleTextActive: { color: BG },
    scroll: { padding: 16, paddingBottom: 48 },
    card: {
        backgroundColor: CARD,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: BORDER,
    },
    heading: { fontSize: 24, fontWeight: '900', color: WHITE, marginBottom: 6 },
    sub: { fontSize: 14, color: DIM, marginBottom: 28, lineHeight: 22 },
    fieldGroup: { marginBottom: 18 },
    label: {
        fontSize: 13, fontWeight: '700', color: DIM,
        marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.7,
    },
    inputBox: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: BG, borderWidth: 1, borderColor: BORDER,
        borderRadius: 10, paddingHorizontal: 14,
    },
    inputError: { borderColor: RED },
    inputSuccess: { borderColor: GREEN },
    matchIcon: { fontSize: 18, color: GREEN, fontWeight: '900', paddingLeft: 8 },
    inputText: { flex: 1, fontSize: 16, color: WHITE, paddingVertical: 13 },
    toggleLabel: { fontSize: 12, fontWeight: '700', color: GREEN, paddingLeft: 8 },
    errorText: { fontSize: 13, color: RED, marginTop: 5, marginLeft: 2, fontWeight: '600' },
    strengthWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
    strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 12, fontWeight: '700', width: 50, textAlign: 'right' },
    note: {
        backgroundColor: BG, borderRadius: 10, padding: 14,
        marginBottom: 24, marginTop: 4,
        borderLeftWidth: 3, borderLeftColor: GREEN,
    },
    noteText: { fontSize: 14, color: DIM, lineHeight: 22 },
    submitBtn: {
        backgroundColor: GREEN, borderRadius: 12,
        paddingVertical: 16, alignItems: 'center',
        elevation: 4, shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8,
    },
    submitText: { color: BG, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    footerText: { fontSize: 14, color: DIM },
    footerLink: { fontSize: 14, color: GREEN, fontWeight: '700' },
    photoSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photoPicker: {
        width: 90, height: 90,
        borderRadius: 45,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: GREEN,
        marginBottom: 8,
    },
    photoRequiredBadge: {
        backgroundColor: RED,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    photoRequiredText: {
        fontSize: 11,
        color: WHITE,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoEmpty: {
        flex: 1, backgroundColor: BG,
        alignItems: 'center', justifyContent: 'center', gap: 4,
    },
    photoEmoji: { fontSize: 26 },
    photoLabel: { fontSize: 12, color: DIM, fontWeight: '600' },
    photoBadge: {
        position: 'absolute', bottom: 4, right: 4,
        backgroundColor: GREEN, borderRadius: 10,
        width: 22, height: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    photoBadgeText: { fontSize: 13, color: BG, fontWeight: '900' },
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

export default AshaRegisterScreen;
