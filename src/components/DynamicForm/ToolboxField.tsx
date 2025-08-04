


import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useGlobalInfo } from '../../context/GlobalContext';

export default function ToolboxField({ type, icon, onPress }) {
    const { theme } = useGlobalInfo();
    const colors = Colors[theme];

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: colors.dropdownBackground,
                    borderColor: colors.secondaryText,
                    shadowColor: colors.overlay
                }
            ]}
            onPress={() => onPress(type)}
        >
            <View style={styles.content}>
                <Text style={[styles.icon, { color: colors.button }]}>{icon}</Text>
                <Text style={[styles.type, { color: colors.text }]}>{type}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        margin: 4,
        borderRadius: 4,
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
        // backgroundColor, borderColor, shadowColor via theme
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    icon: {
        fontSize: 16
        // color via theme
    },
    type: {
        fontSize: 14
        // color via theme
    }
});
