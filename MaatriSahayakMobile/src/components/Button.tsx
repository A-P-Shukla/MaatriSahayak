import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
    style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    style,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}>
            <Text style={[styles.text, styles[`${variant}Text`]]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: '#2196F3',
    },
    secondary: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    danger: {
        backgroundColor: '#d32f2f',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    primaryText: {
        color: '#fff',
    },
    secondaryText: {
        color: '#2196F3',
    },
    dangerText: {
        color: '#fff',
    },
});

export default Button;
