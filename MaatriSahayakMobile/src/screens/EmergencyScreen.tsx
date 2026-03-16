import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

const PURPLE = '#4A148C';
const PINK = '#D81B60';
const DANGER = '#C62828';

const severityOptions = [
    { label: 'High', value: 'high', color: '#C62828', bg: '#FFEBEE' },
    { label: 'Medium', value: 'medium', color: '#E65100', bg: '#FFF3E0' },
    { label: 'Low', value: 'low', color: '#2E7D32', bg: '#E8F5E9' },
];

const EmergencyScreen = ({ navigation }: any) => {
    const [form, setForm] = useState({
        patientName: '',
        symptoms: '',
        location: '',
        severity: 'high',
    });
    const [loading, setLoading] = useState(false);

    const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = () => {
        if (!form.patientName.trim() || !form.symptoms.trim()) {
            Alert.alert('Missing Fields', 'Patient name and symptoms are required.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                'Alert Dispatched',
                'Hospital and ambulance have been notified immediately.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        }, 1000);
    };

    const selected = severityOptions.find(s => s.value === form.severity)!;

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={DANGER} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Emergency Alert</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.alertBanner}>
                <View style={styles.alertDot} />
                <Text style={styles.alertBannerText}>This will immediately notify the nearest hospital and ambulance</Text>
            </View>

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionLabel}>Patient Details</Text>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Patient Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        value={form.patientName}
                        onChangeText={set('patientName')}
                        placeholder="Full name of patient"
                        placeholderTextColor="#B0B0B0"
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Symptoms <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={form.symptoms}
                        onChangeText={set('symptoms')}
                        placeholder="Describe the symptoms in detail..."
                        placeholderTextColor="#B0B0B0"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Current Location</Text>
                    <TextInput
                        style={styles.input}
                        value={form.location}
                        onChangeText={set('location')}
                        placeholder="Village / landmark / address"
                        placeholderTextColor="#B0B0B0"
                        autoCapitalize="words"
                    />
                </View>

                <Text style={styles.sectionLabel}>Severity Level</Text>

                <View style={styles.severityRow}>
                    {severityOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.severityBtn,
                                form.severity === opt.value && { backgroundColor: opt.bg, borderColor: opt.color },
                            ]}
                            onPress={() => setForm(f => ({ ...f, severity: opt.value }))}>
                            <View style={[styles.severityDot, { backgroundColor: opt.color }]} />
                            <Text style={[
                                styles.severityLabel,
                                form.severity === opt.value && { color: opt.color, fontWeight: '700' },
                            ]}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: selected.color }, loading && { opacity: 0.8 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.9}>
                    {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.submitText}>Send Emergency Alert</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8F4FC' },
    header: {
        backgroundColor: DANGER,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 20,
        paddingBottom: 18,
        paddingHorizontal: 20,
    },
    back: { fontSize: 22, color: '#fff', fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FFCDD2',
    },
    alertDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: DANGER,
        marginRight: 10,
    },
    alertBannerText: {
        fontSize: 13,
        color: DANGER,
        fontWeight: '500',
        flex: 1,
    },
    body: { flex: 1 },
    bodyContent: { padding: 20, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: PURPLE,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 8,
    },
    fieldGroup: { marginBottom: 16 },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#444',
        marginBottom: 7,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    required: { color: PINK },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#EBEBEB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 13,
        fontSize: 15,
        color: '#1A1A1A',
    },
    textArea: { height: 110, textAlignVertical: 'top', paddingTop: 13 },
    severityRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    severityBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#EBEBEB',
        backgroundColor: '#fff',
        gap: 6,
    },
    severityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    severityLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
    },
    submitBtn: {
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
});

export default EmergencyScreen;
