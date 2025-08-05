import { useNavigation } from '@react-navigation/native';
import React, { useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API_ROUTE } from "../../../config";
import { useGlobalInfo } from "../../context/GlobalContext";

const LoginScreen: React.FC = () => {
    const { colors, changeIsLoggedIn, changeUser, changeUserType, changeUserId, changeToken } = useGlobalInfo();
    const navigation = useNavigation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const slideAnim = useState(new Animated.Value(-100))[0];

    const showTopSnackbar = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
        }).start();

        setTimeout(() => {
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.in(Easing.ease),
            }).start(() => setSnackbarVisible(false));
        }, 3000);
    };

    const validateInputs = () => {
        const newErrors: typeof errors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(email)) newErrors.email = "Invalid email format";

        if (!password.trim()) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Min 6 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateInputs()) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_ROUTE}/api/v1/auth/sign-in`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                const userTypeFromApi = data?.data?.existingUser?.user_type;

                if (userTypeFromApi) {
                    console.log(data, "login-api-resp");

                    // Save token to global context
                    changeToken(data?.data?.token);
                    changeUserType(userTypeFromApi);
                    changeIsLoggedIn(true);
                    changeUserId(data?.data?.existingUser?._id);
                    changeUser(data?.data?.existingUser?.name || "");
                    console.log("userData", data?.data)
                    // navigation.navigate('Dashboard' as never); // Use 'replace' or 'navigate' as per your flow
                } else {
                    showTopSnackbar("User type not found. Cannot continue.");
                }
            } else {
                const errorMessage = data.message || "Invalid email or password";
                showTopSnackbar(errorMessage);
            }
        } catch (error) {
            console.error("Login error:", error);
            showTopSnackbar("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Image
                    source={require('../../assets/images/logo-company.png')}
                    style={styles.logo}
                />
                <Text style={[styles.title, { color: colors.text }]}>Events</Text>
            </View>

            <TextInput
                placeholder="Email"
                placeholderTextColor={colors.secondaryText}
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.dropdownBackground,
                        borderColor: colors.secondaryText,
                        color: colors.text
                    }
                ]}
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
                }}
                editable={!loading}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
                placeholder="Password"
                placeholderTextColor={colors.secondaryText}
                secureTextEntry
                style={[
                    styles.input,
                    {
                        backgroundColor: colors.dropdownBackground,
                        borderColor: colors.secondaryText,
                        color: colors.text
                    }
                ]}
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
                editable={!loading}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword' as never)}
                style={styles.forgotPasswordContainer}
                disabled={loading}
            >
                <Text style={[styles.forgotPasswordText, { color: colors.button }]}>
                    Forgot Password?
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: colors.button, opacity: loading ? 0.7 : 1 }
                ]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                        <ActivityIndicator size="small" color={colors.buttonText} style={{ marginRight: 8 }} />
                        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                            Logging in...
                        </Text>
                    </View>
                ) : (
                    <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                        Login
                    </Text>
                )}
            </TouchableOpacity>

            {snackbarVisible && (
                <Animated.View
                    style={[
                        styles.snackbar,
                        { transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={styles.snackbarText}>{snackbarMessage}</Text>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
        resizeMode: "contain",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        padding: 12,
        marginBottom: 15,
        borderRadius: 5,
    },
    error: {
        color: "#e53935",
        marginBottom: 12,
    },
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginBottom: 10,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    button: {
        paddingVertical: 12,
        borderRadius: 4,
        marginBottom: 12,
        marginTop: 10,
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '500',
        fontSize: 16,
    },
    snackbar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#e53935",
        padding: 14,
        zIndex: 1000,
        alignItems: "center",
    },
    snackbarText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default LoginScreen;
