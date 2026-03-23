import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkBanner = () => {
    const [isOnline, setIsOnline] = useState(true);
    const [label, setLabel] = useState('');
    const [visible, setVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(-70)).current;
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialized = useRef(false);

    const slideIn = () => {
        setVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 80,
            friction: 10,
        }).start();
    };

    const slideOut = (delay = 2800) => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            Animated.timing(slideAnim, {
                toValue: -70,
                duration: 280,
                useNativeDriver: true,
            }).start(() => setVisible(false));
        }, delay);
    };

    useEffect(() => {
        const unsub = NetInfo.addEventListener((state) => {
            const online = !!(state.isConnected);

            // skip very first emission — just set baseline
            if (!initialized.current) {
                setIsOnline(online);
                initialized.current = true;
                return;
            }

            setIsOnline(online);

            if (!online) {
                if (hideTimer.current) clearTimeout(hideTimer.current);
                setLabel('📵  No internet — data saved locally');
                slideIn();
                // stay visible until reconnected
            } else {
                setLabel('✅  Back online — syncing your data...');
                slideIn();
                slideOut(3000);
            }
        });

        return () => {
            unsub();
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.toast,
                isOnline ? styles.online : styles.offline,
                { transform: [{ translateY: slideAnim }] },
            ]}
            pointerEvents="none"
        >
            <Text style={styles.text}>{label}</Text>
            {!isOnline && (
                <Text style={styles.sub}>
                    Your data is saved locally and will sync when you reconnect.
                </Text>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 52 : 32,
        left: 14,
        right: 14,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        zIndex: 9999,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    offline: {
        backgroundColor: '#1C0808',
        borderWidth: 1,
        borderColor: 'rgba(255,82,82,0.3)',
    },
    online: {
        backgroundColor: '#081A10',
        borderWidth: 1,
        borderColor: 'rgba(0,229,160,0.3)',
    },
    text: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    sub: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.55)',
        lineHeight: 15,
    },
});

export default NetworkBanner;
