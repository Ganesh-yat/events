// import React from "react";
// import { View, Text, StyleSheet } from "react-native";

// export default function TicketRegistrationForm() {
//     return (
//         <View style={styles.container}>
//             <Text>TicketRegistrationForm</Text>
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


// import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useGlobalInfo } from "../../context/GlobalContext";
import { API_ROUTE } from "../../../config";
import { useAuthenticatedApi } from "../../lib/Services/api";

type Tier = {
    name: string;
    description: string;
    price: number | string;
    capacity: number | string;
    perks: string;
};

function Snackbar({ visible, message, error, onDismiss, colors }: any) {
    // Simple fade-in/out animation for Snackbar
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }).start();

            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 180,
                    useNativeDriver: true,
                }).start(() => onDismiss && onDismiss());
            }, 2200);
            return () => clearTimeout(timer);
        } else {
            fadeAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;
    return (
        <Animated.View
            style={[
                styles.snackbar,
                {
                    backgroundColor: error ? colors.cancelButton : colors.button,
                    opacity: fadeAnim,
                }
            ]}
        >
            <Text style={{ color: colors.buttonText }}>{message}</Text>
        </Animated.View>
    );
}

export default function TicketRegistrationForm({ eventName = "Event" }) {
    const { event: eventId, theme, token } = useGlobalInfo();
    const colors = Colors[theme];

    const [tiers, setTiers] = useState<Tier[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });

    useEffect(() => {
        if (!eventId) return;
        setLoading(true);
        
        // Create authenticated fetch
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        fetch(`${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`, {
            headers,
        })
            .then((r) => {
                if (!r.ok) throw new Error("Failed to fetch tiers");
                return r.json();
            })
            .then((json) => {
                const existing = json.data.ticket_tiers;
                setTiers(existing && existing.length
                    ? existing
                    : [{ name: "", description: "", price: "", capacity: "", perks: "" }]
                );
            })
            .catch(() => {
                setTiers([{ name: "", description: "", price: "", capacity: "", perks: "" }]);
                setSnackbar({ visible: true, message: "Failed to load ticket tiers.", error: true });
            })
            .finally(() => setLoading(false));
    }, [eventId, token]);

    // Handlers
    const handleTierChange = (idx: number, field: keyof Tier, val: string) => {
        const copy = [...tiers];
        copy[idx][field] =
            field === "price" || field === "capacity"
                ? (val === "" ? "" : Number(val))
                : val;
        setTiers(copy);
    };

    const handleAddTier = () =>
        setTiers([...tiers, { name: "", description: "", price: "", capacity: "", perks: "" }]);

    const handleRemoveTier = (idx: number) => setTiers(tiers.filter((_, i) => i !== idx));

    const validate = () => {
        const errs: { [key: string]: string } = {};
        tiers.forEach((t, i) => {
            if (!t.name) errs[`name${i}`] = "Name is required";
            if (typeof t.price !== "number" || t.price < 0) errs[`price${i}`] = "Valid price required";
            if (typeof t.capacity !== "number" || t.capacity < 1)
                errs[`capacity${i}`] = "Valid capacity required";
        });
        setErrors(errs);
        return !Object.keys(errs).length;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        const payload = tiers.map((t) => ({
            name: t.name,
            description: t.description,
            price: t.price,
            capacity: t.capacity,
            perks: typeof t.perks === 'string'
                ? t.perks.split(",").map((p) => p.trim()).filter(Boolean)
                : t.perks,
        }));
        try {
            // Create authenticated headers
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(
                `${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`,
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({ ticket_tiers: payload }),
                }
            );
            if (!res.ok) throw new Error(await res.text());
            setIsEditing(false);
            setSnackbar({ visible: true, message: "Tiers saved.", error: false });
        } catch (err: any) {
            setSnackbar({ visible: true, message: "Error saving: " + err.message, error: true });
        }
        setLoading(false);
    };

    // For table layout in RN, use flex row with fixed minWidths for cells
    const cellStyle = (width = 90) => ({
        minWidth: width,
        paddingVertical: 6,
        paddingHorizontal: 3,
        flexGrow: 1,
    });

    return (
        <KeyboardAvoidingView
            style={{ backgroundColor: colors.background }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={{
                    padding: 18,
                    backgroundColor: colors.background,
                    minHeight: 320,
                }}
                keyboardShouldPersistTaps="handled"
            >
                {/* VIEW MODE */}
                {!isEditing ? (
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[styles.heading, { color: colors.text }]}>
                            Ticket tiers for event{" "}
                            <Text style={{ fontWeight: "bold", color: colors.button }}>{eventName}</Text>
                        </Text>
                        <View style={{ borderTopWidth: 1, borderColor: colors.dropdownBackground, marginVertical: 12 }} />
                        {/* Table Header */}
                        <View style={[styles.tableHeaderRow, { borderColor: colors.dropdownBackground }]}>
                            {["Name", "Description", "Price", "Capacity", "Perks"].map((h, i) => (
                                <Text
                                    key={h}
                                    style={[
                                        styles.tableHeader,
                                        cellStyle(i === 1 ? 120 : 90),
                                        { color: colors.secondaryText }
                                    ]}
                                >
                                    {h}
                                </Text>
                            ))}
                        </View>
                        {/* Table Rows */}
                        {tiers.map((t, i) => (
                            <View key={i} style={[styles.tableRow, { borderColor: colors.dropdownBackground }]}>
                                <Text style={[styles.tableCell, cellStyle(), { color: colors.text }]}>{t.name}</Text>
                                <Text style={[styles.tableCell, cellStyle(120), { color: colors.secondaryText }]}>{t.description || "—"}</Text>
                                <Text style={[styles.tableCell, cellStyle(), { color: colors.text }]}>{t.price}</Text>
                                <Text style={[styles.tableCell, cellStyle(), { color: colors.text }]}>{t.capacity}</Text>
                                <Text style={[styles.tableCell, cellStyle(130), { color: colors.text }]}>
                                    {Array.isArray(t.perks) ? t.perks.join(", ") : t.perks}
                                </Text>
                            </View>
                        ))}
                        {/* Button */}
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
                            <TouchableOpacity
                                onPress={() => setIsEditing(true)}
                                style={[
                                    styles.paperBtn,
                                    { backgroundColor: colors.button, borderRadius: 8 }
                                ]}
                                disabled={loading}
                            >
                                <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 16 }}>
                                    Add / Edit Ticket Tiers
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // EDIT MODE
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <Text style={[styles.heading, { color: colors.text }]}>
                            Editing tiers for event{" "}
                            <Text style={{ fontWeight: "bold", color: colors.button }}>{eventName}</Text>
                        </Text>
                        <View style={{ borderTopWidth: 1, borderColor: colors.dropdownBackground, marginVertical: 12 }} />
                        {tiers.map((tier, idx) => (
                            <View key={idx} style={[styles.tierEditBox, { borderColor: colors.dropdownBackground }]}>
                                <View style={styles.editRow}>
                                    <Text style={{ fontWeight: "500", color: colors.button }}>
                                        Tier #{idx + 1}
                                    </Text>
                                    {tiers.length > 1 && (
                                        <TouchableOpacity onPress={() => handleRemoveTier(idx)} style={{ marginLeft: 8 }}>
                                            {/* <Ionicons name="trash-outline" size={20} color={colors.cancelButton} /> */}
                                        </TouchableOpacity>
                                    )}
                                </View>
                                {/* Row 1: Name, Description, Price */}
                                <View style={styles.editGrid}>
                                    <TextInput
                                        placeholder="Name"
                                        placeholderTextColor={colors.secondaryText}
                                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.dropdownBackground }]}
                                        value={tier.name}
                                        onChangeText={(v) => handleTierChange(idx, "name", v)}
                                    />
                                    <TextInput
                                        placeholder="Description"
                                        placeholderTextColor={colors.secondaryText}
                                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.dropdownBackground }]}
                                        value={tier.description}
                                        onChangeText={(v) => handleTierChange(idx, "description", v)}
                                    />
                                    <TextInput
                                        placeholder="Price"
                                        placeholderTextColor={colors.secondaryText}
                                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.dropdownBackground }]}
                                        value={tier.price ? String(tier.price) : ""}
                                        keyboardType="numeric"
                                        onChangeText={(v) => handleTierChange(idx, "price", v)}
                                    />
                                </View>
                                {/* Row 2: Capacity, Perks */}
                                <View style={styles.editGrid}>
                                    <TextInput
                                        placeholder="Capacity"
                                        placeholderTextColor={colors.secondaryText}
                                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.dropdownBackground }]}
                                        value={tier.capacity ? String(tier.capacity) : ""}
                                        keyboardType="numeric"
                                        onChangeText={(v) => handleTierChange(idx, "capacity", v)}
                                    />
                                    <TextInput
                                        placeholder="Perks (comma-separated)"
                                        placeholderTextColor={colors.secondaryText}
                                        style={[styles.inputSmall, { color: colors.text, borderColor: colors.dropdownBackground }]}
                                        value={tier.perks}
                                        onChangeText={(v) => handleTierChange(idx, "perks", v)}
                                    />
                                </View>
                                {/* Errors */}
                                {["name", "price", "capacity"].map(field =>
                                    errors[`${field}${idx}`] ? (
                                        <Text key={field} style={styles.errorText}>{errors[`${field}${idx}`]}</Text>
                                    ) : null
                                )}
                            </View>
                        ))}
                        {/* Bottom Buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <TouchableOpacity style={styles.addTierBtn} onPress={handleAddTier}>
                                <Text style={{ color: colors.button, fontWeight: "bold" }}>+ Add another tier</Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: "row" }}>
                                <TouchableOpacity
                                    style={[styles.cancelBtn, { borderColor: colors.cancelButton }]}
                                    onPress={() => setIsEditing(false)}
                                >
                                    <Text style={{ color: colors.cancelButtonText, fontWeight: "bold" }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: colors.button }]}
                                    onPress={handleSubmit}
                                    disabled={loading}
                                >
                                    <Text style={{ color: colors.buttonText, fontWeight: "bold" }}>
                                        {loading ? "Saving..." : "Save Tiers"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                <Snackbar
                    visible={snackbar.visible}
                    onDismiss={() => setSnackbar(s => ({ ...s, visible: false }))}
                    message={snackbar.message}
                    error={snackbar.error}
                    colors={colors}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 18,
        borderRadius: 10,
        marginVertical: 14,
        elevation: 2,
    },
    heading: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    tableHeaderRow: {
        flexDirection: "row",
        alignItems: 'center',
        marginBottom: 0,
        borderBottomWidth: 1,
        backgroundColor: "transparent",
    },
    tableHeader: {
        fontWeight: "bold",
        fontSize: 15,
        borderBottomWidth: 0,
        paddingBottom: 8,
        paddingHorizontal: 4,
    },
    tableRow: {
        flexDirection: "row",
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    tableCell: {
        fontSize: 14,
        paddingHorizontal: 4,
    },
    tierEditBox: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 18,
    },
    editRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    editGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        gap: 10,
        marginBottom: 4,
    },
    inputSmall: {
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        marginBottom: 5,
        minWidth: 140,
        flexGrow: 1,
        fontSize: 15,
        marginRight: 8,
    },
    addTierBtn: {
        alignItems: "flex-start",
        paddingLeft: 2,
    },
    cancelBtn: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 12,
        marginLeft: 12,
    },
    saveBtn: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 18,
    },
    errorText: {
        color: "#E53935",
        fontSize: 12,
        marginBottom: 4,
        marginTop: -2,
    },
    paperBtn: {
        paddingVertical: 12,
        paddingHorizontal: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    snackbar: {
        position: 'absolute',
        bottom: 36,
        left: 24,
        right: 24,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        zIndex: 100,
        elevation: 4,
    }
});
