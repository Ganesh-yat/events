import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    Platform,
} from 'react-native';
// import { Feather, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from "../../../constants/Colors";
import { useGlobalInfo } from '../../../context/GlobalContext';
import { API_ROUTE } from '../../../../config';
import {formatDate} from "../../../lib/utils/formatter"
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const MAX_EVENT_NAME_WIDTH = width - 130;

interface UrlItem {
    label: string;
    path: string;
}


export default function EventDashboard({ eventId }) {

    const context = useGlobalInfo();
    const navigation = useNavigation();
    const { theme } = context;
    const colors = Colors[theme];

    const id = eventId;
    const userId = context?.userId;

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [poll, setPoll] = useState({ question: '', options: [''] });
    const [imageSize, setImageSize] = useState('medium');
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: '',
        severity: 'success',
    });

    // Event Status Dropdown
    const [statusMenuVisible, setStatusMenuVisible] = useState(false);
    const [eventStatus, setEventStatus] = useState("");

    const liveCountPath = `live-count/${id}`;
    const urlList: UrlItem[] = [
        { label: "Live Count", path: liveCountPath },
        { label: "Event Feedback", path: `feedback-entry/${id}` },
        { label: "Live Poll", path: `event/${id}/polls` },
    ];

    // function formatDate(isoDate: string): string {
    //     if (!isoDate) return "";
    //     const d = new Date(isoDate);
    //     const year = d.getFullYear();
    //     const month = (d.getMonth() + 1).toString().padStart(2, "0");
    //     const day = d.getDate().toString().padStart(2, "0");
    //     return `${year}-${month}-${day}`;
    // }

    function getFullUrl(API_FRONTEND: string, path: string) {
        return `${API_FRONTEND}/${path}`;
    }

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${id}`);
                if (!res.ok) throw new Error('Event not found');
                const data = await res.json();
                setEvent(data?.data);
                setEventStatus(data?.data?.status?.toUpperCase() || "PUBLISHED");
            } catch (err) {
                setEvent(null);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({
            visible: true,
            message,
            severity,
        });
        setTimeout(() => setSnackbar({ visible: false, message: '', severity: 'success' }), 3500);
    };

    const handlePollChange = (index, value) => {
        const newOptions = [...poll.options];
        newOptions[index] = value;
        setPoll({ ...poll, options: newOptions });
    };

    const addPollOption = () => {
        setPoll({ ...poll, options: [...poll.options, ''] });
    };

    const getImageHeight = () => {
        switch (imageSize) {
            case 'small': return 150;
            case 'large': return 350;
            default: return 250;
        }
    };

    const handleEditEvent = () => {
        navigation.navigate('CreateEvent', { event: event });
    };

    const handleDeleteEvent = async () => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${id}`, {
                                method: 'DELETE',
                            });
                            if (res.ok) {
                                showSnackbar('Event deleted!', 'success');
                                setTimeout(() => navigation.navigate("DashboardMain"), 1000);
                            } else {
                                throw new Error('Failed to delete event');
                            }
                        } catch (err: any) {
                            showSnackbar(err.message || 'Failed to delete event', 'error');
                        }
                    }
                }
            ]
        );
    };

    const handlePollSubmit = async () => {
        const validOptions = poll.options.filter(opt => opt.trim() !== '');
        if (!poll.question.trim()) {
            showSnackbar('Poll question cannot be empty', 'error');
            return;
        }
        if (validOptions.length < 2) {
            showSnackbar('Please add at least two poll options.', 'error');
            return;
        }
        try {
            const payload = {
                event: id,
                question: poll.question.trim(),
                options: validOptions,
                userId,
            };
            const res = await fetch(`${API_ROUTE}/api/v1/event/poll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                showSnackbar('Poll created successfully!', 'success');
                setModalOpen(false);
                setPoll({ question: '', options: [''] });
            } else {
                throw new Error('Failed to create poll');
            }
        } catch (err: any) {
            showSnackbar(err.message, 'error');
        }
    };

    if (loading) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    if (!event) {
        return (
            <View style={[styles.centeredContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.notFoundTitle, { color: colors.text }]}>Event Not Found</Text>
                <Text style={[styles.notFoundText, { color: colors.secondaryText }]}>
                    The event you're looking for doesn't exist or has been removed.
                </Text>
            </View>
        );
    }

    const updateEventStatus = async (newStatus) => {
        try {
            const res = await fetch(`${API_ROUTE}/api/v1/event/eventid/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            setEventStatus(newStatus);
            showSnackbar(`Event status updated to ${newStatus}`, 'success');
        } catch (err: any) {
            showSnackbar(err.message || 'Failed to update status', 'error');
        }
    };

    // Status dropdown: create your own menu
    const renderStatusDropdown = () => (
        <View style={{ position: 'absolute', top: 36, right: 0, backgroundColor: colors.card, borderRadius: 8, zIndex: 10, elevation: 2 }}>
            {["PUBLISHED", "PAUSED", "CANCELLED"].map((status) => (
                <TouchableOpacity
                    key={status}
                    onPress={async () => {
                        setStatusMenuVisible(false);
                        if (status !== eventStatus) {
                            await updateEventStatus(status);
                        }
                    }}
                    style={{ padding: 10, minWidth: 100, flexDirection: 'row', alignItems: 'center' }}
                >
                    {/* {eventStatus === status && <MaterialIcons name="check" size={16} color={colors.button} style={{ marginRight: 4 }} />} */}
                    <Text style={{ color: colors.text, fontWeight: eventStatus === status ? 'bold' : 'normal' }}>{status}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Simple Snackbar (no react-native-paper)
    const Snackbar = () => {
        if (!snackbar.visible) return null;
        return (
            <View style={[
                styles.snackbar,
                {
                    backgroundColor: snackbar.severity === "success" ? colors.button : "#e53935",
                    bottom: 40,
                }
            ]}>
                <Text style={{ color: colors.buttonText, textAlign: "center" }}>{snackbar.message}</Text>
            </View>
        );
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
                    {/* Event Name & Status Dropdown */}
                    <View style={styles.headerRow}>
                        <Text
                            style={[
                                styles.eventName,
                                { color: colors.button, maxWidth: MAX_EVENT_NAME_WIDTH }
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {event?.name || "Event Dashboard"}
                        </Text>
                        <View style={{ position: 'relative' }}>
                            <TouchableOpacity
                                style={[
                                    styles.statusDropdown,
                                    {
                                        backgroundColor:
                                            eventStatus === "PUBLISHED"
                                                ? "#419B01"
                                                : eventStatus === "PAUSED"
                                                    ? "#FFA500"
                                                    : "#E53935"
                                    }
                                ]}
                                onPress={() => setStatusMenuVisible(!statusMenuVisible)}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                                    <Text style={styles.statusDropdownText}>{eventStatus}</Text>
                                    {/* <MaterialIcons
                                    name={statusMenuVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                    size={20}
                                    color="#fff"
                                    style={{ marginLeft: 2 }}
                                /> */}
                                </View>
                            </TouchableOpacity>
                            {statusMenuVisible && renderStatusDropdown()}
                        </View>
                    </View>

                    <View>
                        <Image
                            source={{ uri: event?.cover_image }}
                            style={[styles.coverImage, { height: getImageHeight() }]}
                            resizeMode="cover"
                        />
                        <Text style={[styles.note, { color: "#C11215" }]}>Please enter a picture of size 1280 x 720 px</Text>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={handleEditEvent}
                        >
                            {/* <MaterialIcons name="edit" size={24} color={colors.button} /> */}
                            <Text style={[styles.actionText, { color: colors.button }]}>Edit Event</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={handleDeleteEvent}
                        >
                            {/* <Feather name="trash-2" size={24} color="#E53935" /> */}

                            <Text style={[styles.actionText, { color: '#E53935' }]}>Delete Event</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Event URLs */}
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        {urlList.map(({ label, path }) => {
                            return (
                                <View key={label} style={styles.urlRow}>
                                    <Text style={[styles.urlLabel, { color: colors.text }]}>
                                        {label} URL
                                    </Text>
                                    <Text
                                        style={[styles.urlValue, { color: colors.button }]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {getFullUrl(API_ROUTE, path)}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Event Logo */}
                    <View style={styles.logoContainer}>
                        <Text style={[styles.sectionTitle, { fontSize: 18, color: colors.button }]}>Event Logo</Text>
                        <Image
                            source={{ uri: event?.logo_image }}
                            style={styles.logoImage}
                        />
                    </View>

                    {/* Event Description */}
                    <Text style={[styles.sectionTitle, { color: colors.button }]}>EVENT DESCRIPTION</Text>
                    <Text style={{ color: colors.text, marginBottom: 20 }}>{event.description}</Text>

                    {/* Event Info */}
                    <Text style={[styles.sectionTitle, { color: colors.button }]}>EVENT OVERVIEW</Text>
                    <View style={styles.overviewRow}>
                        <Text style={{ color: colors.text }}>📍 {event.location || "Location not provided"}</Text>
                    </View>
                    <View style={styles.overviewRow}>
                        <Text style={{ color: colors.text }}>📅 {formatDate(event.start_date)} - {formatDate(event.start_date)}</Text>
                    </View>
                    <View style={styles.overviewRow}>
                        <Text style={{ color: colors.text }}>⏰ {event.start_time} - {event.end_time}</Text>
                    </View>

                    {/* Event Images Carousel */}
                    {event?.event_images && event.event_images.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: colors.button }]}>EVENT PHOTOS</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.carouselContainer}
                            >
                                {event.event_images.map((img, idx) => (
                                    <Image
                                        key={idx}
                                        source={{ uri: img }}
                                        style={styles.carouselImage}
                                        resizeMode="cover"
                                    />
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Poll Modal */}
                    <Modal
                        transparent
                        visible={modalOpen}
                        animationType="slide"
                        onRequestClose={() => setModalOpen(false)}
                    >
                        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay || "rgba(0,0,0,0.5)" }]}>
                            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Create a Poll</Text>
                                <TextInput
                                    value={poll.question}
                                    onChangeText={(text) => setPoll({ ...poll, question: text })}
                                    placeholder="Enter your question"
                                    placeholderTextColor={colors.secondaryText}
                                    style={[styles.input, { backgroundColor: colors.dropdownBackground, borderColor: colors.secondaryText, color: colors.text }]}
                                />
                                {poll.options.map((option, idx) => (
                                    <TextInput
                                        key={idx}
                                        value={option}
                                        onChangeText={(text) => handlePollChange(idx, text)}
                                        placeholder={`Option ${idx + 1}`}
                                        placeholderTextColor={colors.secondaryText}
                                        style={[styles.input, { backgroundColor: colors.dropdownBackground, borderColor: colors.secondaryText, color: colors.text }]}
                                    />
                                ))}
                                <TouchableOpacity onPress={addPollOption}>
                                    <Text style={[styles.addOption, { color: colors.button }]}>+ Add Option</Text>
                                </TouchableOpacity>
                                <View style={styles.modalButtonRow}>
                                    <TouchableOpacity
                                        onPress={() => setModalOpen(false)}
                                        style={[styles.modalBtn, { borderColor: colors.button, backgroundColor: "#fff" }]}
                                    >
                                        <Text style={{ color: colors.button }}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handlePollSubmit}
                                        style={[styles.modalBtn, {
                                            backgroundColor: (!poll.question.trim() || poll.options.filter(o => o.trim()).length < 2)
                                                ? colors.secondaryText : colors.button
                                        }]}
                                        disabled={!poll.question.trim() || poll.options.filter(o => o.trim()).length < 2}
                                    >
                                        <Text style={{ color: colors.buttonText }}>Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Snackbar />
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        // minHeight: 700,
        flex: 1,
        padding: 16,
        paddingVertical: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notFoundTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    notFoundText: {
        fontSize: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        marginBottom: 12,
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        flexShrink: 1,
    },
    statusDropdown: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 18,
        minWidth: 90,
        alignItems: "center",
        justifyContent: "center",
    },
    statusDropdownText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 13,
        textAlign: "center",
        marginRight: 2,
    },
    note: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
    },
    coverImage: {
        width: '100%',
        borderRadius: 8,
        marginBottom: 8,
    },
    logoContainer: {
        flexDirection: "row",
        gap: 80,
        alignItems: "baseline",
        marginVertical: 16,
    },
    logoImage: {
        width: 76,
        height: 76,
        borderRadius: 38,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    urlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    urlLabel: {
        fontWeight: '600',
        width: '35%',
    },
    urlValue: {
        flex: 1,
        textDecorationLine: 'underline',
    },
    card: {
        borderRadius: 12,
        padding: 14,
        marginVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 2,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 16,
        marginBottom: 18,
    },
    actionItem: {
        flexDirection: "row",
        gap: 10,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 15,
        fontWeight: "600"
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 8,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
    },
    addOption: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    modalButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 10,
    },
    modalBtn: {
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 18,
        marginLeft: 8,
        borderWidth: 1,
    },
    snackbar: {
        position: "absolute",
        left: 24,
        right: 24,
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 8,
        elevation: 4,
        zIndex: 999,
    },
    carouselContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    carouselImage: {
        width: 180,
        height: 200,
        borderRadius: 8,
        marginRight: 10,
    },
});
