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

const RegisterScreen = ({ navigation }: any) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        phone: '',
        address: '',
        lmp: '',
        bloodGroup: '',
    });

    const handleSubmit = () => {
        if (!formData.name || !formData.age || !formData.phone) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }
        // TODO: Implement registration logic
        Alert.alert('Success', 'Pregnancy registered successfully');
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Register New Pregnancy</Text>

            <Text style={styles.label}>Mother's Name *</Text>
            <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter full name"
            />

            <Text style={styles.label}>Age *</Text>
            <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Enter age"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter address"
                multiline
            />

            <Text style={styles.label}>Last Menstrual Period (LMP)</Text>
            <TextInput
                style={styles.input}
                value={formData.lmp}
                onChangeText={(text) => setFormData({ ...formData, lmp: text })}
                placeholder="DD/MM/YYYY"
            />

            <Text style={styles.label}>Blood Group</Text>
            <TextInput
                style={styles.input}
                value={formData.bloodGroup}
                onChangeText={(text) => setFormData({ ...formData, bloodGroup: text })}
                placeholder="e.g., O+, A+, B+, AB+"
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Register Pregnancy</Text>
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

export default RegisterScreen;
