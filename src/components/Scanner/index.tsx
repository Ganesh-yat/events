import React, { useCallback, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Camera,
    useCameraDevices,
    useCameraPermission,
    useCodeScanner,
} from 'react-native-vision-camera';

type ScannerResult = { qrcode: string };
type ScannerProps = {
    onDone: (data: ScannerResult | null) => void;
    colors?: {
        text?: string;
        cancelButton?: string;
        cancelButtonText?: string;
        background?: string;
    };
    message?: string;
};

const Scanner: React.FC<ScannerProps> = ({
    onDone,
    colors = {},
    message,
}) => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const devices = useCameraDevices();
    const device = devices.back;

    const [scanned, setScanned] = useState(false);
    const [requested, setRequested] = useState(false);

    // Ask for permission on mount if needed
    useEffect(() => {
        (async () => {
            if (!hasPermission && !requested) {
                setRequested(true);
                await requestPermission();
            }
        })();
    }, [hasPermission, requested, requestPermission]);

    // Called when codes are detected
    const handleScanned = useCallback(
        (codes: { value?: string }[]) => {
            if (scanned) return;
            const first = codes?.[0]?.value;
            if (first) {
                setScanned(true);
                onDone({ qrcode: first });
            }
        },
        [scanned, onDone],
    );

    // VisionCamera built-in Code Scanner
    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],    // add more types if needed
        onCodeScanned: handleScanned,
    }); // Memoized internally per docs. :contentReference[oaicite:9]{index=9}

    /* --- Permission states --- */
    if (!hasPermission) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background || 'transparent' }]}>
                <Text style={[styles.infoText, { color: colors.text || '#f00' }]}>
                    Camera permission denied.
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.cancelButton || '#e53935' }]}
                    onPress={requestPermission}
                >
                    <Text style={[styles.retryText, { color: colors.cancelButtonText || '#fff' }]}>
                        Grant Permission
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: '#00000033' }]}
                    onPress={() => onDone(null)}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.text || '#fff' }]}>
                        Cancel
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background || 'transparent' }]}>
                <ActivityIndicator size="large" />
                <Text style={[styles.infoText, { color: colors.text || '#444' }]}>
                    Loading camera…
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.flex1}>
            <Camera
                style={styles.camera}
                device={device}
                isActive={!scanned}
                codeScanner={codeScanner}   // built-in VisionCamera scanning. :contentReference[oaicite:10]{index=10}
                enableZoomGesture
            />
            <TouchableOpacity
                style={styles.cancelOverlay}
                onPress={() => onDone(null)}
            >
                <Text style={styles.cancelOverlayText}>Cancel</Text>
            </TouchableOpacity>
            {message ? (
                <View style={styles.topMessage}>
                    <Text style={[styles.topMessageText, { color: colors.text || '#fff' }]}>
                        {message}
                    </Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    camera: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    infoText: {
        marginTop: 14,
        fontSize: 15,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 6,
    },
    retryText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cancelButton: {
        marginTop: 12,
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 6,
    },
    cancelButtonText: {
        fontSize: 16,
        textAlign: 'center',
    },
    cancelOverlay: {
        position: 'absolute',
        bottom: 32,
        alignSelf: 'center',
        backgroundColor: '#0009',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 40,
    },
    cancelOverlayText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    topMessage: {
        position: 'absolute',
        top: 32,
        left: 16,
        right: 16,
        alignItems: 'center',
    },
    topMessageText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Scanner;
