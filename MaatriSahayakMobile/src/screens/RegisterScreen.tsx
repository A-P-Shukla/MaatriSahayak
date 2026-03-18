import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    ScrollView, Alert, StatusBar, ActivityIndicator,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerPregnancyThunk, clearPregnancyError } from '../store/slices/pregnancySlice';
import { AppDispatch, RootState } from '../store';

const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const RED = '#FF6B6B';
const DIM = '#B8D4CC';
const WHITE = '#FFFFFF';
const BORDER = '#3A6B58';
const PLACEHOLDER = '#7AADA0';

const STRINGS = {
    EN: {
        title: 'Register Pregnancy',
        patientInfo: 'Patient Information',
        medicalDetails: 'Medical Details',
        name: "Mother's Name", namePH: 'Full name',
        age: 'Age', agePH: 'Years',
        phone: 'Phone Number', phonePH: '10-digit number',
        village: 'Village', villagePH: 'Village name',
        district: 'District', districtPH: 'District name',
        lmp: 'Last Menstrual Period (LMP)', lmpPH: 'YYYY-MM-DD',
        bloodGroup: 'Blood Group', bloodGroupPH: 'e.g. O+, A+, B+',
        edd: 'Expected Delivery Date', eddPH: 'YYYY-MM-DD',
        gravida: 'Gravida', gravidaPH: 'No. of pregnancies',
        submit: 'Register Pregnancy',
        errRequired: 'Name, age, phone, village, district, LMP and blood group are required.',
        errPhone: 'Enter a valid 10-digit phone number.',
        errAge: 'Enter a valid age (15–50).',
        success: 'Pregnancy case registered successfully.',
        ok: 'OK',
    },
    HI: {
        title: 'गर्भावस्था पंजीकरण',
        patientInfo: 'रोगी जानकारी',
        medicalDetails: 'चिकित्सा विवरण',
        name: 'माँ का नाम', namePH: 'पूरा नाम',
        age: 'आयु', agePH: 'वर्ष',
        phone: 'फ़ोन नंबर', phonePH: '10 अंक',
        village: 'गाँव', villagePH: 'गाँव का नाम',
        district: 'जिला', districtPH: 'जिले का नाम',
        lmp: 'अंतिम माहवारी (LMP)', lmpPH: 'YYYY-MM-DD',
        bloodGroup: 'रक्त समूह', bloodGroupPH: 'जैसे O+, A+, B+',
        edd: 'प्रसव की संभावित तिथि', eddPH: 'YYYY-MM-DD',
        gravida: 'ग्रेविडा', gravidaPH: 'गर्भधारण की संख्या',
        submit: 'पंजीकरण करें',
        errRequired: 'नाम, आयु, फ़ोन, गाँव, जिला, LMP और रक्त समूह आवश्यक हैं।',
        errPhone: 'वैध 10 अंकों का नंबर दर्ज करें।',
        errAge: 'वैध आयु दर्ज करें (15–50)।',
        success: 'गर्भावस्था केस सफलतापूर्वक पंजीकृत हुआ।',
        ok: 'ठीक है',
    },
};

type Lang = 'EN' | 'HI';

const Field = ({ label, value, onChange, placeholder, keyboard, caps, multi }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder: string; keyboard?: any; caps?: any; multi?: boolean;
}) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multi && styles.textArea]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={PLACEHOLDER}
            keyboardType={keyboard || 'default'}
            autoCapitalize={caps || 'none'}
            multiline={multi}
            numberOfLines={multi ? 3 : 1}
            textAlignVertical={multi ? 'top' : 'center'}
        />
    </View>
);

const RegisterScreen = ({ navigation }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const { submitting, error } = useSelector((s: RootState) => s.pregnancy);
    const { user } = useSelector((s: RootState) => s.auth);
    const [lang, setLang] = useState<Lang>('EN');
    const S = STRINGS[lang];

    const [form, setForm] = useState({
        name: '', age: '', phone: '', village: '',
        district: '', lmp: '', bloodGroup: '', edd: '', gravida: '',
    });
    const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [{ text: S.ok, onPress: () => dispatch(clearPregnancyError()) }]);
        }
    }, [error]);

    const handleSubmit = async () => {
        const { name, age, phone, village, district, lmp, bloodGroup } = form;
        if (!name.trim() || !age.trim() || !phone.trim() || !village.trim() || !district.trim() || !lmp.trim() || !bloodGroup.trim()) {
            Alert.alert('', S.errRequired); return;
        }
        if (phone.length !== 10) { Alert.alert('', S.errPhone); return; }
        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 15 || ageNum > 50) { Alert.alert('', S.errAge); return; }

        const result = await dispatch(registerPregnancyThunk({
            patient_name: name.trim(),
            age: ageNum,
            phone: `+91${phone}`,
            village: village.trim(),
            district: district.trim(),
            lmp_date: lmp.trim(),
            edd: form.edd.trim() || '',
            blood_type: bloodGroup.trim().toUpperCase(),
            gravida: form.gravida ? parseInt(form.gravida, 10) : undefined,
            asha_worker_id: user?.id || '',
        }));

        if (registerPregnancyThunk.fulfilled.match(result)) {
            Alert.alert('', S.success, [{ text: S.ok, onPress: () => navigation.goBack() }]);
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

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>{S.patientInfo}</Text>
                    <Field label={S.name} value={form.name} onChange={set('name')} placeholder={S.namePH} caps="words" />
                    <Field label={S.age} value={form.age} onChange={set('age')} placeholder={S.agePH} keyboard="numeric" />
                    <Field label={S.phone} value={form.phone} onChange={set('phone')} placeholder={S.phonePH} keyboard="phone-pad" />
                    <Field label={S.village} value={form.village} onChange={set('village')} placeholder={S.villagePH} caps="words" />
                    <Field label={S.district} value={form.district} onChange={set('district')} placeholder={S.districtPH} caps="words" />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionLabel}>{S.medicalDetails}</Text>
                    <Field label={S.lmp} value={form.lmp} onChange={set('lmp')} placeholder={S.lmpPH} />
                    <Field label={S.edd} value={form.edd} onChange={set('edd')} placeholder={S.eddPH} />
                    <Field label={S.bloodGroup} value={form.bloodGroup} onChange={set('bloodGroup')} placeholder={S.bloodGroupPH} caps="characters" />
                    <Field label={S.gravida} value={form.gravida} onChange={set('gravida')} placeholder={S.gravidaPH} keyboard="numeric" />
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
                    onPress={handleSubmit} disabled={submitting} activeOpacity={0.85}>
                    {submitting
                        ? <ActivityIndicator color={BG} size="small" />
                        : <Text style={styles.submitText}>{S.submit}</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        backgroundColor: CARD, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 48,
        paddingBottom: 16, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: BORDER,
    },
    back: { fontSize: 22, color: GREEN, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: WHITE, letterSpacing: 0.3 },
    toggle: { flexDirection: 'row', backgroundColor: BG, borderRadius: 20, padding: 2 },
    togglePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 18 },
    toggleActive: { backgroundColor: GREEN },
    toggleText: { fontSize: 12, fontWeight: '600', color: DIM },
    toggleTextActive: { color: BG },
    body: { flex: 1 },
    bodyContent: { padding: 16, paddingBottom: 40, gap: 12 },
    card: { backgroundColor: CARD, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: BORDER },
    sectionLabel: { fontSize: 11, fontWeight: '700', color: GREEN, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16 },
    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 11, fontWeight: '700', color: DIM, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
    input: { backgroundColor: BG, borderWidth: 1, borderColor: BORDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: WHITE },
    textArea: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
    submitBtn: {
        backgroundColor: GREEN, borderRadius: 12, paddingVertical: 16,
        alignItems: 'center', marginTop: 4, elevation: 4,
        shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    },
    submitText: { color: BG, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
});

export default RegisterScreen;
