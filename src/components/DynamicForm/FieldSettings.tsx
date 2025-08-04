


import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useGlobalInfo } from '../../context/GlobalContext';

export default function FieldSettings({ field, onSave, onCancel }) {
    const [form, setForm] = useState(field);
    const [rawOptionsText, setRawOptionsText] = useState((field.options || []).join('\n'));

    const { theme } = useGlobalInfo();
    const colors = Colors[theme];

    const handleChange = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleOptionsChange = (text) => {
        setRawOptionsText(text);
        const options = text.split('\n').filter(opt => opt.trim());
        setForm((prev) => ({ ...prev, options }));
    };

    const validate = () => {
        if (!form.label.trim()) {
            Alert.alert('Validation Error', 'Field Label is required.');
            return false;
        }

        if (
            ['Select Menu', 'Radio Button', 'Checkbox'].includes(form.type) &&
            (!form.options || form.options.length === 0 || form.options.some(opt => !opt.trim()))
        ) {
            Alert.alert('Validation Error', 'At least one valid option is required.');
            return false;
        }

        return true;
    };

    const handleSave = () => {
        if (validate()) onSave(form);
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.card,
                borderColor: colors.secondaryText,
            }
        ]}>
            <Text style={[styles.label, { color: colors.text }]}>
                Field Type: <Text style={[styles.value, { color: colors.secondaryText }]}>{form.type}</Text>
            </Text>

            <View style={styles.row}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.dropdownBackground,
                            borderColor: colors.secondaryText,
                            color: colors.text
                        }
                    ]}
                    placeholder="Enter label"
                    placeholderTextColor={colors.secondaryText}
                    value={form.label}
                    onChangeText={(text) => handleChange('label', text)}
                />
                {'maxLength' in form && (
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text
                            }
                        ]}
                        placeholder="Enter max length"
                        placeholderTextColor={colors.secondaryText}
                        value={form.maxLength ? String(form.maxLength) : ''}
                        onChangeText={(text) => handleChange('maxLength', text)}
                        keyboardType="numeric"
                    />
                )}
            </View>

            <TextInput
                style={[
                    styles.textarea,
                    {
                        backgroundColor: colors.dropdownBackground,
                        borderColor: colors.secondaryText,
                        color: colors.text
                    }
                ]}
                placeholder="Enter description"
                placeholderTextColor={colors.secondaryText}
                value={form.description}
                onChangeText={(text) => handleChange('description', text)}
                multiline
            />

            {['Select Menu', 'Radio Button', 'Checkbox'].includes(form.type) && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Add Multiple Options (Each option on a new line):
                    </Text>
                    <TextInput
                        style={[
                            styles.textarea,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text
                            }
                        ]}
                        placeholder="Option 1\nOption 2\nOption 3"
                        placeholderTextColor={colors.secondaryText}
                        value={rawOptionsText}
                        onChangeText={handleOptionsChange}
                        multiline
                    />
                </View>
            )}

            {form.type === 'URL' && (
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.dropdownBackground,
                            borderColor: colors.secondaryText,
                            color: colors.text
                        }
                    ]}
                    placeholder="Enter RegExp for URL validation"
                    placeholderTextColor={colors.secondaryText}
                    value={form.validationPattern || ''}
                    onChangeText={(text) => handleChange('validationPattern', text)}
                />
            )}

            {form.type === 'File Upload' && (
                <View style={styles.row}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text
                            }
                        ]}
                        placeholder="Accepted file types (e.g., .pdf, .jpg)"
                        placeholderTextColor={colors.secondaryText}
                        value={form.acceptedFileTypes || ''}
                        onChangeText={(text) => handleChange('acceptedFileTypes', text)}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text
                            }
                        ]}
                        placeholder="Max size (MB)"
                        placeholderTextColor={colors.secondaryText}
                        value={form.maxSizeMB ? String(form.maxSizeMB) : ''}
                        onChangeText={(text) => handleChange('maxSizeMB', text)}
                        keyboardType="numeric"
                    />
                </View>
            )}

            {form.type === 'Date' && (
                <View style={styles.row}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text
                            }
                        ]}
                        placeholder="Min Date (YYYY-MM-DD)"
                        placeholderTextColor={colors.secondaryText}
                        value={form.minDate || ''}
                        onChangeText={(text) => handleChange('minDate', text)}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text
                            }
                        ]}
                        placeholder="Max Date (YYYY-MM-DD)"
                        placeholderTextColor={colors.secondaryText}
                        value={form.maxDate || ''}
                        onChangeText={(text) => handleChange('maxDate', text)}
                    />
                </View>
            )}

            {form.type === 'Terms & Condition' && (
                <>
                    <TextInput
                        style={[
                            styles.textarea,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text
                            }
                        ]}
                        placeholder="Enter terms and conditions"
                        placeholderTextColor={colors.secondaryText}
                        value={form.text || ''}
                        onChangeText={(text) => handleChange('text', text)}
                        multiline
                    />
                    <View style={styles.switchRow}>
                        <Text style={[styles.switchLabel, { color: colors.text }]}>User must accept:</Text>
                        <Switch
                            value={form.isCheckedRequired}
                            onValueChange={(value) => handleChange('isCheckedRequired', value)}
                            trackColor={{ false: colors.cancelButton, true: colors.button }}
                            thumbColor={form.isCheckedRequired ? colors.button : colors.cancelButton}
                        />
                    </View>
                </>
            )}

            {/* Common toggles */}
            <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Mandatory:</Text>
                <Switch
                    value={form.mandatory}
                    onValueChange={(value) => handleChange('mandatory', value)}
                    trackColor={{ false: colors.cancelButton, true: colors.button }}
                    thumbColor={form.mandatory ? colors.button : colors.cancelButton}
                />
            </View>

            <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Invisible:</Text>
                <Switch
                    value={form.invisible}
                    onValueChange={(value) => handleChange('invisible', value)}
                    trackColor={{ false: colors.cancelButton, true: colors.button }}
                    thumbColor={form.invisible ? colors.button : colors.cancelButton}
                />
            </View>

            {form.type === 'Select Menu' && (
                <View style={styles.switchRow}>
                    <Text style={[styles.switchLabel, { color: colors.text }]}>EndPoint:</Text>
                    <Switch
                        value={form.endPoint}
                        onValueChange={(value) => handleChange('endPoint', value)}
                        trackColor={{ false: colors.cancelButton, true: colors.button }}
                        thumbColor={form.endPoint ? colors.button : colors.cancelButton}
                    />
                </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: colors.button }]}
                    onPress={handleSave}
                >
                    <Text style={[styles.buttonText, { color: colors.buttonText }]}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: colors.cancelButton }]}
                    onPress={onCancel}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.cancelButtonText }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 4,
        borderWidth: 1,
        marginBottom: 12
        // backgroundColor and borderColor handled via theme
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8
        // color via theme
    },
    value: {
        // color via theme
    },
    row: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8
    },
    input: {
        flex: 1,
        borderWidth: 1,
        padding: 8,
        borderRadius: 4
        // backgroundColor, borderColor, color via theme
    },
    textarea: {
        borderWidth: 1,
        padding: 8,
        borderRadius: 4,
        minHeight: 80,
        marginBottom: 8
        // backgroundColor, borderColor, color via theme
    },
    section: {
        marginBottom: 8
    },
    sectionTitle: {
        fontSize: 14,
        marginBottom: 4
        // color via theme
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    switchLabel: {
        fontSize: 14
        // color via theme
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    saveButton: {
        padding: 10,
        borderRadius: 4
        // backgroundColor via theme
    },
    cancelButton: {
        padding: 10,
        borderRadius: 4
        // backgroundColor via theme
    },
    buttonText: {
        textAlign: 'center'
        // color via theme
    },
    cancelButtonText: {
        textAlign: 'center'
        // color via theme
    }
});
