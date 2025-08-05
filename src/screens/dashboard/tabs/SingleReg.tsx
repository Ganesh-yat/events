import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../constants/Colors';
import { useGlobalInfo } from '../../../context/GlobalContext';
import { API_ROUTE } from '../../../../config';

export default function SingleParticipation() {
    const { event: eventId, theme, token } = useGlobalInfo();
    const navigation = useNavigation();
    const colors = Colors[theme];

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [schema, setSchema] = useState(null);
    const [ticketTiers, setTicketTiers] = useState([]);
    const [form, setForm] = useState({});
    const [openTier, setOpenTier] = useState(false);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '', error: false });

    useEffect(() => {
        if (!eventId) {
            setLoading(false);
            setSchema(null);
            setTicketTiers([]);
            return;
        }
        setLoading(true);
        
        // Create authenticated headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        Promise.all([
            fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`, { headers }).then(r => r.json()),
            fetch(`${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`, { headers }).then(r => r.json()),
        ])
            .then(([formsRes, tiersRes]) => {
                let forms = [];
                if (Array.isArray(formsRes)) {
                    forms = formsRes;
                } else if (formsRes && Array.isArray(formsRes.data?.forms)) {
                    forms = formsRes.data.forms;
                }
                if (!forms || !forms.length) {
                    setSchema(null);
                } else {
                    const formObj = forms[0];
                    setSchema(formObj);
                    const initial = { tierName: '', visitorCount: 0 };
                    (formObj.fields || []).forEach(f => {
                        initial[f.id] = f.type === 'Checkbox' ? false : '';
                    });
                    setForm(initial);
                }
                if (tiersRes.success && tiersRes.data && Array.isArray(tiersRes.data.ticket_tiers)) {
                    setTicketTiers(tiersRes.data.ticket_tiers);
                } else {
                    setTicketTiers([]);
                }
            })
            .catch(() => {
                setSnackbar({
                    visible: true,
                    message: 'Failed to load form info',
                    error: true,
                });
                setSchema(undefined);
                setTicketTiers([]);
            })
            .finally(() => setLoading(false));
    }, [eventId, token]);

    useEffect(() => {
        if (snackbar.visible) {
            const timer = setTimeout(() => {
                setSnackbar(s => ({ ...s, visible: false }));
            }, 2200);
            return () => clearTimeout(timer);
        }
    }, [snackbar.visible]);

    const handleChange = (id, value) => {
        setForm(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        if (!schema || !form.tierName) {
            setSnackbar({ visible: true, message: 'Please select a ticket tier', error: true });
            return;
        }
        setSubmitting(true);
        const responses = schema.fields.map(f => ({ fieldId: f.id, value: form[f.id] }));
        const visitorCount = Number(form.visitorCount) || 0;

        // Create authenticated headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(`${API_ROUTE}/api/v1/event/form-submission`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                eventId,
                formId: schema._id,
                responses,
                visitorCount,
                tierName: form.tierName,
            }),
        })
            .then(async res => {
                if (!res.ok) {
                    const errMsg = await res.text();
                    throw new Error(errMsg);
                }
                return res.json();
            })
            .then(data => {
                setSnackbar({ visible: true, message: 'Ticket successfully created!', error: false });
                setTimeout(() => {
                    setSubmitting(false);
                    navigation.navigate('QrScreen', { participantId: data._id });
                }, 1400);
            })
            .catch(err => {
                setSnackbar({ visible: true, message: `Failed: ${err.message}`, error: true });
                setSubmitting(false);
            });
    };

    // Loading
    if (loading) {
        return (
            <View style={[{ padding: 32, alignItems: 'center' }, { backgroundColor: colors.background }]}>
                <ActivityIndicator color={colors.button} />
            </View>
        );
    }

    // No form found
    if (schema === null) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <Text style={{ fontWeight: 'bold', fontSize: 18, margin: 18, color: colors.button }}>
                    No registration form found.
                </Text>
                <TouchableOpacity
                    style={[styles.button, styles.buttonFilled, { backgroundColor: colors.button, marginBottom: 24 }]}
                    onPress={() => navigation.navigate('ParticipantRegistration')}
                >
                    <Text style={[styles.buttonText, { color: colors.buttonText }]}>Build a Registration Form</Text>
                </TouchableOpacity>
                {snackbar.visible && (
                    <View style={[
                        styles.snackbar,
                        { backgroundColor: snackbar.error ? colors.cancelButton : colors.button }
                    ]}>
                        <Text style={styles.snackbarText}>{snackbar.message}</Text>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    // Error
    if (schema === undefined) {
        return (
            <>
                {snackbar.visible && (
                    <View style={[
                        styles.snackbar,
                        { backgroundColor: snackbar.error ? colors.cancelButton : colors.button }
                    ]}>
                        <Text style={styles.snackbarText}>{snackbar.message}</Text>
                    </View>
                )}
            </>
        );
    }

    if (submitting) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator color={colors.button} size="large" />
                <Text style={{ color: colors.button, marginTop: 16 }}>Ticket successfully updated!</Text>
            </View>
        );
    }

    // Main Form UI
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.wrapper}
            >
                <ScrollView
                    style={[styles.container, { backgroundColor: colors.background }]}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={[styles.header, { color: colors.button }]}>
                        {schema.title || 'Single Participant Registration'}
                    </Text>
                    <Text style={[styles.subHeader, { color: colors.secondaryText }]}>
                        {schema.description || 'Issue tickets to your Participants without asking them to register online.'}
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        {/* Info row */}
                        <View style={styles.infoRow}>
                            <Text style={[styles.infoTitle, { color: colors.text }]}>Choose Your</Text>
                            <Text style={[styles.infoText, { color: colors.secondaryText, marginLeft: 8 }]}>
                                08:00 PM - 08:00 PM
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            {/* <MaterialIcons name="event-note" size={16} color={colors.cancelButton} /> */}
                            <Text style={[styles.infoText, { color: colors.cancelButton, fontWeight: 'bold', marginLeft: 0 }]}>
                                {ticketTiers.length > 0
                                    ? `${ticketTiers.reduce((acc, t) => acc + (t.capacity || 0), 0)} TICKET REMAINING`
                                    : `TICKET REMAINING`}
                            </Text>
                        </View>
                        <View style={styles.divider} />

                        {/* Ticket Tier Dropdown */}
                        <Text style={[styles.label, { color: colors.secondaryText }]}>Select Ticket Tier</Text>
                        <DropDownPicker
                            open={openTier}
                            value={form.tierName}
                            items={[
                                { label: 'Select tier', value: '' },
                                ...ticketTiers.map(t => ({
                                    label: `${t.name} — ₹${t.price} (${t.capacity} left)`,
                                    value: t.name,
                                })),
                            ]}
                            setOpen={setOpenTier}
                            setValue={val => handleChange('tierName', val())}
                            setItems={() => { }}
                            style={[
                                styles.dropdown,
                                {
                                    borderColor: colors.secondaryText,
                                    backgroundColor: colors.dropdownBackground,
                                }
                            ]}
                            dropDownContainerStyle={[
                                styles.dropdownContainer,
                                { borderColor: colors.secondaryText, backgroundColor: colors.dropdownBackground }
                            ]}
                            placeholder="Select tier"
                            textStyle={{ color: colors.text }}
                            listMode="MODAL"
                        />

                        {/* Dynamic schema fields */}
                        {schema.fields.map(f => {
                            const val = form[f.id];
                            switch (f.type) {
                                case 'Input Field':
                                case 'Email':
                                    return (
                                        <TextInput
                                            key={f.id}
                                            style={[
                                                styles.input,
                                                {
                                                    borderColor: colors.secondaryText,
                                                    backgroundColor: colors.dropdownBackground,
                                                    color: colors.text,
                                                }
                                            ]}
                                            placeholder={f.label}
                                            placeholderTextColor={colors.secondaryText}
                                            keyboardType={f.type === 'Email' ? 'email-address' : 'default'}
                                            value={val}
                                            onChangeText={t => handleChange(f.id, t)}
                                        />
                                    );
                                case 'Textarea':
                                    return (
                                        <TextInput
                                            key={f.id}
                                            style={[
                                                styles.input,
                                                {
                                                    borderColor: colors.secondaryText,
                                                    backgroundColor: colors.dropdownBackground,
                                                    color: colors.text,
                                                    height: 80,
                                                    textAlignVertical: 'top'
                                                }
                                            ]}
                                            placeholder={f.label}
                                            placeholderTextColor={colors.secondaryText}
                                            multiline
                                            value={val}
                                            onChangeText={t => handleChange(f.id, t)}
                                        />
                                    );
                                case 'Number Field':
                                    return (
                                        <TextInput
                                            key={f.id}
                                            style={[
                                                styles.input,
                                                {
                                                    borderColor: colors.secondaryText,
                                                    backgroundColor: colors.dropdownBackground,
                                                    color: colors.text,
                                                }
                                            ]}
                                            placeholder={f.label}
                                            placeholderTextColor={colors.secondaryText}
                                            value={val?.toString()}
                                            keyboardType="number-pad"
                                            onChangeText={t => handleChange(f.id, t.replace(/[^0-9]/g, ''))}
                                        />
                                    );
                                case 'Select Menu':
                                    return (
                                        <DropDownPicker
                                            key={f.id}
                                            open={openTier === f.id}
                                            value={val}
                                            items={f.options.map(opt => ({ label: opt, value: opt }))}
                                            setOpen={o => setOpenTier(o ? f.id : false)}
                                            setValue={v => handleChange(f.id, v())}
                                            setItems={() => { }}
                                            style={[
                                                styles.dropdown,
                                                {
                                                    borderColor: colors.secondaryText,
                                                    backgroundColor: colors.dropdownBackground,
                                                }
                                            ]}
                                            dropDownContainerStyle={[
                                                styles.dropdownContainer,
                                                { borderColor: colors.secondaryText, backgroundColor: colors.dropdownBackground }
                                            ]}
                                            placeholder={f.label}
                                            textStyle={{ color: colors.text }}
                                            listMode="MODAL"
                                        />
                                    );
                                case 'Checkbox':
                                    return (
                                        <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                            <Switch
                                                value={!!val}
                                                onValueChange={v => handleChange(f.id, v)}
                                                trackColor={{ true: colors.button, false: colors.secondaryText }}
                                                thumbColor={!!val ? colors.button : colors.card}
                                            />
                                            <Text style={{ color: colors.text, marginLeft: 8 }}>{f.label}</Text>
                                        </View>
                                    );
                                default:
                                    return null;
                            }
                        })}

                        {/* Additional Visitors */}
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: colors.secondaryText,
                                    backgroundColor: colors.dropdownBackground,
                                    color: colors.text,
                                }
                            ]}
                            placeholder="Additional Visitors"
                            placeholderTextColor={colors.secondaryText}
                            value={form.visitorCount?.toString()}
                            keyboardType="number-pad"
                            onChangeText={t => handleChange('visitorCount', t.replace(/[^0-9]/g, ''))}
                        />
                        <Text style={{ fontSize: 12, color: colors.secondaryText, marginBottom: 8 }}>
                            Enter extra guests (0 if none).
                        </Text>
                        <View style={styles.divider} />
                        {/* Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonOutline, { borderColor: colors.cancelButton }]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={[styles.buttonText, { color: colors.cancelButton }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonFilled, { backgroundColor: colors.button }]}
                                onPress={handleSubmit}
                            >
                                <Text style={[styles.buttonText, { color: colors.buttonText }]}>Proceed</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
                {snackbar.visible && (
                    <View style={[
                        styles.snackbar,
                        { backgroundColor: snackbar.error ? colors.cancelButton : colors.button }
                    ]}>
                        <Text style={styles.snackbarText}>{snackbar.message}</Text>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: { flex: 1 },
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },
    header: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    subHeader: { fontSize: 14, marginBottom: 16 },
    card: { borderRadius: 8, padding: 16, elevation: 3 },
    infoRow: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoTitle: { fontSize: 16, fontWeight: '600' },
    infoRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    infoText: { fontSize: 12, marginLeft: 4 },
    divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
    label: { fontSize: 14, marginBottom: 6 },
    dropdown: { height: 44, marginBottom: 16 },
    dropdownContainer: {},
    input: {
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 12,
    },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 110,
        marginLeft: 6,
    },
    buttonOutline: { borderWidth: 1.5, backgroundColor: 'transparent' },
    buttonFilled: { backgroundColor: '#007AFF' },
    buttonText: { fontWeight: 'bold', fontSize: 16 },
    snackbar: {
        position: "absolute",
        bottom: 32,
        left: 24,
        right: 24,
        borderRadius: 6,
        padding: 14,
        alignItems: 'center',
        elevation: 4,
        zIndex: 99,
    },
    snackbarText: { color: "#fff", fontWeight: '600', textAlign: 'center' },
});
