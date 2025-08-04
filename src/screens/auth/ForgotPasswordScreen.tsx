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

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { theme } = useGlobalInfo();

    const handleSubmit = async () => {
        setError("");
        setMessage("");

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Invalid email address");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("https://your-api.com/api/send-reset-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("OTP sent successfully!");
                setTimeout(() => {
                    navigation.navigate("OtpScreen");
                }, 1000);
            } else {
                setError(data.message || "Failed to send OTP.");
            }
        } catch (err) {
            setError("Server error. Try again.");
        } finally {
            setLoading(false);
        }
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

                <Text style={[styles.title, { color: Colors[theme].text }]}>Forgot your password?</Text>
                <Text style={[styles.subtitle, { color: Colors[theme].secondaryText }]}>
                    Enter your email to receive an OTP.
                </Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}
                {message ? <Text style={styles.success}>{message}</Text> : null}

                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: Colors[theme].dropdownBackground,
                            borderColor: Colors[theme].secondaryText,
                            color: Colors[theme].text,
                        },
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors[theme].secondaryText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: Colors[theme].button,
                            opacity: loading ? 0.7 : 1,
                        },
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ActivityIndicator size="small" color={Colors[theme].buttonText} style={{ marginRight: 8 }} />
                            <Text style={[styles.buttonText, { color: Colors[theme].buttonText }]}>Sending...</Text>
                        </View>
                    ) : (
                        <Text style={[styles.buttonText, { color: Colors[theme].buttonText }]}>Send OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.goBack}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={{ color: Colors[theme].button, fontWeight: "bold" }}>
                        Back to Login
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
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: "center",
        marginTop: 8,
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
    goBack: {
        alignItems: "center",
        marginTop: 16,
    },
});
