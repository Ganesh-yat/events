import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    Share,
    Platform,
} from 'react-native';
import { useGlobalInfo } from '../../context/GlobalContext';
import { Colors } from '../../constants/Colors';

interface QRCodeDisplayProps {
    visible: boolean;
    onClose: () => void;
    qrCodeUrl?: string;
    qrCodeData?: string;
    participantName?: string;
    ticketId?: string;
    tierName?: string;
}

export default function QRCodeDisplay({
    visible,
    onClose,
    qrCodeUrl,
    qrCodeData,
    participantName,
    ticketId,
    tierName,
}: QRCodeDisplayProps) {
    const { theme } = useGlobalInfo();
    const colors = Colors[theme];

    const handleShare = async () => {
        try {
            const shareContent = {
                title: 'Event Ticket QR Code',
                message: `Ticket for ${participantName || 'Participant'}\nTicket ID: ${ticketId || 'N/A'}\nTier: ${tierName || 'N/A'}`,
                url: qrCodeUrl,
            };

            await Share.share(shareContent);
        } catch (error) {
            Alert.alert('Error', 'Failed to share QR code');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Ticket QR Code
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeText, { color: colors.button }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {participantName && (
                        <Text style={[styles.participantName, { color: colors.text }]}>
                            {participantName}
                        </Text>
                    )}

                    {ticketId && (
                        <Text style={[styles.ticketId, { color: colors.secondaryText }]}>
                            Ticket ID: {ticketId}
                        </Text>
                    )}

                    {tierName && (
                        <Text style={[styles.tierName, { color: colors.secondaryText }]}>
                            Tier: {tierName}
                        </Text>
                    )}

                    <View style={styles.qrContainer}>
                        {qrCodeUrl ? (
                            <Image
                                source={{ uri: qrCodeUrl }}
                                style={styles.qrImage}
                                resizeMode="contain"
                            />
                        ) : qrCodeData ? (
                            <View style={[styles.qrPlaceholder, { backgroundColor: colors.dropdownBackground }]}>
                                <Text style={[styles.qrPlaceholderText, { color: colors.secondaryText }]}>
                                    QR Code: {qrCodeData}
                                </Text>
                            </View>
                        ) : (
                            <View style={[styles.qrPlaceholder, { backgroundColor: colors.dropdownBackground }]}>
                                <Text style={[styles.qrPlaceholderText, { color: colors.secondaryText }]}>
                                    No QR Code Available
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.shareButton, { backgroundColor: colors.button }]}
                            onPress={handleShare}
                        >
                            <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                                Share QR Code
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.closeModalButton, { borderColor: colors.button }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.closeModalText, { color: colors.button }]}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    participantName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    ticketId: {
        fontSize: 14,
        marginBottom: 4,
    },
    tierName: {
        fontSize: 14,
        marginBottom: 20,
    },
    qrContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    qrImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
    },
    qrPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    qrPlaceholderText: {
        textAlign: 'center',
        fontSize: 14,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    shareButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    closeModalButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    closeModalText: {
        fontSize: 16,
        fontWeight: '600',
    },
}); 