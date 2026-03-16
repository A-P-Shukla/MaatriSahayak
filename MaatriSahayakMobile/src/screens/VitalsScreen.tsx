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

const VitalsScreen = ({ navigation }: any) => {
    const [vitals, setVitals] = useState({
        bloodPressure: '',
        weight: '',
        hemoglobin: '',
        temperature: '',
        pulse: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    const set = (key: string) => (val: string) => setVitals(v => ({ ...v, [key]: val }));

    const handleSubmit = () => {
        if (!vitals.bloodPressure.trim() || !vitals.weight.trim()) {
            Alert.alert('Missing Fields', 'Blood pressure and weight are required.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Saved', 'Vital signs recorded successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        }, 1000);
    };

    const fields = [
        { label: 'Blood Pressure', key: 'bloodPressure', placeholder: 'e.g. 120/80 mmHg', required: true },
        { label: 'Weight (kg)', key: 'weight', placeholder: 'e.g. 58', keyboard: 'numeric' as any, required: true },
        { label: 'Hemoglobin (g/dL)', key: 'hemoglobin', placeholder: 'e.g. 11.5', keyboard: 'numeric' as any },
        { label: 'Temperature (°F)', key: 'temperature', placeholder: 'e.g. 98.6', keyboard: 'numeric' as any },
        { label: 'Pulse (bpm)', key: 'pulse', placeholder: 'e.g. 78', keyboard: 'numeric' as any },
    ];

    return (
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="light-content" backgroundColor={PURPLE} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Record Vitals</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>

                <Text style={styles.sectionLabel}>Vital Signs</Text>

                {fields.map(f => (
                    <View key={f.key} style={styles.fieldGroup}>
                        <Text style={styles.label}>{f.label}{f.required && <Text style={styles.required}> *</Text>}</Text>
                        <TextInput
                            style={styles.input}
                            value={(vitals as any)[f.key]}
                            onChangeText={set(f.key)}
                            placeholder={f.placeholder}
                            placeholderTextColor="#B0B0B0"
                            keyboardType={f.keyboard || 'default'}
                        />
                    </View>
                ))}

                <Text style={styles.sectionLabel}>Additional Notes</Text>
                <View style={styles.fieldGroup}>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={vitals.notes}
                        onChangeText={set('notes')}
                        placeholder="Any observations or remarks..."
                        placeholderTextColor="#B0B0B0"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.8 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.9}>
                    {loading
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.submitText}>Save Vitals</Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8F4FC' },
    header: {
        backgroundColor: PURPLE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 20,
        paddingBottom: 18,
        paddingHorizontal: 20,
    },
    back: { fontSize: 22, color: '#fff', fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
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
    textArea: { height: 100, textAlignVertical: 'top', paddingTop: 13 },
    submitBtn: {
        backgroundColor: PINK,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        elevation: 4,
        shadowColor: PINK,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.4 },
});

export default VitalsScreen;
