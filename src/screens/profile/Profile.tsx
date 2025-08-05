import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useGlobalInfo } from '../../context/GlobalContext';
import { API_ROUTE } from '../../../config';
import { useNavigation } from "@react-navigation/native";

export default function Profile() {
    const { user, changeUser, changeUserId, changeUserType, theme, token } = useGlobalInfo();
    const colors = Colors[theme];
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        company_name: '',
        company_gst_number: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user?.existingUser?.name || '',
                email: user?.existingUser?.email || '',
                password: '',
                phone_number: user?.existingUser?.phone_number?.toString() || '',
                company_name: user?.existingUser?.company_name || '',
                company_gst_number: user?.existingUser?.company_gst_number || '',
            });
        }
    }, [user]);

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.email.trim()) {
            Alert.alert('Validation Error', 'Name and email are required.');
            return;
        }
        const userId = user?._id;
        if (!userId) {
            Alert.alert('Error', 'No user found.');
            return;
        }
        let payload = { ...formData };
        if (!payload.password) delete payload.password;

        setLoading(true);
        try {
            // Create authenticated headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const res = await fetch(`${API_ROUTE}/api/v1/users/${userId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (result.success) {
                console.log("result - ", result.data)
                changeUser?.(result.data);
                changeUserId?.(result.data._id);
                changeUserType?.(result.data.user_type);
                setFormData(f => ({ ...f, password: '' }));
                Alert.alert('Success', 'Profile updated successfully');
            } else {
                Alert.alert('Error', result.message || 'Update failed');
            }
        } catch (err) {
            Alert.alert('Error', 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>

                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    disabled={loading}
                >
                    <Text style={[styles.backText, { color: colors.button }]}>{"<"} Back</Text>
                </TouchableOpacity>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <View style={[styles.avatar, { backgroundColor: colors.button }]}>
                            <Text style={[styles.avatarText, { color: colors.buttonText }]}>
                                {formData.name?.slice(0, 1).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={[styles.name, { color: colors.text }]}>
                            {formData.name || 'User'}
                        </Text>
                        <Text style={[styles.designation, { color: colors.secondaryText }]}>
                            Edit your profile details
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput
                            placeholder="Name"
                            value={formData.name}
                            onChangeText={text => handleChange('name', text)}
                            style={[styles.input, { color: colors.text, borderColor: colors.button }]}
                            placeholderTextColor={colors.secondaryText}
                            autoCapitalize="words"
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Email"
                            value={formData.email}
                            onChangeText={text => handleChange('email', text)}
                            style={[styles.input, { color: colors.text, borderColor: colors.button }]}
                            placeholderTextColor={colors.secondaryText}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Phone Number"
                            value={formData.phone_number}
                            onChangeText={text => handleChange('phone_number', text)}
                            style={[styles.input, { color: colors.text, borderColor: colors.button }]}
                            placeholderTextColor={colors.secondaryText}
                            keyboardType="phone-pad"
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Change Password"
                            value={formData.password}
                            onChangeText={text => handleChange('password', text)}
                            style={[styles.input, { color: colors.text, borderColor: colors.button }]}
                            placeholderTextColor={colors.secondaryText}
                            secureTextEntry
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Company Name"
                            value={formData.company_name}
                            onChangeText={text => handleChange('company_name', text)}
                            style={[styles.input, { color: colors.text, borderColor: colors.button }]}
                            placeholderTextColor={colors.secondaryText}
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Company GST Number"
                            value={formData.company_gst_number}
                            onChangeText={text => handleChange('company_gst_number', text)}
                            style={[styles.input, { color: colors.text, borderColor: colors.button }]}
                            placeholderTextColor={colors.secondaryText}
                            editable={!loading}
                        />

                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.saveButton, { backgroundColor: colors.button, opacity: loading ? 0.6 : 1 }]}
                            disabled={loading}
                        >
                            <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 18,
        flexGrow: 1,
        justifyContent: 'center',
    },
    backBtn: {
        alignSelf: "flex-start",
        marginBottom: 4,
        marginTop: 10,
        marginLeft: 2,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    backText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    card: {
        padding: 22,
        borderRadius: 14,
        maxWidth: 540,
        alignSelf: 'center',
        width: '100%',
        elevation: 2,
        marginTop: 12,
        marginBottom: 34,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 22,
        fontWeight: '600',
        marginTop: 12,
    },
    designation: {
        fontSize: 15,
        marginTop: 2,
    },
    formContainer: {
        marginTop: 18,
    },
    input: {
        marginBottom: 14,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    saveButton: {
        marginTop: 14,
        borderRadius: 7,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

