import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
} from 'react-native';

const VitalsScreen = ({ navigation }: any) => {
    const [vitals, setVitals] = useState({
        bloodPressure: '',
        weight: '',
        hemoglobin: '',
        temperature: '',
        pulse: '',
        notes: '',
    });

    const handleSubmit = () => {
        if (!vitals.bloodPressure || !vitals.weight) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }
        // TODO: Implement vitals recording logic
        Alert.alert('Success', 'Vitals recorded successfully');
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Record Vital Signs</Text>

            <Text style={styles.label}>Blood Pressure *</Text>
            <TextInput
                style={styles.input}
                value={vitals.bloodPressure}
                onChangeText={(text) => setVitals({ ...vitals, bloodPressure: text })}
                placeholder="e.g., 120/80"
            />

            <Text style={styles.label}>Weight (kg) *</Text>
            <TextInput
                style={styles.input}
                value={vitals.weight}
                onChangeText={(text) => setVitals({ ...vitals, weight: text })}
                placeholder="Enter weight"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Hemoglobin (g/dL)</Text>
            <TextInput
                style={styles.input}
                value={vitals.hemoglobin}
                onChangeText={(text) => setVitals({ ...vitals, hemoglobin: text })}
                placeholder="Enter hemoglobin level"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Temperature (°F)</Text>
            <TextInput
                style={styles.input}
                value={vitals.temperature}
                onChangeText={(text) => setVitals({ ...vitals, temperature: text })}
                placeholder="e.g., 98.6"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Pulse (bpm)</Text>
            <TextInput
                style={styles.input}
                value={vitals.pulse}
                onChangeText={(text) => setVitals({ ...vitals, pulse: text })}
                placeholder="Enter pulse rate"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={vitals.notes}
                onChangeText={(text) => setVitals({ ...vitals, notes: text })}
                placeholder="Any additional observations"
                multiline
                numberOfLines={4}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Save Vitals</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#555',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 30,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default VitalsScreen;
