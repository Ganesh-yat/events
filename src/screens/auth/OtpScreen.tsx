import React, { useRef, useState } from "react";
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

export default function OtpVerify() {
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigation = useNavigation();
    const { theme } = useGlobalInfo();

    const handleChange = (value, index) => {
        const newOtp = [...otp];
        newOtp[index] = value.replace(/[^0-9]/g, "").slice(-1);
        setOtp(newOtp);

        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleSubmit = async () => {
        setError("");
        const enteredOtp = otp.join("");

        if (enteredOtp.length !== 4) {
            setError("Please enter the complete OTP");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("https://your-api.com/api/verify-reset-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp: enteredOtp }),
            });

            const data = await res.json();

            if (res.ok) {
                navigation.navigate("ResetPasswordScreen"); // Make sure this matches your navigator screen name
            } else {
                setError(data.message || "Invalid OTP");
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
                <Text style={[styles.title, { color: Colors[theme].text }]}>Enter OTP</Text>
                <Text style={[styles.subtitle, { color: Colors[theme].secondaryText }]}>
                    A 4-digit code was sent to your email.
                </Text>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[
                                styles.otpInput,
                                {
                                    borderColor: Colors[theme].secondaryText,
                                    color: Colors[theme].text,
                                    backgroundColor: Colors[theme].dropdownBackground,
                                },
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(value) => handleChange(value, index)}
                            autoFocus={index === 0}
                            editable={!loading}
                            selectTextOnFocus
                        />
                    ))}
                </View>

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
                            <Text style={[styles.buttonText, { color: Colors[theme].buttonText }]}>Verifying...</Text>
                        </View>
                    ) : (
                        <Text style={[styles.buttonText, { color: Colors[theme].buttonText }]}>Verify OTP</Text>
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

// Styles remain the same
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
    error: {
        color: "#e53935",
        marginBottom: 10,
        textAlign: "center",
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderRadius: 8,
        fontSize: 18,
        textAlign: "center",
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
    goBack: {
        alignItems: "center",
        marginTop: 16,
    },
});
