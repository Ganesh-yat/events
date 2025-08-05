import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGlobalInfo } from '../../context/GlobalContext';
import { API_ROUTE } from '../../../config';

interface SignUpData {
    name: string;
    phone_number: string;
    company_name: string;
    company_gst_number: string;
    location: string;
    email: string;
    password: string;
    confirmPassword: string;
    user_type: string;
}

export default function SignUpScreen() {
    const navigation = useNavigation<any>();
    const globalInfo = useGlobalInfo();
    const colors = globalInfo?.colors || {
        background: '#fff',
        text: '#11181C',
        secondaryText: '#333',
        button: '#6200EE',
        buttonText: '#fff',
        dropdownBackground: '#fafafa',
        overlay: 'rgba(0,0,0,0.5)',
    };
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SignUpData>({
        name: '',
        phone_number: '',
        company_name: '',
        company_gst_number: '',
        location: '',
        email: '',
        password: '',
        confirmPassword: '',
        user_type: 'admin',
    });

    const handleInputChange = (field: keyof SignUpData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return false;
        }
        if (!formData.phone_number.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return false;
        }
        if (!formData.company_name.trim()) {
            Alert.alert('Error', 'Please enter company name');
            return false;
        }
        if (!formData.company_gst_number.trim()) {
            Alert.alert('Error', 'Please enter company GST number');
            return false;
        }
        if (!formData.location.trim()) {
            Alert.alert('Error', 'Please enter location');
            return false;
        }
        if (!formData.email.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return false;
        }
        if (!formData.password.trim()) {
            Alert.alert('Error', 'Please enter password');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_ROUTE}/api/v1/auth/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Success',
                    'User successfully created! Please login with your credentials.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to create account');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView 
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
                <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
                    Sign up to start managing your events
                </Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Full Name"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                />

                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Phone Number"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.phone_number}
                    onChangeText={(text) => handleInputChange('phone_number', text)}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Company Name"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.company_name}
                    onChangeText={(text) => handleInputChange('company_name', text)}
                />

                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Company GST Number"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.company_gst_number}
                    onChangeText={(text) => handleInputChange('company_gst_number', text)}
                />

                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Location"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.location}
                    onChangeText={(text) => handleInputChange('location', text)}
                />

                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Email"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Password"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    secureTextEntry
                />

                <TextInput
                    style={[styles.input, { 
                        backgroundColor: colors.dropdownBackground, 
                        borderColor: colors.overlay,
                        color: colors.text 
                    }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.secondaryText}
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[
                        styles.signUpButton,
                        { backgroundColor: colors.button },
                        loading && { opacity: 0.7 }
                    ]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.buttonText} />
                    ) : (
                        <Text style={[styles.signUpButtonText, { color: colors.buttonText }]}>
                            Create Account
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={[styles.loginText, { color: colors.secondaryText }]}>
                        Already have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={[styles.loginLink, { color: colors.button }]}>
                            Sign In
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
    },
    signUpButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    signUpButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
    },
}); 