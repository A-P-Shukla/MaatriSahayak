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

const EmergencyScreen = ({ navigation }: any) => {
    const [emergency, setEmergency] = useState({
        patientName: '',
        symptoms: '',
        location: '',
        severity: 'high',
    });

    const handleEmergencyAlert = () => {
        if (!emergency.patientName || !emergency.symptoms) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }
        // TODO: Implement emergency alert logic
        Alert.alert(
            'Emergency Alert Sent',
            'Hospital and ambulance have been notified',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emergencyIcon}>🚨</Text>
                <Text style={styles.title}>Emergency Alert</Text>
            </View>

            <Text style={styles.label}>Patient Name *</Text>
            <TextInput
                style={styles.input}
                value={emergency.patientName}
                onChangeText={(text) => setEmergency({ ...emergency, patientName: text })}
                placeholder="Enter patient name"
            />

            <Text style={styles.label}>Symptoms *</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={emergency.symptoms}
                onChangeText={(text) => setEmergency({ ...emergency, symptoms: text })}
                placeholder="Describe symptoms"
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
                style={styles.input}
                value={emergency.location}
                onChangeText={(text) => setEmergency({ ...emergency, location: text })}
                placeholder="Current location"
            />

            <Text style={styles.label}>Severity Level</Text>
            <View style={styles.severityContainer}>
                {['high', 'medium', 'low'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[
                            styles.severityButton,
                            emergency.severity === level && styles.severityButtonActive,
                        ]}
                        onPress={() => setEmergency({ ...emergency, severity: level })}>
                        <Text
                            style={[
                                styles.severityText,
                                emergency.severity === level && styles.severityTextActive,
                            ]}>
                            {level.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.emergencyButton}
                onPress={handleEmergencyAlert}>
                <Text style={styles.buttonText}>Send Emergency Alert</Text>
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
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    emergencyIcon: {
        fontSize: 64,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d32f2f',
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
    severityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    severityButton: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    severityButtonActive: {
        backgroundColor: '#d32f2f',
        borderColor: '#d32f2f',
    },
    severityText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    severityTextActive: {
        color: '#fff',
    },
    emergencyButton: {
        backgroundColor: '#d32f2f',
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

export default EmergencyScreen;
