import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, FlatList, Pressable, Animated, Dimensions } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useGlobalInfo } from '../../../context/GlobalContext';
import { API_ROUTE } from '../../../../config';

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Polls() {
    const { theme, userId, event, token } = useGlobalInfo();
    const colors = Colors[theme];
    const eventId = event;

    const [polls, setPolls] = useState([]);
    const [selectedPollId, setSelectedPollId] = useState('');
    const [pollData, setPollData] = useState({ total: 0, options: [] });
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });

    // Dropdown menu state
    const [dropdownVisible, setDropdownVisible] = useState(false);

    // Snackbar (Toast) state
    const [snackbar, setSnackbar] = useState({
        visible: false,
        message: '',
        severity: 'success',
    });

    // Snackbar animation (slide up)
    const snackbarY = useState(new Animated.Value(120))[0];

    // Show snackbar function
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ visible: true, message, severity });
        Animated.timing(snackbarY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(snackbarY, {
                    toValue: 120,
                    duration: 350,
                    useNativeDriver: true,
                }).start(() => setSnackbar({ ...snackbar, visible: false }));
            }, 2600);
        });
    };

    // Fetch polls
    useEffect(() => {
        if (!eventId) return;
        let isMounted = true;
        setLoading(true);

        // Create authenticated headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        fetch(`${API_ROUTE}/api/v1/event/poll/event/${eventId}`, { headers })
            .then(res => res.json())
            .then(json => {
                console.log(json, "poollllll")
                if (!json.success) throw new Error(json.message || 'Failed to load polls');
                if (isMounted) {
                    setPolls(json.data);

                    if (json.data.length > 0) {
                        const first = json.data[0];
                        setSelectedPollId(first._id);
                        setPollData({
                            total: first.options.reduce((sum, o) => sum + o.votes, 0),
                            options: first.options,
                        });
                    }
                }
            })
            .catch(err => {
                showSnackbar(err.message, 'error');
            })
            .finally(() => setLoading(false));

        return () => { isMounted = false };
    }, [eventId]);

    // When poll changes
    const handleQuestionSelect = (pid) => {
        setSelectedPollId(pid);
        setDropdownVisible(false);
        const poll = polls.find(p => p._id === pid);
        if (poll) {
            setPollData({
                total: poll.options.reduce((sum, o) => sum + o.votes, 0),
                options: poll.options,
            });
        }
    };

    // New poll form handlers
    const handleNewQuestion = (val) =>
        setNewPoll(p => ({ ...p, question: val }));

    const handleNewOptionChange = (i, val) => {
        setNewPoll(p => {
            const opts = [...p.options];
            opts[i] = val;
            return { ...p, options: opts };
        });
    };

    const addNewOption = () =>
        setNewPoll(p => ({ ...p, options: [...p.options, ''] }));

    const handleNewSubmit = async () => {
        const valid = newPoll.options.filter(o => o.trim());
        if (!newPoll.question.trim()) {
            return showSnackbar('Question cannot be empty', 'error');
        }
        if (valid.length < 2) {
            return showSnackbar('At least two options required', 'error');
        }
        try {
            setLoading(true);
            // Create authenticated headers
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_ROUTE}/api/v1/event/poll`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    event: eventId,
                    question: newPoll.question.trim(),
                    options: valid,
                    userId,
                }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to create poll');
            }
            showSnackbar('Poll created!', 'success');
            setModalOpen(false);
            setNewPoll({ question: '', options: ['', ''] });

            // Refresh polls
            const freshRes = await fetch(
                `${API_ROUTE}/api/v1/event/poll/event/${eventId}`, { headers }
            );
            const freshJson = await freshRes.json();
            if (freshJson.success) {
                setPolls(freshJson.data);
                if (freshJson.data.length > 0) {
                    const f = freshJson.data[0];
                    setSelectedPollId(f._id);
                    setPollData({
                        total: f.options.reduce((sum, o) => sum + o.votes, 0),
                        options: f.options,
                    });
                }
            }
        } catch (err) {
            showSnackbar(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Chart data
    const chartData = Array.isArray(pollData.options)
        ? pollData.options.map(opt => ({
            label: opt.text,
            value: opt.votes,
        }))
        : [];

    return (
        <View style={[styles.root, { backgroundColor: colors.background }]}>
            {/* Loading indicator */}
            {loading && (
                <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color={colors.button} size="large" />
                    <Text style={{ color: colors.text, marginTop: 12 }}>Loading...</Text>
                </View>
            )}

            <Text style={[styles.title, { color: colors.text }]}>Polls</Text>

            <View style={styles.pollRow}>
                {/* Custom Dropdown */}
                <View style={{ flex: 1 }}>
                    <TouchableOpacity
                        onPress={() => setDropdownVisible(!dropdownVisible)}
                        style={[
                            styles.dropdownFixed,
                            { backgroundColor: colors.card, borderColor: colors.secondaryText }
                        ]}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 15,
                                fontWeight: '500',
                                maxWidth: 180,
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {polls.find(p => p._id === selectedPollId)?.question || "Select Poll"}
                        </Text>
                    </TouchableOpacity>
                    {dropdownVisible && (
                        <View style={[
                            styles.dropdownMenu,
                            { backgroundColor: colors.card, borderColor: colors.secondaryText }
                        ]}>
                            {polls.length === 0 && (
                                <Text style={{ color: colors.secondaryText, padding: 10 }}>No polls</Text>
                            )}
                            <FlatList
                                data={polls}
                                keyExtractor={item => item._id}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => handleQuestionSelect(item._id)}
                                        style={[
                                            styles.dropdownItem,
                                            { backgroundColor: item._id === selectedPollId ? colors.dropdownBackground : 'transparent' }
                                        ]}
                                    >
                                        <Text
                                            style={{
                                                color: item._id === selectedPollId ? colors.button : colors.text,
                                                fontWeight: item._id === selectedPollId ? 'bold' : 'normal',
                                                maxWidth: 220
                                            }}
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.question}
                                        </Text>
                                    </Pressable>
                                )}
                            />
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={() => setModalOpen(true)} style={styles.createLink}>
                    <Text style={{ color: colors.button, fontWeight: 'bold', fontSize: 15 }}>+ Create Poll</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
                {chartData.length > 0 ? (
                    <View style={{ alignItems: 'center', marginVertical: 20 }}>
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
                            Poll Results
                        </Text>
                        {chartData.map((c, idx) => (
                            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 5 }}>
                                <Text style={{ color: colors.secondaryText, flex: 1 }}>{c.label}</Text>
                                <Text style={{ color: colors.button, fontWeight: 'bold' }}>{c.value}</Text>
                            </View>
                        ))}
                        <Text style={{ color: colors.secondaryText, marginTop: 6 }}>Total votes: {pollData.total}</Text>
                    </View>
                ) : (
                    <Text style={{ color: colors.secondaryText }}>No poll data to display.</Text>
                )}
            </View>

            {/* Modal for new poll */}
            <Modal
                visible={modalOpen}
                animationType="fade"
                transparent
                onRequestClose={() => setModalOpen(false)}
            >
                <View style={styles.modalBg}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>New Poll</Text>
                        <TextInput
                            value={newPoll.question}
                            onChangeText={handleNewQuestion}
                            placeholder="Question"
                            placeholderTextColor={colors.secondaryText}
                            style={[
                                styles.input,
                                { backgroundColor: colors.dropdownBackground, borderColor: colors.secondaryText, color: colors.text }
                            ]}
                        />
                        {newPoll.options.map((opt, i) => (
                            <TextInput
                                key={i}
                                value={opt}
                                onChangeText={val => handleNewOptionChange(i, val)}
                                placeholder={`Option ${i + 1}`}
                                placeholderTextColor={colors.secondaryText}
                                style={[
                                    styles.input,
                                    { backgroundColor: colors.dropdownBackground, borderColor: colors.secondaryText, color: colors.text }
                                ]}
                            />
                        ))}
                        <TouchableOpacity onPress={addNewOption}>
                            <Text style={[styles.addOption, { color: colors.button }]}>+ Add Option</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                            <TouchableOpacity onPress={() => setModalOpen(false)}>
                                <Text style={{ color: colors.button, fontWeight: 'bold', fontSize: 15, marginRight: 16 }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleNewSubmit}>
                                <Text style={{ color: colors.button, fontWeight: 'bold', fontSize: 15 }}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Snackbar / Toast */}
            {snackbar.visible && (
                <Animated.View style={[
                    styles.snackbar,
                    {
                        backgroundColor: snackbar.severity === "success" ? colors.button : "#e53935",
                        transform: [{ translateY: snackbarY }],
                        width: SCREEN_WIDTH - 32,
                    }
                ]}>
                    <Text style={{ color: colors.buttonText, fontWeight: "bold" }}>
                        {snackbar.message}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        minHeight: '100%',
        padding: 16,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 16,
    },
    pollRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
        gap: 10,
        justifyContent: 'space-between'
    },
    dropdownFixed: {
        borderRadius: 18,
        borderWidth: 1,
        paddingHorizontal: 14,
        height: 38,
        minWidth: 160,
        maxWidth: 220,
        justifyContent: 'center',
    },
    dropdownMenu: {
        position: "absolute",
        top: 46,
        left: 0,
        width: "100%",
        borderRadius: 16,
        borderWidth: 1,
        zIndex: 9,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        paddingVertical: 2,
        maxHeight: 240,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    createLink: {
        marginLeft: 8,
        paddingVertical: 7,
        paddingHorizontal: 4,
    },
    chartCard: {
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 24,
        padding: 16,
        elevation: 2,
        minHeight: 100,
    },
    modalBg: {
        flex: 1,
        backgroundColor: "#000A",
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCard: {
        borderRadius: 10,
        padding: 18,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 9,
        marginBottom: 10,
        fontSize: 15,
    },
    addOption: {
        marginBottom: 12,
        fontWeight: 'bold',
        textAlign: 'right',
        fontSize: 15
    },
    snackbar: {
        position: "absolute",
        bottom: 28,
        left: 16,
        paddingHorizontal: 22,
        paddingVertical: 14,
        borderRadius: 9,
        alignItems: "center",
        elevation: 3,
    }
});
