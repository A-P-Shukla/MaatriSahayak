import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { restoreSessionThunk, checkPinThunk } from '../store/slices/authSlice';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import DriverLoginScreen from '../screens/DriverLoginScreen';
import DriverRegisterScreen from '../screens/DriverRegisterScreen';
import DriverIdCardScreen from '../screens/DriverIdCardScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import AshaRegisterScreen from '../screens/AshaRegisterScreen';
import AshaIdCardScreen from '../screens/AshaIdCardScreen';
import SetPinScreen from '../screens/SetPinScreen';
import PinLoginScreen from '../screens/PinLoginScreen';
import WaitingApprovalScreen from '../screens/WaitingApprovalScreen';
import HomeScreen from '../screens/HomeScreen';
import DriverHomeScreen from '../screens/DriverHomeScreen';
import DriverMyRidesScreen from '../screens/DriverMyRidesScreen';
import DriverUpdateLocationScreen from '../screens/DriverUpdateLocationScreen';
import DriverProfileScreen from '../screens/DriverProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VitalsScreen from '../screens/VitalsScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import PregnancyListScreen from '../screens/PregnancyListScreen';
import AlertsScreen from '../screens/AlertsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AncCardScreen from '../screens/AncCardScreen';
import NearbyPatientsScreen from '../screens/NearbyPatientsScreen';

import DriverEmergencyTrackingScreen from '../screens/DriverEmergencyTrackingScreen';

const Stack = createNativeStackNavigator();
const BG = '#0A1F1A';
const GREEN = '#00E5A0';

// Auth flow: Welcome → RoleSelect → Login / DriverLogin → Register → WaitingApproval → IdCard → SetPin
const AuthStack = () => (
    <Stack.Navigator 
        screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
        }}
    >
        <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{
                animation: 'fade',
            }}
        />
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="DriverLogin" component={DriverLoginScreen} />
        <Stack.Screen name="DriverRegister" component={DriverRegisterScreen} />
        <Stack.Screen name="WaitingApproval" component={WaitingApprovalScreen} />
        <Stack.Screen name="DriverIdCard" component={DriverIdCardScreen} />
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

// Driver app stack
const DriverAppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
        <Stack.Screen name="DriverMyRides" component={DriverMyRidesScreen} />
        <Stack.Screen name="DriverUpdateLocation" component={DriverUpdateLocationScreen} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="DriverEmergencyTracking" component={DriverEmergencyTrackingScreen} />
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
        <Stack.Screen name="NearbyPatients" component={NearbyPatientsScreen} />
        <Stack.Screen name="Alerts" component={AlertsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="AncCard" component={AncCardScreen} />
    </Stack.Navigator>
);

const AppNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, hasPinSet, pinVerified, user } = useSelector((s: RootState) => s.auth);
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
        if (user?.role === 'DRIVER') return <DriverAppStack />;
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
