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

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const RED = '#FF5252';
const DIM = '#7A9E90';
const WHITE = '#FFFFFF';
const BORDER = '#1E3D33';

const STRINGS = {
    EN: {
        title: 'New Registration',
        heading: 'Create Account',
        sub: 'Register as an ASHA worker to get started',
        fullName: 'Full Name', fullNamePH: 'As per official records',
        phone: 'Phone Number', phonePH: '10-digit mobile number',
        district: 'District', districtPH: 'Your assigned district',
        ashaId: 'ASHA Worker ID (Optional)', ashaIdPH: 'Leave blank if not assigned yet',
        password: 'Create Password', passwordPH: 'Minimum 8 characters',
        confirm: 'Repeat Password', confirmPH: 'Type your password again',
        note: 'Your registration will be reviewed by your district supervisor. ASHA Worker ID will be assigned after verification.',
        submit: 'Submit Registration',
        signIn: 'Already have an account?',
        signInLink: 'Sign In',
        show: 'Show', hide: 'Hide',
        errName: 'Full name is required',
        errPhone: 'Enter a valid 10-digit phone number',
        errDistrict: 'District is required',
        errPassword: 'Password must be at least 8 characters',
        errConfirm: 'Passwords do not match',
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
        district: 'जिला', districtPH: 'आपका नियुक्त जिला',
        ashaId: 'ASHA ID (वैकल्पिक)', ashaIdPH: 'अभी नहीं है तो खाली छोड़ें',
        password: 'पासवर्ड बनाएं', passwordPH: 'न्यूनतम 8 अक्षर',
        confirm: 'पासवर्ड दोहराएं', confirmPH: 'पासवर्ड फिर से टाइप करें',
        note: 'आपका पंजीकरण जिला पर्यवेक्षक द्वारा समीक्षा किया जाएगा। सत्यापन के बाद ASHA ID दी जाएगी।',
        submit: 'पंजीकरण जमा करें',
        signIn: 'पहले से खाता है?',
        signInLink: 'साइन इन करें',
        show: 'दिखाएं', hide: 'छुपाएं',
        errName: 'पूरा नाम आवश्यक है',
        errPhone: 'वैध 10 अंकों का नंबर दर्ज करें',
        errDistrict: 'जिला आवश्यक है',
        errPassword: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
        errConfirm: 'पासवर्ड मेल नहीं खाते',
        failTitle: 'पंजीकरण विफल',
        successMsg: 'आपका अनुरोध अनुमोदन के लिए भेज दिया गया है। सत्यापन के बाद सूचित किया जाएगा।',
        ok: 'ठीक है',
    },
};

type Lang = 'EN' | 'HI';

interface FormData {
    fullName: string; phone: string; district: string;
    ashaId: string; password: string; confirmPassword: string;
}
interface FormErrors {
    fullName?: string; phone?: string; district?: string;
    password?: string; confirmPassword?: string;
}
interface FieldProps {
    label: string; placeholder: string; value: string;
    onChangeText: (v: string) => void; error?: string;
    keyboardType?: any; nextRef?: React.RefObject<RNTextInput>;
    inputRef?: React.RefObject<RNTextInput>; secure?: boolean;
    showToggle?: boolean; toggleLabel?: string; onToggle?: () => void;
    returnKeyType?: any; autoCapitalize?: any;
}

const Field = ({
    label, placeholder, value, onChangeText, error,
    keyboardType = 'default', nextRef, inputRef, secure,
    showToggle, toggleLabel, onToggle,
    returnKeyType = 'next', autoCapitalize = 'none',
}: FieldProps) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputBox, !!error && styles.inputError]}>
            <TextInput
                ref={inputRef}
                style={styles.inputText}
                placeholder={placeholder}
                placeholderTextColor={DIM}
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
        {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

const AshaRegisterScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, error } = useSelector((s: RootState) => s.auth);
    const [lang, setLang] = useState<Lang>('EN');
    const S = STRINGS[lang];

    const [form, setForm] = useState<FormData>({
        fullName: '', phone: '', district: '', ashaId: '', password: '', confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const confirmMatch = form.confirmPassword.length > 0 && form.confirmPassword === form.password;

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
    const districtRef = useRef<RNTextInput>(null);
    const ashaIdRef = useRef<RNTextInput>(null);
    const passwordRef = useRef<RNTextInput>(null);
    const confirmRef = useRef<RNTextInput>(null);

    useEffect(() => {
        if (error) Alert.alert(S.failTitle, error, [{ text: S.ok, onPress: () => dispatch(clearError()) }]);
    }, [error]);

    const set = (key: keyof FormData) => (val: string) => {
        setForm(f => ({ ...f, [key]: val }));
        if (errors[key as keyof FormErrors]) setErrors(e => ({ ...e, [key]: undefined }));
    };

    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!form.fullName.trim()) e.fullName = S.errName;
        if (!form.phone.trim() || form.phone.length !== 10) e.phone = S.errPhone;
        if (!form.district.trim()) e.district = S.errDistrict;
        if (form.password.length < 8) e.password = S.errPassword;
        if (form.password !== form.confirmPassword) e.confirmPassword = S.errConfirm;
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        const result = await dispatch(registerThunk({
            fullName: form.fullName, phone: form.phone,
            district: form.district, ashaId: form.ashaId || undefined,
            password: form.password,
        }));
        if (registerThunk.fulfilled.match(result)) {
            navigation.navigate('AshaIdCard', {
                fullName: form.fullName,
                phone: form.phone,
                district: form.district,
                ashaId: form.ashaId || undefined,
                photo: photo || undefined,
            });
        }
    };

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

            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <Text style={styles.heading}>{S.heading}</Text>
                    <Text style={styles.sub}>{S.sub}</Text>

                    {/* Photo picker */}
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

                    <Field label={S.fullName} placeholder={S.fullNamePH} value={form.fullName}
                        onChangeText={set('fullName')} error={errors.fullName}
                        nextRef={phoneRef} autoCapitalize="words" />

                    <Field label={S.phone} placeholder={S.phonePH} value={form.phone}
                        onChangeText={set('phone')} error={errors.phone}
                        keyboardType="phone-pad" inputRef={phoneRef} nextRef={districtRef} />

                    <Field label={S.district} placeholder={S.districtPH} value={form.district}
                        onChangeText={set('district')} error={errors.district}
                        inputRef={districtRef} nextRef={ashaIdRef} autoCapitalize="words" />

                    <Field label={S.ashaId} placeholder={S.ashaIdPH} value={form.ashaId}
                        onChangeText={set('ashaId')} inputRef={ashaIdRef} nextRef={passwordRef} />

                    <Field label={S.password} placeholder={S.passwordPH} value={form.password}
                        onChangeText={set('password')} error={errors.password}
                        secure={!showPassword} showToggle
                        toggleLabel={showPassword ? S.hide : S.show}
                        onToggle={() => setShowPassword(p => !p)}
                        inputRef={passwordRef} nextRef={confirmRef} />

                    {/* Confirm password — distinct: no show/hide, shows ✓ when matching */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>{S.confirm}</Text>
                        <View style={[styles.inputBox, !!errors.confirmPassword && styles.inputError,
                            confirmMatch && styles.inputSuccess]}>
                            <TextInput
                                ref={confirmRef}
                                style={styles.inputText}
                                placeholder={S.confirmPH}
                                placeholderTextColor={DIM}
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
    sub: { fontSize: 13, color: DIM, marginBottom: 28, lineHeight: 20 },
    fieldGroup: { marginBottom: 18 },
    label: {
        fontSize: 11, fontWeight: '700', color: DIM,
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
    inputText: { flex: 1, fontSize: 15, color: WHITE, paddingVertical: 13 },
    toggleLabel: { fontSize: 12, fontWeight: '700', color: GREEN, paddingLeft: 8 },
    errorText: { fontSize: 12, color: RED, marginTop: 5, marginLeft: 2 },
    note: {
        backgroundColor: BG, borderRadius: 10, padding: 14,
        marginBottom: 24, marginTop: 4,
        borderLeftWidth: 3, borderLeftColor: GREEN,
    },
    noteText: { fontSize: 13, color: DIM, lineHeight: 20 },
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

    photoPicker: {
        alignSelf: 'center',
        width: 90, height: 90,
        borderRadius: 45,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: GREEN,
        marginBottom: 24,
    },
    photoImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    photoEmpty: {
        flex: 1, backgroundColor: BG,
        alignItems: 'center', justifyContent: 'center', gap: 4,
    },
    photoEmoji: { fontSize: 26 },
    photoLabel: { fontSize: 11, color: DIM, fontWeight: '600' },
    photoBadge: {
        position: 'absolute', bottom: 4, right: 4,
        backgroundColor: GREEN, borderRadius: 10,
        width: 22, height: 22,
        alignItems: 'center', justifyContent: 'center',
    },
    photoBadgeText: { fontSize: 13, color: BG, fontWeight: '900' },
});

export default AshaRegisterScreen;
