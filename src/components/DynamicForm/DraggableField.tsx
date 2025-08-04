

import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useGlobalInfo } from '../../context/GlobalContext';

export default function DraggableField({ field, onConfigure, onDelete }) {
    const [editingLabel, setEditingLabel] = useState(false);
    const [tempLabel, setTempLabel] = useState(field.label);

    const { theme } = useGlobalInfo();
    const colors = Colors[theme];

    const updateLabel = (label) => {
        field.label = label;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.dropdownBackground, shadowColor: colors.overlay }]}>
            <View style={styles.topRow}>
                {editingLabel ? (
                    <TextInput
                        value={tempLabel}
                        onChangeText={setTempLabel}
                        onBlur={() => {
                            setEditingLabel(false);
                            updateLabel(tempLabel);
                        }}
                        autoFocus
                        style={[
                            styles.input,
                            { borderBottomColor: colors.secondaryText, color: colors.text }
                        ]}
                        placeholder="Label"
                        placeholderTextColor={colors.secondaryText}
                    />
                ) : (
                    <TouchableOpacity onPress={() => setEditingLabel(true)}>
                        <Text style={[styles.label, { color: colors.text }]}>
                            {field.label || `${field.type} Name`}
                        </Text>
                    </TouchableOpacity>
                )}

                <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => onConfigure(field.id)} style={styles.iconButton}>
                        <Text style={[styles.icon, { color: colors.button }]}>⚙️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(field.id)} style={styles.iconButton}>
                        <Text style={[styles.icon, { color: colors.cancelButton }]}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={[styles.description, { color: colors.secondaryText }]}>
                {field.description || 'Field Description'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
        // backgroundColor and shadowColor are theme-based
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    input: {
        borderBottomWidth: 1,
        flex: 1,
        backgroundColor: 'transparent',
        paddingVertical: 4
        // borderBottomColor and color are theme-based
    },
    label: {
        fontSize: 16
        // color is theme-based
    },
    buttons: {
        flexDirection: 'row'
    },
    iconButton: {
        marginLeft: 12
    },
    icon: {
        fontSize: 18
        // color is theme-based
    },
    description: {
        fontSize: 12,
        marginTop: 4
        // color is theme-based
    }
});
