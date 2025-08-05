import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Colors } from '../../../constants/Colors';
import { useGlobalInfo } from '../../../context/GlobalContext';
import { API_ROUTE } from '../../../../config';

const submissionsData = [
    {
        _id: "s1",
        responses: [
            { fieldId: "name", value: "John Doe" },
            { fieldId: "email", value: "john@example.com" },
            { fieldId: "company", value: "Acme Corp" },
            { fieldId: "phone", value: "1234567890" }
        ],
        visitorCount: 4,
        entryTime: "2024-07-25T09:00:00.000Z",
        exitTime: "2024-07-25T17:00:00.000Z",
        food: true,
        foodTime: ["2024-07-25T12:30:00.000Z"],
        gift: false,
        giftTime: [],
        submittedAt: "2024-07-24T20:15:00.000Z"
    },
    {
        _id: "s2",
        responses: [
            { fieldId: "name", value: "Jane Smith" },
            { fieldId: "email", value: "jane@company.com" },
            { fieldId: "company", value: "Widgets Ltd" },
            { fieldId: "phone", value: "9876543210" }
        ],
        visitorCount: 3,
        entryTime: "2024-07-25T09:10:00.000Z",
        exitTime: "2024-07-25T16:45:00.000Z",
        food: false,
        foodTime: [],
        gift: true,
        giftTime: ["2024-07-25T14:45:00.000Z"],
        submittedAt: "2024-07-24T21:05:00.000Z"
    },
    {
        _id: "s3",
        responses: [
            { fieldId: "name", value: "Carlos Alvarez" },
            { fieldId: "email", value: "carlos@web.com" },
            { fieldId: "company", value: "Beta Inc" },
            { fieldId: "phone", value: "5556783245" }
        ],
        visitorCount: 5,
        entryTime: "2024-07-25T09:20:00.000Z",
        exitTime: "2024-07-25T15:20:00.000Z",
        food: true,
        foodTime: ["2024-07-25T13:00:00.000Z", "2024-07-25T16:00:00.000Z"],
        gift: true,
        giftTime: ["2024-07-25T15:55:00.000Z"],
        submittedAt: "2024-07-24T22:10:00.000Z"
    },
    {
        _id: "s4",
        responses: [
            { fieldId: "name", value: "Priya Singh" },
            { fieldId: "email", value: "priya@india.com" },
            { fieldId: "company", value: "TechSoft" },
            { fieldId: "phone", value: "8899887766" }
        ],
        visitorCount: 2,
        entryTime: "2024-07-25T10:00:00.000Z",
        exitTime: "2024-07-25T14:00:00.000Z",
        food: false,
        foodTime: [],
        gift: false,
        giftTime: [],
        submittedAt: "2024-07-24T22:50:00.000Z"
    }
];

const summaryData = {
    metrics: {
        "Total Submissions": 4,
        "Unique Attendees": 4,
        "Total Visitors": 14,
        "With Food": 2,
        "With Gift": 3,
    },
    ticketTiers: [
        { name: "Regular", price: 200, capacity: 30, perks: ["Swag", "Lunch"] },
        { name: "VIP", price: 500, capacity: 10, perks: ["VIP Seating", "Gift Bag", "Buffet"] }
    ],
    formSchema: [
        { id: "name", label: "Name" },
        { id: "email", label: "Email" },
        { id: "company", label: "Company" },
        { id: "phone", label: "Phone" }
    ]
};



export default function Reports() {
    const { theme, event, token } = useGlobalInfo();
    const colors = Colors[theme];

    const [summary, setSummary] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [ticketMap, setTicketMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ visible: false, message: '', severity: 'success' });
    const [downloading, setDownloading] = useState(false);

    const eventId = event?._id || event;

    const showSnackbar = (msg, severity = 'success') => {
        setSnackbar({ visible: true, message: msg, severity });
        setTimeout(() => setSnackbar(s => ({ ...s, visible: false })), 3500);
    };

    useEffect(() => {
        if (!eventId) return;
        setLoading(true);

        // Create authenticated headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const sumP = fetch(`${API_ROUTE}/api/v1/event/report/event/${eventId}`, { headers })
            .then(r => r.json()).then(j => {
                if (!j.success) throw new Error(j.message || 'Failed loading summary');
                return j.data;
            });

        const subsP = fetch(
            `${API_ROUTE}/api/v1/event/participantSearch?eventId=${eventId}&page=1&limit=10000`, { headers }
        ).then(r => r.json()).then(j => j.results || []);

        const ticketsP = fetch(`${API_ROUTE}/api/v1/event/tickets/event/${eventId}`, { headers })
            .then(r => r.json()).then(j => {
                if (!j.success) throw new Error(j.message || 'Failed loading tickets');
                return j.data;
            });

        const ticketTiersP = fetch(`${API_ROUTE}/api/v1/event/ticket-tiers/${eventId}`, { headers })
            .then(r => r.json()).then(j => {
                if (!j.success) throw new Error(j.message || 'Failed loading ticket tiers');
                return j.data.ticket_tiers || [];
            });

        Promise.all([sumP, subsP, ticketsP, ticketTiersP])
            .then(([sum, subs, tickets, ticketTiers]) => {
                setSummary(sum);
                setSubmissions(subs);
                // setSummary(summaryData);
                // setSubmissions(submissionsData);
                const m = {};
                tickets.forEach(t => {
                    m[t.userSubmissionId] = t.tierName.toUpperCase();
                });
                setTicketMap(m);
                
                // Add ticket tiers to summary
                if (sum) {
                    sum.ticketTiers = ticketTiers;
                    setSummary(sum);
                }
            })
            .catch(err => showSnackbar(err.message, 'error'))
            .finally(() => setLoading(false));
    }, [eventId]);

    if (!eventId) {
        return <Text style={{ color: colors.cancelButton, textAlign: 'center', marginTop: 40 }}>No event selected.</Text>;
    }

    const displayVal = val => {
        if (typeof val === 'boolean') return val ? 'YES' : 'NO';
        if (typeof val === 'string') return val.toUpperCase();
        if (Array.isArray(val))
            return val
                .map(d =>
                    new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                )
                .join(', ');
        if (val instanceof Date)
            return new Date(val)
                .toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
                .toUpperCase();
        if (val != null && typeof val !== 'object') return String(val).toUpperCase();
        return '';
    };

    const renderCell = val => {
        if (val && typeof val === 'object' && 'text' in val && 'hyperlink' in val) {
            return (
                <Text
                    style={{ color: colors.button, textDecorationLine: 'underline' }}
                    onPress={() => Alert.alert('Link', val.hyperlink)}
                >
                    {String(val.text).toUpperCase()}
                </Text>
            );
        }
        return displayVal(val);
    };

    // Download and share via react-native-fs & react-native-share
    const handleExcelDownload = async () => {
        try {
            setDownloading(true);
            let granted = true;

            if (Platform.OS === 'android') {
                granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Storage Permission",
                        message: "App needs access to your storage to download the file.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    showSnackbar('Permission denied!', 'error');
                    setDownloading(false);
                    return;
                }
            }

            // Create authenticated headers
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const url = `${API_ROUTE}/api/v1/event/report/event/${eventId}/export`;
            const fileName = `Event-Report-${eventId}-${Date.now()}.xlsx`;
            const downloadDest =
                Platform.OS === 'android'
                    ? `${RNFS.DownloadDirectoryPath}/${fileName}`
                    : `${RNFS.DocumentDirectoryPath}/${fileName}`;

            // First fetch the file with authentication headers
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`Download failed: ${response.status} ${response.statusText}`);
            }

            // Get the file as text and write it
            const fileContent = await response.text();
            await RNFS.writeFile(downloadDest, fileContent, 'utf8');

            showSnackbar('File downloaded. Now sharing...', 'success');
            setTimeout(async () => {
                try {
                    await Share.open({
                        url: 'file://' + downloadDest,
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        title: 'Share or Save Event Report',
                        failOnCancel: false,
                    });
                } catch (e) {
                    // If user cancels, do nothing
                }
            }, 800);
        } catch (err) {
            showSnackbar('Download failed: ' + err.message, 'error');
        } finally {
            setDownloading(false);
        }
    };

    // Card grid layout calculation
    const { width: screenWidth } = Dimensions.get('window');
    const gridSpacing = 12;
    const numColumns = 3;
    const cardWidth = (screenWidth - (numColumns + 1) * gridSpacing - 32) / numColumns;

    const renderSummaryGrid = (metrics) => {
        const entries = Object.entries(metrics);
        const rows = [];
        for (let i = 0; i < entries.length; i += numColumns) {
            const row = entries.slice(i, i + numColumns);
            rows.push(row);
        }

        return (
            <View style={styles.summaryGridWrap}>
                {rows.map((row, rowIdx) => {
                    const isLastRow = rowIdx === rows.length - 1;
                    const isFullRow = row.length === numColumns;
                    let cardStyle;
                    if (!isFullRow && isLastRow) {
                        cardStyle = (idx) =>
                            row.length === 2
                                ? { width: "48%", marginRight: idx === 0 ? "4%" : 0 }
                                : { width: "100%" };
                    } else {
                        cardStyle = (idx) => ({
                            width: cardWidth,
                            marginRight: idx < numColumns - 1 ? gridSpacing : 0,
                        });
                    }
                    return (
                        <View style={styles.summaryGridRow} key={rowIdx}>
                            {row.map(([k, v], idx) => (
                                <View
                                    key={k}
                                    style={[
                                        styles.metricCard,
                                        { backgroundColor: colors.card },
                                        cardStyle(idx)
                                    ]}
                                >
                                    <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>
                                        {k.replace(/([A-Z])/g, ' $1').toUpperCase()}
                                    </Text>
                                    <Text style={[styles.metricValue, { color: colors.button }]}>
                                        {v ?? '—'}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={{ backgroundColor: colors.background }}>
                {loading && (
                    <View style={{ padding: 24, alignItems: 'center', justifyContent: 'center' }}>
                        <ActivityIndicator color={colors.button} size="large" />
                        <Text style={{ color: colors.text, marginTop: 12 }}>Loading...</Text>
                    </View>
                )}

                <View style={{ padding: 16 }}>
                    <Text style={[styles.title, { color: colors.button }]}>EVENT REPORT</Text>

                    {/* Download Button */}
                    <TouchableOpacity
                        style={[styles.downloadBtn, { backgroundColor: colors.button, opacity: downloading ? 0.7 : 1 }]}
                        onPress={handleExcelDownload}
                        disabled={downloading}
                    >
                        <Text style={{ color: colors.buttonText, fontWeight: 'bold', textAlign: 'center' }}>
                            {downloading ? 'DOWNLOADING...' : 'DOWNLOAD AS EXCEL'}
                        </Text>
                    </TouchableOpacity>

                    {/* Summary Metrics Grid */}
                    {summary && (
                        <View style={[styles.paper, { backgroundColor: 'transparent', elevation: 0 }]}>
                            <Text style={[styles.subtitle, { color: colors.text }]}>SUMMARY</Text>
                            {renderSummaryGrid(summary.metrics)}
                        </View>
                    )}

                    {/* Ticket Tiers */}
                    {summary?.ticketTiers?.length > 0 && (
                        <View style={[styles.paper, { backgroundColor: colors.card }]}>
                            <Text style={[styles.subtitle, { color: colors.text }]}>TICKET TIERS</Text>
                            <ScrollView horizontal style={{ marginBottom: 8 }}>
                                <View>
                                    <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: colors.dropdownBackground }]}>
                                        <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>NAME</Text>
                                        <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>PRICE</Text>
                                        <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>CAPACITY</Text>
                                        <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>PERKS</Text>
                                    </View>
                                    {summary.ticketTiers.map((t, i) => (
                                        <View key={i} style={styles.tableRow}>
                                            <Text style={[styles.tableCell, { color: colors.text }]}>{t.name.toUpperCase()}</Text>
                                            <Text style={[styles.tableCell, { color: colors.text }]}>{t.price}</Text>
                                            <Text style={[styles.tableCell, { color: colors.text }]}>{t.capacity}</Text>
                                            <Text style={[styles.tableCell, { color: colors.secondaryText }]}>{t.perks.join(', ').toUpperCase()}</Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}

                    {/* Submissions Table */}
                    <View style={{ marginBottom: 24, height: 320 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator>
                            <View>
                                {/* Table Header */}
                                <View style={[styles.tableRow, styles.tableHeaderRow, { backgroundColor: colors.dropdownBackground, minWidth: Math.max(900, (summary?.formSchema.length || 0) * 110 + 600) }]}>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>TIER</Text>
                                    {summary?.formSchema.map(f => (
                                        <Text key={f.id} style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>
                                            {f.label.toUpperCase()}
                                        </Text>
                                    ))}
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>VISITORS</Text>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>ENTRY TIMES</Text>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>EXIT TIMES</Text>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>FOOD</Text>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>FOOD TIMES</Text>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>GIFT</Text>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>GIFT TIMES</Text>
                                    <Text style={[styles.tableCell, styles.headerCell, { color: colors.text }]}>SUBMITTED AT</Text>
                                </View>

                                {/* Table Body: scrollable vertically */}
                                <ScrollView style={{ height: 260 }}>
                                    {submissions.map(sub => (
                                        <View key={sub._id} style={[styles.tableRow, { minWidth: Math.max(900, (summary?.formSchema.length || 0) * 110 + 600) }]}>
                                            <Text style={[styles.tableCell, { color: colors.text }]}>{ticketMap[sub._id] || '—'}</Text>
                                            {summary.formSchema.map(fld => {
                                                const resp = sub.responses.find(r => r.fieldId === fld.id);
                                                return (
                                                    <Text key={fld.id} style={[styles.tableCell, { color: colors.text }]}>
                                                        {renderCell(resp?.value)}
                                                    </Text>
                                                );
                                            })}
                                            <Text style={[styles.tableCell, { color: colors.text }]}>{displayVal(sub.visitorCount)}</Text>
                                            <Text style={[styles.tableCell, { color: colors.secondaryText }]}>{renderCell(sub.entryTime)}</Text>
                                            <Text style={[styles.tableCell, { color: colors.secondaryText }]}>{renderCell(sub.exitTime)}</Text>
                                            <Text style={[styles.tableCell, { color: colors.button }]}>{displayVal(sub.food)}</Text>
                                            <Text style={[styles.tableCell, { color: colors.secondaryText }]}>{renderCell(sub.foodTime)}</Text>
                                            <Text style={[styles.tableCell, { color: colors.button }]}>{displayVal(sub.gift)}</Text>
                                            <Text style={[styles.tableCell, { color: colors.secondaryText }]}>{renderCell(sub.giftTime)}</Text>
                                            <Text style={[styles.tableCell, { color: colors.text }]}>{displayVal(sub.submittedAt)}</Text>
                                        </View>
                                    ))}
                                    {!loading && submissions.length === 0 && (
                                        <View style={styles.tableRow}>
                                            <Text style={[styles.tableCell, { color: colors.cancelButton, textAlign: 'center', flex: 1 }]}>
                                                NO SUBMISSIONS
                                            </Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        </ScrollView>
                    </View>
                </View>

                {/* Snackbar */}
                {snackbar.visible && (
                    <View style={[
                        styles.snackbar,
                        {
                            backgroundColor: snackbar.severity === 'error' ? colors.cancelButton : colors.button,
                        }
                    ]}>
                        <Text style={{ color: colors.buttonText }}>{snackbar.message}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 20,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 10,
    },
    downloadBtn: {
        alignSelf: 'flex-start',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginBottom: 18,
        marginTop: 4,
    },
    paper: {
        borderRadius: 10,
        marginBottom: 22,
        padding: 14,
        elevation: 1,
    },
    subtitle: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 10,
    },
    summaryGridWrap: {
        marginHorizontal: -6,
    },
    summaryGridRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    metricCard: {
        borderRadius: 9,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        marginLeft: 6,
        marginRight: 6,
        minHeight: 80,
    },
    metricLabel: {
        fontSize: 12,
        marginBottom: 5,
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
        minHeight: 36,
        paddingVertical: 5,
    },
    tableHeaderRow: {
        borderBottomWidth: 2,
    },
    headerCell: {
        fontWeight: 'bold',
        fontSize: 12,
        paddingVertical: 3,
    },
    tableCell: {
        fontSize: 11,
        paddingHorizontal: 6,
        flex: 1,
        flexWrap: 'wrap',
        minWidth: 70,
    },
    snackbar: {
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 40,
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
});
