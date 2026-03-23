import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    StatusBar, ActivityIndicator, Linking, Platform, Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG     = '#0D0A1F';
const CARD   = '#1A1230';
const PURPLE = '#7B2FBE';
const GREEN  = '#00E5A0';
const RED    = '#FF5252';
const WHITE  = '#FFFFFF';
const DIM    = '#C4B8D4';
const ORANGE = '#FFA040';

interface Props {
    navigation: any;
    route: any;
}

const DriverEmergencyTrackingScreen = ({ navigation, route }: Props) => {
    const emergency = route?.params?.emergency ?? {};
    const patientLat  = emergency.latitude  ?? 26.8467;
    const patientLng  = emergency.longitude ?? 80.9462;
    const hospitalLat = emergency.hospitalLat ?? 26.8550;
    const hospitalLng = emergency.hospitalLng ?? 80.9500;

    const mapRef = useRef<MapView>(null);
    const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState(false);
    const [eta, setEta] = useState<string>('Calculating...');
    const [phase, setPhase] = useState<'TO_PATIENT' | 'TO_HOSPITAL'>('TO_PATIENT');

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const startTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError(true);
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 10,
                },
                (loc) => {
                    const coords = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude,
                    };
                    setDriverLocation(coords);
                    updateEta(coords);
                }
            );
        };

        startTracking();
        return () => { subscription?.remove(); };
    }, [phase]);

    const updateEta = (driver: { latitude: number; longitude: number }) => {
        const target = phase === 'TO_PATIENT'
            ? { latitude: patientLat, longitude: patientLng }
            : { latitude: hospitalLat, longitude: hospitalLng };

        const dist = getDistanceKm(driver, target);
        const minutes = Math.round((dist / 40) * 60); // assume 40 km/h avg
        setEta(minutes <= 1 ? '< 1 min' : `~${minutes} min`);
    };

    const getDistanceKm = (
        a: { latitude: number; longitude: number },
        b: { latitude: number; longitude: number }
    ) => {
        const R = 6371;
        const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
        const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
        const x =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((a.latitude * Math.PI) / 180) *
            Math.cos((b.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    };

    const fitMap = () => {
        if (!mapRef.current) return;
        const coords = [
            { latitude: patientLat, longitude: patientLng },
            { latitude: hospitalLat, longitude: hospitalLng },
        ];
        if (driverLocation) coords.push(driverLocation);
        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 80, right: 60, bottom: 200, left: 60 },
            animated: true,
        });
    };

    const openGoogleMaps = () => {
        const target = phase === 'TO_PATIENT'
            ? `${patientLat},${patientLng}`
            : `${hospitalLat},${hospitalLng}`;
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=driving`);
    };

    const handlePhaseSwitch = () => {
        Alert.alert(
            'Picked up patient?',
            'Switch navigation to the hospital?',
            [
                { text: 'Not yet', style: 'cancel' },
                { text: 'Yes, go to hospital', onPress: () => setPhase('TO_HOSPITAL') },
            ]
        );
    };

    const routeCoords = driverLocation
        ? [
            driverLocation,
            phase === 'TO_PATIENT'
                ? { latitude: patientLat, longitude: patientLng }
                : { latitude: hospitalLat, longitude: hospitalLng },
          ]
        : [];

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>🚨 Emergency Tracking</Text>
                    <Text style={styles.headerSub}>
                        {phase === 'TO_PATIENT' ? 'En route to patient' : 'En route to hospital'}
                    </Text>
                </View>
                <View style={styles.etaBadge}>
                    <Text style={styles.etaLabel}>ETA</Text>
                    <Text style={styles.etaValue}>{eta}</Text>
                </View>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                {locationError ? (
                    <View style={styles.mapError}>
                        <Text style={styles.mapErrorText}>📍 Location permission denied</Text>
                        <Text style={styles.mapErrorSub}>Enable location to see the map</Text>
                    </View>
                ) : (
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: patientLat,
                            longitude: patientLng,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        onMapReady={fitMap}
                        showsUserLocation
                        showsMyLocationButton={false}
                        showsTraffic
                    >
                        {/* Patient marker */}
                        <Marker
                            coordinate={{ latitude: patientLat, longitude: patientLng }}
                            title="Patient Location"
                            description={emergency.patientName ?? 'Patient'}
                            pinColor={RED}
                        />

                        {/* Hospital marker */}
                        <Marker
                            coordinate={{ latitude: hospitalLat, longitude: hospitalLng }}
                            title="Hospital"
                            description={emergency.hospitalName ?? 'Nearest Hospital'}
                            pinColor={GREEN}
                        />

                        {/* Driver marker */}
                        {driverLocation && (
                            <Marker
                                coordinate={driverLocation}
                                title="You"
                                anchor={{ x: 0.5, y: 0.5 }}
                            >
                                <View style={styles.driverMarker}>
                                    <Text style={styles.driverMarkerText}>🚑</Text>
                                </View>
                            </Marker>
                        )}

                        {/* Route line */}
                        {routeCoords.length === 2 && (
                            <Polyline
                                coordinates={routeCoords}
                                strokeColor={phase === 'TO_PATIENT' ? RED : GREEN}
                                strokeWidth={4}
                                lineDashPattern={[10, 5]}
                            />
                        )}
                    </MapView>
                )}
            </View>

            {/* Bottom panel */}
            <View style={styles.bottomPanel}>
                {/* Info row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>👤 Patient</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {emergency.patientName ?? 'Unknown'}
                        </Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>🏥 Hospital</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                            {emergency.hospitalName ?? 'Nearest'}
                        </Text>
                    </View>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>🚨 Type</Text>
                        <Text style={[styles.infoValue, { color: RED }]} numberOfLines={1}>
                            {(emergency.event_type ?? 'EMERGENCY').replace(/_/g, ' ')}
                        </Text>
                    </View>
                </View>

                {/* Phase indicator */}
                <View style={styles.phaseRow}>
                    <View style={[styles.phaseStep, phase === 'TO_PATIENT' && styles.phaseStepActive]}>
                        <Text style={styles.phaseStepText}>1. Pick up patient</Text>
                    </View>
                    <View style={styles.phaseArrow}><Text style={styles.phaseArrowText}>→</Text></View>
                    <View style={[styles.phaseStep, phase === 'TO_HOSPITAL' && styles.phaseStepActive]}>
                        <Text style={styles.phaseStepText}>2. Go to hospital</Text>
                    </View>
                </View>

                {/* Action buttons */}
                <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.mapsBtn} onPress={openGoogleMaps} activeOpacity={0.85}>
                        <Text style={styles.mapsBtnText}>🗺 Open in Maps</Text>
                    </TouchableOpacity>

                    {phase === 'TO_PATIENT' ? (
                        <TouchableOpacity style={styles.switchBtn} onPress={handlePhaseSwitch} activeOpacity={0.85}>
                            <Text style={styles.switchBtnText}>✅ Patient Picked Up</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.switchBtn, { backgroundColor: GREEN }]}
                            onPress={() => Alert.alert('Complete Ride', 'Mark this emergency as completed?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Complete', onPress: () => navigation.goBack() },
                            ])}
                            activeOpacity={0.85}
                        >
                            <Text style={[styles.switchBtnText, { color: BG }]}>🏁 Complete Ride</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: BG, gap: 12,
        borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    backBtn: { padding: 4 },
    backText: { fontSize: 22, color: WHITE, fontWeight: '600' },
    headerCenter: { flex: 1 },
    headerTitle: { fontSize: 15, fontWeight: '800', color: WHITE },
    headerSub: { fontSize: 11, color: DIM, marginTop: 2 },
    etaBadge: {
        backgroundColor: 'rgba(255,82,82,0.15)', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 6,
        borderWidth: 1, borderColor: 'rgba(255,82,82,0.3)',
        alignItems: 'center',
    },
    etaLabel: { fontSize: 9, color: RED, fontWeight: '700', letterSpacing: 1 },
    etaValue: { fontSize: 13, color: RED, fontWeight: '900' },

    mapContainer: { flex: 1 },
    map: { flex: 1 },
    mapError: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CARD },
    mapErrorText: { fontSize: 16, color: WHITE, fontWeight: '700', marginBottom: 8 },
    mapErrorSub: { fontSize: 13, color: DIM },

    driverMarker: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: WHITE,
    },
    driverMarkerText: { fontSize: 20 },

    bottomPanel: {
        backgroundColor: CARD, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24,
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    },

    infoRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: BG, borderRadius: 12, padding: 14,
        marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    infoItem: { flex: 1, alignItems: 'center' },
    infoLabel: { fontSize: 10, color: DIM, fontWeight: '600', marginBottom: 4 },
    infoValue: { fontSize: 12, color: WHITE, fontWeight: '700', textAlign: 'center' },
    infoDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.08)' },

    phaseRow: {
        flexDirection: 'row', alignItems: 'center',
        marginBottom: 14, gap: 8,
    },
    phaseStep: {
        flex: 1, paddingVertical: 8, paddingHorizontal: 10,
        borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    phaseStepActive: { borderColor: PURPLE, backgroundColor: 'rgba(123,47,190,0.2)' },
    phaseStepText: { fontSize: 11, color: DIM, fontWeight: '600' },
    phaseArrow: { alignItems: 'center' },
    phaseArrowText: { color: DIM, fontSize: 14 },

    btnRow: { flexDirection: 'row', gap: 10 },
    mapsBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        backgroundColor: 'rgba(123,47,190,0.2)',
        borderWidth: 1, borderColor: PURPLE,
        alignItems: 'center',
    },
    mapsBtnText: { fontSize: 13, color: WHITE, fontWeight: '700' },
    switchBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        backgroundColor: ORANGE, alignItems: 'center',
    },
    switchBtnText: { fontSize: 13, color: WHITE, fontWeight: '800' },
});

export default DriverEmergencyTrackingScreen;
