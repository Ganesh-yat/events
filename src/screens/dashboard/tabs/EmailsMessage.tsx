import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useGlobalInfo } from '../../../context/GlobalContext';

export default function Email() {
    const { theme } = useGlobalInfo();
    const colors = Colors[theme];

    const [activeTab, setActiveTab] = useState('email');
    const [recipientType, setRecipientType] = useState('single');

    const [singleTo, setSingleTo] = useState('');
    const [multipleTo, setMultipleTo] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [snackbar, setSnackbar] = useState({ visible: false, message: '', severity: 'success' });

    const [dialogVisible, setDialogVisible] = useState(false);
    const [pendingChange, setPendingChange] = useState({ type: '', value: '' });

    const isValidEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const isValidPhoneNumber = (num) => /^\d{10}$/.test(num);

    const hasInput = () =>
        singleTo || multipleTo.length > 0 || subject || message;

    const clearAll = () => {
        setSingleTo('');
        setMultipleTo([]);
        setInputValue('');
        setSubject('');
        setMessage('');
    };

    const handleTabChange = (val) => {
        if (val !== activeTab) {
            if (hasInput()) {
                setPendingChange({ type: 'tab', value: val });
                setDialogVisible(true);
            } else {
                setActiveTab(val);
                clearAll();
            }
        }
    };

    const handleRecipientTypeChange = (val) => {
        if (val !== recipientType) {
            if (hasInput()) {
                setPendingChange({ type: 'recipientType', value: val });
                setDialogVisible(true);
            } else {
                setRecipientType(val);
                clearAll();
            }
        }
    };

    const confirmChange = () => {
        const { type, value } = pendingChange;
        if (type === 'tab') setActiveTab(value);
        if (type === 'recipientType') setRecipientType(value);
        clearAll();
        setDialogVisible(false);
    };

    const handleAddRecipient = () => {
        const cleaned = inputValue.trim();
        if (!cleaned) return;

        const isValid = activeTab === 'email'
            ? isValidEmail(cleaned)
            : isValidPhoneNumber(cleaned);

        if (isValid && !multipleTo.includes(cleaned)) {
            setMultipleTo([...multipleTo, cleaned]);
            setInputValue('');
        }
    };

    const removeRecipient = (index) => {
        setMultipleTo(multipleTo.filter((_, i) => i !== index));
    };

    const isSendDisabled = () => {
        if (message.trim() === '') return true;

        if (activeTab === 'email') {
            if (subject.trim() === '' || subject.length > 60) return true;
            if (recipientType === 'single') {
                return !isValidEmail(singleTo.trim());
            }
            return multipleTo.length === 0 || !multipleTo.every(isValidEmail);
        } else {
            if (recipientType === 'single') {
                return !isValidPhoneNumber(singleTo.trim());
            }
            return multipleTo.length === 0 || !multipleTo.every(isValidPhoneNumber);
        }
    };

    const handleSend = () => {
        setSnackbar({
            visible: true,
            message: `${activeTab === 'email' ? 'Email' : 'Message'} sent to ${recipientType === 'single' ? `"${singleTo}"` : `${multipleTo.length} recipients`}!`,
            severity: 'success',
        });
        clearAll();
        setTimeout(() => setSnackbar((s) => ({ ...s, visible: false })), 3500);
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.button }]}>Send Ticket Manually</Text>
            <Text style={[styles.subTitle, { color: colors.secondaryText }]}>
                Send an {activeTab === 'email' ? 'email' : 'SMS message'} to participants
            </Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        { borderBottomColor: colors.dropdownBackground },
                        activeTab === 'email' && { borderBottomColor: colors.button }
                    ]}
                    onPress={() => handleTabChange('email')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: colors.secondaryText },
                        activeTab === 'email' && { color: colors.button, fontWeight: 'bold' }
                    ]}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        { borderBottomColor: colors.dropdownBackground },
                        activeTab === 'message' && { borderBottomColor: colors.button }
                    ]}
                    onPress={() => handleTabChange('message')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: colors.secondaryText },
                        activeTab === 'message' && { color: colors.button, fontWeight: 'bold' }
                    ]}>Message</Text>
                </TouchableOpacity>
            </View>

            {/* Recipient Type (custom radio buttons) */}
            <View style={styles.radioContainer}>
                <TouchableOpacity
                    style={styles.radioItem}
                    onPress={() => handleRecipientTypeChange('single')}
                >
                    <View style={[
                        styles.radioOuter,
                        { borderColor: recipientType === 'single' ? colors.button : colors.secondaryText }
                    ]}>
                        {recipientType === 'single' && <View style={[styles.radioInner, { backgroundColor: colors.button }]} />}
                    </View>
                    <Text style={{ color: colors.text }}>Single</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.radioItem}
                    onPress={() => handleRecipientTypeChange('multiple')}
                >
                    <View style={[
                        styles.radioOuter,
                        { borderColor: recipientType === 'multiple' ? colors.button : colors.secondaryText }
                    ]}>
                        {recipientType === 'multiple' && <View style={[styles.radioInner, { backgroundColor: colors.button }]} />}
                    </View>
                    <Text style={{ color: colors.text }}>Multiple</Text>
                </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
                {recipientType === 'single' ? (
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.dropdownBackground,
                                borderColor: colors.secondaryText,
                                color: colors.text,
                            }
                        ]}
                        placeholder={`To (${activeTab === 'email' ? 'Email' : 'Phone Number'})`}
                        placeholderTextColor={colors.secondaryText}
                        value={singleTo}
                        onChangeText={setSingleTo}
                        keyboardType={activeTab === 'message' ? 'phone-pad' : 'email-address'}
                    />
                ) : (
                    <View style={styles.multiInputContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TextInput
                                style={[
                                    styles.input,
                                    { flex: 1, backgroundColor: colors.dropdownBackground, borderColor: colors.secondaryText, color: colors.text }
                                ]}
                                placeholder={`Add ${activeTab === 'email' ? 'Email' : 'Phone'} and press +`}
                                placeholderTextColor={colors.secondaryText}
                                value={inputValue}
                                onChangeText={setInputValue}
                                keyboardType={activeTab === 'message' ? 'phone-pad' : 'email-address'}
                                onSubmitEditing={handleAddRecipient}
                                blurOnSubmit={false}
                            />
                            <TouchableOpacity
                                onPress={handleAddRecipient}
                                style={[styles.addButton, { borderColor: colors.button }]}
                            >
                                <Text style={{ color: colors.button, fontWeight: 'bold', fontSize: 19 }}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.chipContainer}>
                            {multipleTo.map((val, index) => {
                                const isInvalid = activeTab === 'email'
                                    ? !isValidEmail(val)
                                    : !isValidPhoneNumber(val);
                                return (
                                    <View
                                        key={index}
                                        style={[
                                            styles.chip,
                                            {
                                                borderColor: isInvalid ? colors.cancelButton : colors.button,
                                                backgroundColor: isInvalid ? colors.cancelButton + '11' : colors.dropdownBackground,
                                            }
                                        ]}
                                    >
                                        <Text style={{ color: isInvalid ? colors.cancelButton : colors.text }}>
                                            {val}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => removeRecipient(index)}
                                            style={styles.chipClose}
                                        >
                                            <Text style={{ color: isInvalid ? colors.cancelButton : colors.button, fontWeight: 'bold' }}> × </Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Subject */}
                {activeTab === 'email' && (
                    <>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.dropdownBackground,
                                    borderColor: colors.secondaryText,
                                    color: colors.text,
                                }
                            ]}
                            placeholder="Subject"
                            placeholderTextColor={colors.secondaryText}
                            value={subject}
                            onChangeText={setSubject}
                        />
                        <Text style={[styles.caption, { color: colors.secondaryText }]}>
                            Subject should be maximum 60 characters
                        </Text>
                    </>
                )}

                {/* Message */}
                <TextInput
                    style={[
                        styles.input,
                        styles.messageInput,
                        {
                            backgroundColor: colors.dropdownBackground,
                            borderColor: colors.secondaryText,
                            color: colors.text,
                        }
                    ]}
                    placeholder="Message"
                    placeholderTextColor={colors.secondaryText}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                />

                {/* Send Button */}
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={isSendDisabled()}
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: colors.button,
                            opacity: isSendDisabled() ? 0.7 : 1,
                        }
                    ]}
                >
                    <Text style={{ color: colors.buttonText, fontWeight: 'bold', fontSize: 16 }}>
                        Send
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Snackbar */}
            {snackbar.visible && (
                <View style={[
                    styles.snackbar,
                    { backgroundColor: snackbar.severity === 'error' ? colors.cancelButton : colors.button }
                ]}>
                    <Text style={{ color: colors.buttonText }}>{snackbar.message}</Text>
                </View>
            )}

            {/* Custom Dialog */}
            <Modal
                visible={dialogVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDialogVisible(false)}
            >
                <View style={styles.dialogOverlay}>
                    <View style={[styles.dialog, { backgroundColor: colors.card }]}>
                        <Text style={[styles.dialogTitle, { color: colors.text }]}>Unsaved Input Detected</Text>
                        <Text style={[styles.dialogMessage, { color: colors.secondaryText }]}>
                            Changing mode will clear all inputs. Are you sure you want to continue?
                        </Text>
                        <View style={styles.dialogActions}>
                            <TouchableOpacity onPress={() => setDialogVisible(false)} style={styles.dialogBtn}>
                                <Text style={{ color: colors.text }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmChange} style={styles.dialogBtn}>
                                <Text style={{ color: colors.cancelButton, fontWeight: 'bold' }}>Yes, Clear</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    subTitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 16,
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 16,
        gap: 18,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        gap: 4,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    formContainer: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    input: {
        padding: 10,
        borderRadius: 4,
        borderWidth: 1,
        marginBottom: 12,
    },
    caption: {
        fontSize: 12,
        marginBottom: 8,
    },
    messageInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    sendButton: {
        marginTop: 12,
        borderRadius: 6,
        paddingVertical: 13,
        alignItems: 'center',
    },
    multiInputContainer: {
        marginBottom: 12,
    },
    addButton: {
        marginLeft: 8,
        borderWidth: 1.5,
        borderRadius: 7,
        paddingHorizontal: 9,
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        marginBottom: 4,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        paddingVertical: 5,
        paddingHorizontal: 13,
        marginRight: 8,
        marginBottom: 4,
        backgroundColor: '#eee',
    },
    chipClose: {
        marginLeft: 3,
        paddingHorizontal: 4,
    },
    snackbar: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 35,
        borderRadius: 8,
        paddingVertical: 13,
        paddingHorizontal: 18,
        alignItems: 'center',
        zIndex: 99,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    dialogOverlay: {
        flex: 1,
        backgroundColor: '#000A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        width: '90%',
        maxWidth: 350,
        borderRadius: 14,
        padding: 24,
        alignItems: 'center',
    },
    dialogTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    dialogMessage: {
        fontSize: 14,
        marginBottom: 22,
        textAlign: 'center',
    },
    dialogActions: {
        flexDirection: 'row',
        gap: 18,
        marginTop: 4,
    },
    dialogBtn: {
        paddingVertical: 7,
        paddingHorizontal: 18,
    },
});
