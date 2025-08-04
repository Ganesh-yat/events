import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useGlobalInfo } from "../../context/GlobalContext";
import { useNavigation } from "@react-navigation/native";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [strength, setStrength] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigation = useNavigation();
    const { theme } = useGlobalInfo();

    const evaluateStrength = (pwd) => {
        if (pwd.length < 6) return "Weak";
        if (/\d/.test(pwd) && /[A-Z]/.test(pwd) && /[!@#$%^&*]/.test(pwd))
            return "Strong";
        return "Medium";
    };

    const handleSubmit = async () => {
        setError("");
        setMessage("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("https://your-api.com/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Password reset successfully");
                setTimeout(() => {
                    navigation.navigate("LoginScreen"); // Make sure this matches your stack navigator
                }, 1000);
            } else {
                setError(data.message || "Failed to reset password");
            }
        } catch {
            setError("Server error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (pwd) => {
        setPassword(pwd);
        setStrength(evaluateStrength(pwd));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.container, { backgroundColor: Colors[theme].background }]}
        >
            <View style={[styles.card, { backgroundColor: Colors[theme].card }]}>
                <View style={styles.header}>
                    <Image
                        source={require("../../assets/images/logo-company.png")}
                        style={styles.logo}
                    />
                </View>
                <Text style={[styles.title, { color: Colors[theme].text }]}>Reset your password</Text>
                <Text style={[styles.subtitle, { color: Colors[theme].secondaryText }]}>
                    Choose a new secure password.
                </Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {message ? <Text style={styles.success}>{message}</Text> : null}

                <View>
                    <TextInput
                        placeholder="New Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={handleChange}
                        style={[
                            styles.input,
                            {
                                backgroundColor: Colors[theme].dropdownBackground,
                                borderColor: Colors[theme].secondaryText,
                                color: Colors[theme].text,
                            },
                        ]}
                        placeholderTextColor={Colors[theme].secondaryText}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword((s) => !s)}
                        disabled={loading}
                    >
                        <Text style={{ color: Colors[theme].button }}>
                            {showPassword ? "Hide" : "Show"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {password ? (
                    <Text
                        style={[
                            styles.strength,
                            strength === "Strong"
                                ? styles.strong
                                : strength === "Medium"
                                    ? styles.medium
                                    : styles.weak,
                        ]}
                    >
                        Strength: {strength}
                    </Text>
                ) : null}

                <View>
                    <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        style={[
                            styles.input,
                            {
                                backgroundColor: Colors[theme].dropdownBackground,
                                borderColor: Colors[theme].secondaryText,
                                color: Colors[theme].text,
                            },
                        ]}
                        placeholderTextColor={Colors[theme].secondaryText}
                        editable={!loading}
                    />
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowConfirmPassword((s) => !s)}
                        disabled={loading}
                    >
                        <Text style={{ color: Colors[theme].button }}>
                            {showConfirmPassword ? "Hide" : "Show"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: Colors[theme].button, opacity: loading ? 0.7 : 1 },
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ActivityIndicator
                                size="small"
                                color={Colors[theme].buttonText}
                                style={{ marginRight: 8 }}
                            />
                            <Text style={[styles.buttonText, { color: Colors[theme].buttonText }]}>
                                Resetting...
                            </Text>
                        </View>
                    ) : (
                        <Text style={[styles.buttonText, { color: Colors[theme].buttonText }]}>
                            Reset Password
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.goBack}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={{ color: Colors[theme].button, fontWeight: "bold" }}>
                        {"<"} Back
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    logo: {
        width: 70,
        height: 70,
        resizeMode: "contain",
        marginTop: 12,
    },
    card: {
        width: "100%",
        padding: 20,
        borderRadius: 8,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    eyeBtn: {
        position: "absolute",
        right: 10,
        top: 14,
        padding: 2,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        fontWeight: "600",
        fontSize: 16,
    },
    error: {
        color: "#e53935",
        marginBottom: 10,
        textAlign: "center",
    },
    success: {
        color: "green",
        marginBottom: 10,
        textAlign: "center",
    },
    strength: {
        fontSize: 14,
        marginBottom: 10,
        textAlign: "center",
    },
    weak: {
        color: "red",
    },
    medium: {
        color: "orange",
    },
    strong: {
        color: "green",
    },
    goBack: {
        alignItems: "center",
        marginTop: 16,
    },
});
