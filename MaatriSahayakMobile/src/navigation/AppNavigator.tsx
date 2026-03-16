import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { restoreSessionThunk, checkPinThunk } from '../store/slices/authSlice';

import LoginScreen from '../screens/LoginScreen';
import AshaRegisterScreen from '../screens/AshaRegisterScreen';
import AshaIdCardScreen from '../screens/AshaIdCardScreen';
import SetPinScreen from '../screens/SetPinScreen';
import PinLoginScreen from '../screens/PinLoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VitalsScreen from '../screens/VitalsScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import PregnancyListScreen from '../screens/PregnancyListScreen';

const Stack = createNativeStackNavigator();
const BG = '#0A1F1A';
const GREEN = '#00E5A0';

// Auth flow: Login → Register → IdCard → SetPin
const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AshaRegister" component={AshaRegisterScreen} />
        <Stack.Screen name="AshaIdCard" component={AshaIdCardScreen} />
        <Stack.Screen name="SetPin" component={SetPinScreen} />
        <Stack.Screen name="PinLogin" component={PinLoginScreen} />
    </Stack.Navigator>
);

// PIN flow: returning user with session but needs PIN verification
const PinStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PinLogin" component={PinLoginScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
);

// Main app after full auth
const AppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Vitals" component={VitalsScreen} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="PregnancyList" component={PregnancyListScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, sessionRestored, hasPinSet, pinVerified } = useSelector((s: RootState) => s.auth);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const init = async () => {
            await dispatch(restoreSessionThunk());
            await dispatch(checkPinThunk());
            setReady(true);
        };
        init();
    }, []);

    if (!ready) {
        return (
            <View style={styles.splash}>
                <ActivityIndicator size="large" color={GREEN} />
            </View>
        );
    }

    // Decide which stack to show:
    // 1. Authenticated + PIN verified → AppStack
    // 2. Authenticated + PIN set but not verified → PinStack (re-auth)
    // 3. Authenticated + no PIN set → AppStack (first login via phone/password)
    // 4. Not authenticated → AuthStack
    const getStack = () => {
        if (!isAuthenticated) return <AuthStack />;
        if (hasPinSet && !pinVerified) return <PinStack />;
        return <AppStack />;
    };

    return (
        <NavigationContainer>
            {getStack()}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    splash: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG },
});

export default AppNavigator;
