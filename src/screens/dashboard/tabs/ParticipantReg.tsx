import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FormBuilder from '../../../components/DynamicForm/index';
import { Colors } from '../../../constants/Colors';
import { useGlobalInfo } from '../../../context/GlobalContext';
import TicketRegistrationForm from '../../../components/TicketRegistrationForm/index';

const ParticipantRegistration: React.FC = () => {
    const { theme } = useGlobalInfo();
    const colors = Colors[theme];
    const [formType, setFormType] = useState<'ticket' | 'user'>('ticket');

    const accentColor = colors.button;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.headerContainer}>
                <View style={styles.headerTextContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Event Registration</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.secondaryText }]}>
                        You can create event registration forms and ticket registration counts here for your event.
                    </Text>
                </View>

                <View style={[
                    styles.toggleContainer,
                    { backgroundColor: colors.dropdownBackground }
                ]}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            formType === 'ticket' && {
                                borderBottomWidth: 3,
                                borderColor: accentColor,
                                backgroundColor: 'transparent'
                            }
                        ]}
                        onPress={() => setFormType('ticket')}
                    >
                        <Text
                            style={[
                                styles.toggleButtonText,
                                { color: colors.secondaryText },
                                formType === 'ticket' && {
                                    color: accentColor,
                                    fontWeight: 'bold'
                                }
                            ]}
                        >
                            Ticket Registration
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            formType === 'user' && {
                                borderBottomWidth: 3,
                                borderColor: accentColor,
                                backgroundColor: 'transparent'
                            }
                        ]}
                        onPress={() => setFormType('user')}
                    >
                        <Text
                            style={[
                                styles.toggleButtonText,
                                { color: colors.secondaryText },
                                formType === 'user' && {
                                    color: accentColor,
                                    fontWeight: 'bold'
                                }
                            ]}
                        >
                            User Registration Form
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <GestureHandlerRootView>
                <View style={[styles.contentContainer]}>
                    {formType === 'ticket' ? (
                        <TicketRegistrationForm />
                    ) : (
                        <FormBuilder />
                    )}
                </View>
            </GestureHandlerRootView>
        </View>
    );
};

export default ParticipantRegistration;

const styles = StyleSheet.create({
    container: {
        flex:1,
        padding: 16,
    },
    headerContainer: {
        marginBottom: 16,
    },
    headerTextContainer: {
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: 8,
        overflow: 'hidden',
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    contentContainer: {
        // flex: 1,
        minHeight: 510,
        maxHeight:600,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
});
