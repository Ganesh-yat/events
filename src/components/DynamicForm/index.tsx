// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// export default function DynamicForm() {
//     return (
//         <View style={styles.container}>
//             <Text>DynamicForm</Text>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: "center",
//         justifyContent: "center",
//     },
// });






import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useGlobalInfo } from '../../context/GlobalContext';
import { API_ROUTE } from '../../lib/config';
import { getDefaultFieldSchema } from '../../lib/config/getDefaultFieldSchema';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import DraggableField from './DraggableField';
import FieldSettings from './FieldSettings';
import ToolboxField from './ToolboxField';

const FIELD_TYPES = [
    { type: 'Input Field', icon: '🔤' },
    { type: 'Email', icon: '📧' },
    { type: 'Textarea', icon: '📝' },
    { type: 'Number Field', icon: '🔢' },
    { type: 'Select Menu', icon: '📋' },
    { type: 'Radio Button', icon: '🔘' },
    { type: 'Checkbox', icon: '☑️' },
    { type: 'URL', icon: '🔗' },
    { type: 'File Upload', icon: '📁' },
    { type: 'Date', icon: '📅' },
    { type: 'Label', icon: '🏷️' },
    { type: 'Terms & Condition', icon: '📜' }
];

export default function FormBuilder() {
    const context = useGlobalInfo();
    const { theme, token } = context;
    const colors = Colors[theme];

    const [fields, setFields] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [finalSchema, setFinalSchema] = useState(null);

    const handleAddField = (type) => {
        const newField = getDefaultFieldSchema(type);
        setFields([...fields, newField]);
    };

    const handleReorder = ({ data }) => {
        setFields(data);
    };

    const handleSaveField = (updatedField) => {
        setFields(fields?.map(f => (f.id === updatedField.id ? updatedField : f)));
        setEditingId(null);
    };

    const handleProceed = async () => {
        const hasEmptyLabel = fields.some(field => !field.label || field.label.trim() === '');
        if (hasEmptyLabel) {
            Alert.alert('Validation Error', 'Please add labels to all fields.');
            return;
        }

        const schema = fields;
        setFinalSchema(schema);

        try {
            const body = {
                eventId: context?.event._id,
                fields: schema
            };

            // Create authenticated headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await fetch(`${API_ROUTE}/api/v1/even`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || `Event creation failed with status ${response.status}`);
            }

            const result = await response.json();
            console.log("Event submitted successfully:", result);

            Alert.alert('Success', 'Successfully created a dynamic form.');
        } catch (error) {
            console.error("Error submitting event:", error.message);
            Alert.alert('Error', error.message);
        }
    };

    const handleCancel = () => {
        setFields([]);
        setEditingId(null);
        setFinalSchema(null);
    };

    const renderItem = ({ item, drag, isActive }) => (
        <View style={{ marginBottom: 8 }}>
            <TouchableOpacity onLongPress={drag}>
                <DraggableField
                    field={item}
                    onConfigure={() => setEditingId(item.id)}
                    onDelete={() => setFields(fields.filter(f => f.id !== item.id))}
                />
            </TouchableOpacity>
            {editingId === item.id && (
                <FieldSettings
                    field={item}
                    onSave={handleSaveField}
                    onCancel={() => setEditingId(null)}
                />
            )}
        </View>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View>
                    <DraggableFlatList
                        data={fields}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        onDragEnd={handleReorder}
                        ListHeaderComponent={
                            <>
                                <Text style={[styles.note, { color: colors.button }]}>
                                    Participants will receive email, SMS, and WhatsApp after registration.
                                </Text>
                                {/* Toolbox */}
                                <Text style={[styles.header, { color: colors.text }]}>Add New Field</Text>
                                <View style={styles.toolbox}>
                                    {FIELD_TYPES.map(({ type, icon }) => (
                                        <ToolboxField
                                            key={type}
                                            type={type}
                                            icon={icon}
                                            onPress={() => handleAddField(type)}
                                        />
                                    ))}
                                </View>

                                {/* Form Designer label */}
                                <Text style={[styles.header, { color: colors.text }]}>Form Designer</Text>
                                {fields.length === 0 && (
                                    <Text style={[styles.emptyText, { color: colors.cancelButton }]}>
                                        Tap fields above to build your form
                                    </Text>
                                )}
                            </>
                        }
                        ListFooterComponent={
                            fields.length > 0 && (
                                <>
                                    {/* Proceed / Cancel */}
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={[
                                                styles.proceedButton,
                                                { backgroundColor: colors.button }
                                            ]}
                                            onPress={handleProceed}
                                        >
                                            <Text style={[styles.buttonText, { color: colors.buttonText }]}>Proceed</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[
                                                styles.cancelButton,
                                                { backgroundColor: colors.cancelButton }
                                            ]}
                                            onPress={handleCancel}
                                        >
                                            <Text style={[styles.buttonText, { color: colors.cancelButtonText }]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* optional JSON preview */}
                                    {Array.isArray(finalSchema) && finalSchema.length > 0 && (
                                        <View style={styles.jsonContainer}>
                                            <Text style={[styles.header, { color: colors.text }]}>
                                                Final JSON Schema (In Order)
                                            </Text>
                                            <View style={[
                                                styles.jsonBox,
                                                { backgroundColor: colors.dropdownBackground }
                                            ]}>
                                                <Text style={[styles.jsonText, { color: colors.secondaryText }]}>
                                                    {JSON.stringify(finalSchema, null, 2)}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )
                        }
                        contentContainerStyle={{ paddingBottom: 32 }}
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: { minHeight: 540, flex: 1, padding: 16 },
    note: { marginBottom: 8 },
    header: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
    toolbox: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
    emptyText: { marginTop: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
    proceedButton: { padding: 12, borderRadius: 4 },
    cancelButton: { padding: 12, borderRadius: 4 },
    buttonText: {},
    jsonContainer: { marginTop: 16 },
    jsonBox: { padding: 12, borderRadius: 4, maxHeight: 300 },
    jsonText: { fontFamily: 'Courier', fontSize: 12 }
});
