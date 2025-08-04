import React, { useEffect, useState } from "react";
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../constants/Colors";
import { useGlobalInfo } from "../../context/GlobalContext";
import { API_ROUTE } from "../../../config";
import { uploadToCloudinary } from "../../lib/utils/cloudinary";
import { formatDate, formatTime } from "../../lib/utils/formatter";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainAppStackParamList } from "../../navigation/MainAppNavigator";

// --- Helper functions, there in the formatter.ts---
// function formatDate(input) {
//     if (!input) return "";
//     const date = typeof input === "string" ? new Date(input) : input;
//     return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
//         date.getDate()
//     ).padStart(2, "0")}`;
// }

// function formatTime(date) {
//     if (!date) return "";
//     return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
// }

type Props = NativeStackScreenProps<MainAppStackParamList, "CreateEvent">;

export default function CreateEvent({ route }: Props) {
    const { theme, userId, event = route } = useGlobalInfo();
    const colors = Colors[theme];
    const navigation = useNavigation();

    const [formData, setFormData] = useState({
        name: "",
        start_date: null,
        end_date: null,
        start_time: null,
        end_time: null,
        user: userId,
        location: "",
        description: "",
        cover_image: null,
        logo_image: null,
        event_images: [],
        // public_event: true,
        food_tracking: true,
        gift_tracking: true,
    });

    const [pickerMode, setPickerMode] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());
    const [iosPickerVisible, setIosPickerVisible] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, message: "", color: "red" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [originalEventData, setOriginalEventData] = useState(null);
    const isEditTitle = !!event;
    const screenTitle = isEditTitle ? "Update Event" : "Create Event";

    useEffect(() => {
        const fetchEvent = async () => {
            if (event) {
                try {
                    const id = event;
                    const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${id}`);
                    if (!res.ok) throw new Error("Failed to fetch event data");
                    const resData = await res.json();
                    const data = resData?.data;
                    const mappedData = {
                        name: data?.name || "",
                        start_date: data?.start_date ? new Date(data.start_date) : null,
                        start_time: data?.start_time
                            ? (() => {
                                if (typeof data.start_time === "string") {
                                    const [hours, minutes] = data.start_time.split(":");
                                    const d = new Date();
                                    d.setHours(Number(hours));
                                    d.setMinutes(Number(minutes));
                                    d.setSeconds(0);
                                    d.setMilliseconds(0);
                                    return d;
                                }
                                return new Date(data.start_time);
                            })()
                            : null,
                        end_time: data?.end_time
                            ? (() => {
                                if (typeof data.end_time === "string") {
                                    const [hours, minutes] = data.end_time.split(":");
                                    const d = new Date();
                                    d.setHours(Number(hours));
                                    d.setMinutes(Number(minutes));
                                    d.setSeconds(0);
                                    d.setMilliseconds(0);
                                    return d;
                                }
                                return new Date(data.end_time);
                            })()
                            : null,
                        end_date: data?.end_date ? new Date(data.end_date) : null,
                        user: userId,
                        location: data?.location || "",
                        description: data?.description || "",
                        cover_image: data?.cover_image ? { uri: data.cover_image, url: data.cover_image } : null,
                        logo_image: data?.logo_image ? { uri: data.logo_image, url: data.logo_image } : null,
                        event_images: data?.event_images ? data.event_images.map(img => ({ uri: img, url: img })) : [],
                        // public_event: typeof data?.public_event === "boolean" ? data.public_event : true,
                        food_tracking: typeof data?.food_tracking === "boolean" ? data.food_tracking : true,
                        gift_tracking: typeof data?.gift_tracking === "boolean" ? data.gift_tracking : true,
                    };
                    setFormData(mappedData);
                    setOriginalEventData(mappedData);
                } catch (e) {
                    setSnackbar({ visible: true, message: "Unable to fetch event details", color: "red" });
                }
            }
        };
        fetchEvent();
    }, []);

    // --- Validation of the input fields  ---
    const validateField = (name, value) => {
        let err = "";
        switch (name) {
            case "name":
                if (!value) err = "Event name is required";
                break;
            case "location":
                if (!value) err = "Location is required";
                break;
            case "description":
                if (!value) err = "Description is required";
                break;
            case "cover_image":
                if (!value) err = "Cover image is required";
                break;
            case "logo_image":
                if (!value) err = "Logo image is required";
                break;
            case "start_date":
                if (!value) err = "Start date is required";
                break;
            case "end_date":
                if (!value) err = "End date is required";
                else if (formData.start_date && new Date(value) < new Date(formData.start_date))
                    err = "End date must be after or same as start date";
                break;
            case "start_time":
                if (!value) err = "Start time is required";
                break;
            case "end_time":
                if (!value) err = "End time is required";
                else if (
                    formData.start_date && formData.end_date &&
                    formatDate(formData.start_date) === formatDate(formData.end_date) &&
                    formData.start_time && value &&
                    new Date(`1970-01-01T${formatTime(value)}`) <= new Date(`1970-01-01T${formatTime(formData.start_time)}`)
                ) {
                    err = "End time must be after start time";
                }
                break;
        }
        return err;
    };

    // const handleChange = (name, value) => {
    //     setFormData((prev) => ({ ...prev, [name]: value }));
    //     setErrors((prev) => ({
    //         ...prev,
    //         [name]: validateField(name, value),
    //         ...(name === "start_date" || name === "end_date" ? {
    //             end_date: validateField("end_date", name === "end_date" ? value : formData.end_date)
    //         } : {}),
    //         ...(name === "start_time" || name === "end_time" ? {
    //             end_time: validateField("end_time", name === "end_time" ? value : formData.end_time)
    //         } : {})
    //     }));
    // };

    // --- Image picker and replacement ---
    const handleImagePick = async (key, multiple = false) => {
        launchImageLibrary(
            {
                mediaType: "photo",
                selectionLimit: multiple ? 0 : 1,
                quality: 0.7,
            },
            (response) => {
                if (response.didCancel || !response.assets) return;
                const selectedImages = multiple ? response.assets : [response.assets[0]];
                if (key === "event_images") {
                    setFormData((prev: any) => ({
                        ...prev,
                        event_images: [...prev.event_images, ...selectedImages],
                    }));
                } else {
                    setFormData((prev) => ({ ...prev, [key]: selectedImages[0] }));
                }
            }
        );
    };

    // --- Date/time picker logic ---
    const showDatePicker = (field) => {
        const initialDate = formData[field] ? new Date(formData[field]) : new Date();
        setPickerMode(field);
        setTempDate(initialDate);
        if (Platform.OS === "ios") {
            setIosPickerVisible(true);
        } else {
            setShowPicker(true);
        }
    };

    const onDateTimeChange = (_event, selectedDate) => {
        if (Platform.OS === "android") {
            setShowPicker(false);
            if (selectedDate && pickerMode) handleChange(pickerMode, selectedDate);
        } else {
            if (selectedDate) setTempDate(selectedDate);
        }
    };

    const handleIOSPickerDone = () => {
        if (pickerMode) {
            handleChange(pickerMode, tempDate);
            setIosPickerVisible(false);
        }
    };

    const handleRemoveEventImage = (indexToRemove) => {
        setFormData((prev) => ({
            ...prev,
            event_images: prev.event_images.filter((_, i) => i !== indexToRemove)
        }));
    };

    // --- Submission logic ---
    const handleCreateEvent = async (payload, isEdit = false, eventId = null) => {
        console.log(payload, isEdit, eventId, userId, "event")
        const url = isEdit && eventId
            ? `${API_ROUTE}/api/v1/event/${userId}/${eventId}`
            : `${API_ROUTE}/api/v1/event`;
        const method = isEdit ? "PATCH" : "POST";
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(isEdit ? "Event update failed" : "Event creation failed");
        const data = await response.json();
        return data;
    };

    const buildPatchPayload = () => {
        if (!originalEventData) return formData;

        const patch = {};

        Object.keys(formData).forEach((key) => {
            if (key === "cover_image" || key === "logo_image") {
                const oldUrl = originalEventData[key]?.url || originalEventData[key]?.uri || "";
                const newUrl = formData[key]?.url || formData[key]?.uri || "";
                if (oldUrl !== newUrl) patch[key] = formData[key];
                return;
            }

            if (key === "event_images") {
                const oldArr = (originalEventData[key] || []).map(img => img?.url || img?.uri).sort();
                const newArr = (formData[key] || []).map(img => img?.url || img?.uri).sort();
                if (JSON.stringify(oldArr) !== JSON.stringify(newArr)) {
                    patch[key] = formData[key];
                }
                return;
            }

            if (key === "start_date" || key === "end_date") {
                const oldDate = originalEventData[key] ? formatDate(originalEventData[key]) : "";
                const newDate = formData[key] ? formatDate(formData[key]) : "";
                if (oldDate !== newDate) patch[key] = formData[key];
                return;
            }

            if (key === "start_time" || key === "end_time") {
                const oldTime = originalEventData[key] ? formatTime(originalEventData[key]) : "";
                const newTime = formData[key] ? formatTime(formData[key]) : "";
                if (oldTime !== newTime) patch[key] = formData[key];
                return;
            }

            if (formData[key] !== originalEventData[key]) {
                patch[key] = formData[key];
            }
        });

        if (patch.start_date) patch.start_date = formatDate(formData.start_date);
        if (patch.end_date) patch.end_date = formatDate(formData.end_date);
        if (patch.start_time) patch.start_time = formatTime(formData.start_time);
        if (patch.end_time) patch.end_time = formatTime(formData.end_time);
        console.log("patch", patch);
        return patch;
    };


    const handleSubmit = async () => {
        const mandatoryFields = [
            "name", "location", "description", "cover_image",
            "logo_image", "start_date", "end_date", "start_time", "end_time",
        ];
        const missingFields = mandatoryFields.filter((field) => !formData[field]);
        if (missingFields.length > 0) {
            setSnackbar({
                visible: true,
                message: `Please fill in all required fields: ${missingFields.join(", ")}`,
                color: "red",
            });
            return;
        }

        try {
            setSnackbar({ visible: true, message: "Uploading images...", color: "blue" });
            if (formData.cover_image?.uri && !formData.cover_image?.url) {
                const [uploadedCover] = await uploadToCloudinary([
                    { uri: formData.cover_image.uri, name: "cover.jpg", type: "image/jpeg" },
                ]);
                formData.cover_image = uploadedCover;
            }
            if (formData.logo_image?.uri && !formData.logo_image?.url) {
                const [uploadedLogo] = await uploadToCloudinary([
                    { uri: formData.logo_image.uri, name: "logo.jpg", type: "image/jpeg" },
                ]);
                formData.logo_image = uploadedLogo;
            }
            if (formData.event_images.length > 0) {
                const imagesToUpload = formData.event_images.filter(img => !img.url);
                if (imagesToUpload.length) {
                    const imageFiles = imagesToUpload.map((img, idx) => ({
                        uri: img.uri, name: `event_${idx}.jpg`, type: "image/jpeg",
                    }));
                    const uploadedImages = await uploadToCloudinary(imageFiles);
                    // Merge old and new
                    formData.event_images = [
                        ...formData.event_images.filter(img => img.url),
                        ...uploadedImages,
                    ];
                }
            }

            setSnackbar({ visible: true, message: "Creating event...", color: "blue" });
            const isEdit = !!event;
            const eventId = event || null;

            let payload = isEdit ? buildPatchPayload() : {
                ...formData,
                cover_image: formData.cover_image,
                logo_image: formData.logo_image,
                event_images: formData.event_images,
                start_date: formatDate(formData.start_date),
                end_date: formatDate(formData.end_date),
                start_time: formatTime(formData.start_time),
                end_time: formatTime(formData.end_time),
            };
            if (isEdit) {
                delete payload._id;
                delete payload.id;
            }
            console.log("form data ", payload);
            const response = await handleCreateEvent(payload, isEdit, eventId);
            if (response.success) {
                setSnackbar({ visible: true, message: "Event created successfully!", color: "green" });
                setTimeout(() => navigation.replace("Dashboard"), 1500);
            } else {
                throw new Error(response.message || "Event creation failed.");
            }
        } catch (error) {
            setSnackbar({ visible: true, message: error.message, color: "red" });
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    // --- Dismiss snackbar automatically ---
    useEffect(() => {
        if (snackbar.visible) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, visible: false })), 2800);
            return () => clearTimeout(timer);
        }
    }, [snackbar.visible]);

    // --- Main UI ---
    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ paddingBottom: 32 }}
        >
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                    style={{ paddingBottom: 20, minWidth: 40, alignItems: 'center' }}
                >
                    <Text style={{ color: colors.button, fontSize: 26 ,lineHeight:32}}>←</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={[styles.heading, { color: colors.button, textAlign: "center" }]}>
                        {screenTitle}
                    </Text>
                </View>
                <View style={{ minWidth: 40 }} />
            </View>


            <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.secondaryText }]}
                placeholder="Event Name *"
                placeholderTextColor={colors.secondaryText}
                value={formData.name}
                onChangeText={text => handleChange("name", text)}
            />
            {errors.name && <Text style={{ color: "red", marginBottom: 6 }}>{errors.name}</Text>}

            <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.secondaryText }]}
                placeholder="Location *"
                placeholderTextColor={colors.secondaryText}
                value={formData.location}
                onChangeText={text => handleChange("location", text)}
            />
            {errors.location && <Text style={{ color: "red", marginBottom: 6 }}>{errors.location}</Text>}

            <TextInput
                style={[styles.input, styles.textArea, { color: colors.text, backgroundColor: colors.card, borderColor: colors.secondaryText }]}
                placeholder="Description *"
                placeholderTextColor={colors.secondaryText}
                value={formData.description}
                onChangeText={text => handleChange("description", text)}
                multiline
            />
            {errors.description && <Text style={{ color: "red", marginBottom: 6 }}>{errors.description}</Text>}

            {/* Images */}
            <TouchableOpacity
                style={[styles.uploadBox, { borderColor: colors.secondaryText, backgroundColor: colors.dropdownBackground }]}
                onPress={() => handleImagePick("cover_image")}
            >
                <Text style={{ color: colors.text }}>Upload Cover Image *</Text>
                {formData.cover_image && (
                    <Image
                        source={{ uri: formData.cover_image.uri }}
                        style={styles.previewImage}
                    />
                )}
            </TouchableOpacity>
            {errors.cover_image && <Text style={{ color: "red", marginBottom: 6 }}>{errors.cover_image}</Text>}

            <TouchableOpacity
                style={[styles.uploadBox, { borderColor: colors.secondaryText, backgroundColor: colors.dropdownBackground }]}
                onPress={() => handleImagePick("logo_image")}
            >
                <Text style={{ color: colors.text }}>Upload Logo Image *</Text>
                {formData.logo_image && (
                    <Image
                        source={{ uri: formData.logo_image.uri }}
                        style={styles.previewImage}
                    />
                )}
            </TouchableOpacity>
            {errors.logo_image && <Text style={{ color: "red", marginBottom: 6 }}>{errors.logo_image}</Text>}

            {/* Event images */}
            <TouchableOpacity
                style={[styles.uploadBox, { borderColor: colors.secondaryText, backgroundColor: colors.dropdownBackground }]}
                onPress={() => handleImagePick("event_images", true)}
            >
                <Text style={{ color: colors.text }}>Upload Event Images</Text>
                {formData.event_images.length > 0 && (
                    <ScrollView horizontal style={{ marginTop: 8 }}>
                        {formData.event_images.map((img, index) => (
                            <View key={index} style={{ position: 'relative', marginRight: 8 }}>
                                <Image
                                    source={{ uri: img.uri }}
                                    style={styles.eventImageThumbnail}
                                />
                                <TouchableOpacity
                                    onPress={() => handleRemoveEventImage(index)}
                                    style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        zIndex: 2,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        borderRadius: 10,
                                        width: 20,
                                        height: 20,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </TouchableOpacity>

            {/* Date & Time */}
            <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.secondaryText }]}
                onPress={() => showDatePicker("start_date")}
            >
                <Text style={{ color: colors.text }}>
                    {formData.start_date
                        ? `Start Date: ${formatDate(formData.start_date)}`
                        : "Select Start Date *"}
                </Text>
            </TouchableOpacity>
            {errors.start_date && <Text style={{ color: "red", marginBottom: 6 }}>{errors.start_date}</Text>}

            <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.secondaryText }]}
                onPress={() => showDatePicker("end_date")}
            >
                <Text style={{ color: colors.text }}>
                    {formData.end_date
                        ? `End Date: ${formatDate(formData.end_date)}`
                        : "Select End Date *"}
                </Text>
            </TouchableOpacity>
            {errors.end_date && <Text style={{ color: "red", marginBottom: 6 }}>{errors.end_date}</Text>}

            <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.secondaryText }]}
                onPress={() => showDatePicker("start_time")}
            >
                <Text style={{ color: colors.text }}>
                    {formData.start_time
                        ? `Start Time: ${formatTime(formData.start_time)}`
                        : "Select Start Time *"}
                </Text>
            </TouchableOpacity>
            {errors.start_time && <Text style={{ color: "red", marginBottom: 6 }}>{errors.start_time}</Text>}

            <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.secondaryText }]}
                onPress={() => showDatePicker("end_time")}
            >
                <Text style={{ color: colors.text }}>
                    {formData.end_time
                        ? `End Time: ${formatTime(formData.end_time)}`
                        : "Select End Time *"}
                </Text>
            </TouchableOpacity>
            {errors.end_time && <Text style={{ color: "red", marginBottom: 6 }}>{errors.end_time}</Text>}

            {/* DateTime Picker */}
            {showPicker && Platform.OS === "android" && (
                <DateTimePicker
                    value={tempDate}
                    mode={pickerMode?.includes("date") ? "date" : "time"}
                    is24Hour={true}
                    display="default"
                    onChange={onDateTimeChange}
                />
            )}
            {Platform.OS === "ios" && iosPickerVisible && (
                <View style={[{ backgroundColor: colors.card, padding: 16, borderRadius: 10 }]}>
                    <DateTimePicker
                        value={tempDate}
                        mode={pickerMode.includes("date") ? "date" : "time"}
                        display="spinner"
                        onChange={onDateTimeChange}
                        style={{ height: 200 }}
                    />
                    <TouchableOpacity onPress={handleIOSPickerDone} style={[styles.submitButton, { backgroundColor: colors.button }]}>
                        <Text style={[styles.submitButtonText, { color: colors.buttonText }]}>Done</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Food Tracking */}
            <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Food Tracking *</Text>
                <Switch
                    value={formData.food_tracking}
                    onValueChange={val => handleChange("food_tracking", val)}
                    trackColor={{ false: colors.cancelButton, true: colors.button }}
                    thumbColor={formData.food_tracking ? colors.button : colors.cancelButton}
                />
            </View>

            {/* Gift Tracking */}
            <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>Gift Tracking *</Text>
                <Switch
                    value={formData.gift_tracking}
                    onValueChange={val => handleChange("gift_tracking", val)}
                    trackColor={{ false: colors.cancelButton, true: colors.button }}
                    thumbColor={formData.gift_tracking ? colors.button : colors.cancelButton}
                />
            </View>

            {/* Public / Private */}
            {/* <Text style={[styles.subHeading, { color: colors.text }]}>Event Visibility *</Text>
            <View style={styles.radioContainer}>
                {[
                    { label: "Public", value: true },
                    { label: "Private", value: false },
                ].map((option) => (
                    <TouchableOpacity
                        key={option.label}
                        style={styles.radioRow}
                        onPress={() => handleChange("public_event", option.value)}
                        activeOpacity={0.7}
                    >
                        <View
                            style={[
                                styles.radioButton,
                                {
                                    borderColor: colors.button,
                                    backgroundColor: formData.public_event === option.value ? colors.button : 'transparent'
                                },
                            ]}
                        />
                        <Text style={[styles.radioLabel, { color: colors.text }]}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View> */}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.cancelButton }]}
                    onPress={handleCancel}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.cancelButtonText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.button }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <Text style={[styles.submitButtonText, { color: colors.buttonText }]}>Loading...</Text>
                    ) : (
                        <Text style={[styles.submitButtonText, { color: colors.buttonText }]}>Submit</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Custom Snackbar */}
            {snackbar.visible && (
                <View style={[
                    styles.snackbar,
                    { backgroundColor: snackbar.color }
                ]}>
                    <Text style={{ color: "#fff", textAlign: "center" }}>{snackbar.message}</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    heading: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
    subHeading: { fontSize: 16, fontWeight: "600", marginVertical: 8 },
    input: { borderWidth: 1, padding: 12, marginBottom: 12, borderRadius: 6 },
    textArea: { height: 100 },
    eventImageThumbnail: { width: 100, height: 90, marginRight: 8, borderRadius: 6 },
    uploadBox: { borderWidth: 1, padding: 12, borderRadius: 6, marginBottom: 12, alignItems: "center" },
    previewImage: { marginTop: 8, width: 100, height: 100, borderRadius: 6 },
    switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    switchLabel: { fontSize: 16 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
    cancelButton: { flex: 1, borderWidth: 1, borderRadius: 6, paddingVertical: 12, alignItems: "center", marginRight: 8 },
    cancelButtonText: { fontWeight: "600" },
    submitButton: { flex: 1, borderRadius: 6, paddingVertical: 12, alignItems: "center", marginLeft: 8 },
    submitButtonText: { fontWeight: "bold" },
    radioContainer: { flexDirection: "row", marginBottom: 16, justifyContent: "space-around" },
    radioRow: { flexDirection: "row", alignItems: "center", marginRight: 20 },
    radioButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, marginRight: 8, justifyContent: "center", alignItems: "center" },
    radioLabel: { fontSize: 16 },
    snackbar: { position: "absolute", left: 20, right: 20, bottom: 40, padding: 12, borderRadius: 6, alignItems: "center", elevation: 4, zIndex: 100 },
});
