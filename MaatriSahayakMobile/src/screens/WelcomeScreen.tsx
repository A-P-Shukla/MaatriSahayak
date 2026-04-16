import React, { useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet,
    StatusBar, Image, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Activity, Ambulance, Brain, ArrowRight, Shield } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const BG = '#0A1F1A';
const CARD = '#112920';
const GREEN = '#00E5A0';
const DIM = '#7FA898';
const WHITE = '#FFFFFF';
const BORDER = '#1E3D30';
const RED = '#FF0000';
const YELLOW = '#FFEB3B';
const HEX = '#ff6347';
const ERROR = '#ED4F32';

const WelcomeScreen = ({ navigation }: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={BG} />

            {/* Tricolor strip */}
            <View style={styles.tricolor}>
                <View style={[styles.strip, { backgroundColor: '#FF9933' }]} />
                <View style={[styles.strip, { backgroundColor: '#FFFFFF' }]} />
                <View style={[styles.strip, { backgroundColor: '#138808' }]} />
            </View>

            <View style={styles.container}>
                {/* App Icon with animation */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}>
                    <View style={styles.iconWrapper}>
                        <View style={styles.iconGlow} />
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.appIcon}
                        />
                    </View>
                </Animated.View>

                {/* App Name & Tagline */}
                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}>
                    <Text style={styles.appName}>MaatriSahayak</Text>
                    <View style={styles.taglineRow}>
                        <View style={styles.taglineDot} />
                        <Text style={styles.tagline}>Maternal Health Monitoring</Text>
                        <View style={styles.taglineDot} />
                    </View>
                    
                    <Text style={styles.mission}>
                        Empowering healthcare workers with AI-powered tools to save maternal lives
                    </Text>

                    {/* Feature Grid */}
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}>
                                <Heart size={22} color={RED} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.featureTitle}>Health Tracking</Text>
                            <Text style={styles.featureDesc}>Monitor vitals & ANC visits</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}>
                                <Ambulance size={22} color={YELLOW} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.featureTitle}>Emergency SOS</Text>
                            <Text style={styles.featureDesc}>Instant ambulance dispatch</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}>
                                <Brain size={22} color={HEX} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.featureTitle}>AI Risk Prediction</Text>
                            <Text style={styles.featureDesc}>Early warning system</Text>
                        </View>

                        <View style={styles.featureCard}>
                            <View style={styles.featureIconWrap}>
                                <Shield size={22} color={ERROR} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.featureTitle}>Real-time Alerts</Text>
                            <Text style={styles.featureDesc}>24/7 monitoring support</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* CTA Button */}
                <Animated.View
                    style={[
                        styles.buttonContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate('RoleSelect')}>
                        <Text style={styles.ctaText}>Get Started</Text>
                        <ArrowRight size={20} color={BG} strokeWidth={3} />
                    </TouchableOpacity>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Activity size={16} color={GREEN} strokeWidth={2} />
                            <Text style={styles.statText}>Live Monitoring</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Shield size={16} color={GREEN} strokeWidth={2} />
                            <Text style={styles.statText}>Secure & Private</Text>
                        </View>
                    </View>

                    <Text style={styles.footer}>
                        National Health Mission · Government of India
                    </Text>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: BG,
    },
    tricolor: {
        flexDirection: 'row',
        height: 4,
        width: '100%',
    },
    strip: { flex: 1 },
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    iconContainer: {
        marginTop: 20,
    },
    iconWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconGlow: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: GREEN,
        opacity: 0.15,
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 15,
    },
    appIcon: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        borderRadius: 24,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        color: WHITE,
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 12,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    taglineDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: GREEN,
    },
    tagline: {
        fontSize: 12,
        color: GREEN,
        letterSpacing: 1,
        fontWeight: '700',
        textAlign: 'center',
    },
    mission: {
        fontSize: 14,
        color: DIM,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        width: '100%',
        paddingHorizontal: 8,
    },
    featureCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: BORDER,
    },
    featureIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(0,229,160,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.2)',
    },
    featureTitle: {
        fontSize: 13,
        color: WHITE,
        fontWeight: '800',
        textAlign: 'center',
    },
    featureDesc: {
        fontSize: 11,
        color: DIM,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 16,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: GREEN,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 32,
        width: '100%',
        gap: 10,
        shadowColor: GREEN,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaText: {
        fontSize: 16,
        fontWeight: '900',
        color: BG,
        letterSpacing: 0.3,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginTop: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statDivider: {
        width: 1,
        height: 16,
        backgroundColor: BORDER,
    },
    statText: {
        fontSize: 12,
        color: DIM,
        fontWeight: '600',
    },
    footer: {
        textAlign: 'center',
        fontSize: 10,
        color: DIM,
        opacity: 0.5,
        marginTop: 16,
    },
});

export default WelcomeScreen;
