import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useGlobalInfo } from '../../../context/GlobalContext';
import { API_ROUTE } from '../../../../config';
import { Dimensions } from "react-native";

export default function Participants() {
    const { event: eventId, theme, token } = useGlobalInfo();
    const colors = Colors[theme];

    const [formExists, setFormExists] = useState(null);
    const [schema, setSchema] = useState(null);

    const [participants, setParticipants] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    const [filter, setFilter] = useState('All');
    const { height } = Dimensions.get('window');

    useEffect(() => {
        if (!eventId) {
            setFormExists(false);
            return;
        }
        setFormExists(null);
        setSchema(null);

        // Create authenticated headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        fetch(`${API_ROUTE}/api/v1/event/registration-form/eventId/${eventId}`, { headers })
            .then(res => {
                if (res.status === 404) {
                    setFormExists(false);
                    return null;
                }
                return res.json();
            })
            .then(forms => {
                if (forms && Array.isArray(forms) && forms.length > 0) {
                    setSchema(forms[0]);
                    setFormExists(true);
                } else if (forms !== null) {
                    setFormExists(false);
                }
            })
            .catch(() => {
                setFormExists(false);
            });
    }, [eventId]);

    useEffect(() => {
        if (!eventId || !formExists) return;
        setLoading(true);

        const params = new URLSearchParams({
            eventId,
            page: page.toString(),
            limit: rowsPerPage.toString(),
        });
        if (searchText.trim()) params.set('q', searchText.trim());

        fetch(`${API_ROUTE}/api/v1/event/participantSearch?${params}`, { headers })
            .then(r => r.json())
            .then(data => {
                setParticipants(data.results || []);
                setTotalPages(data.totalPages || 1);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [eventId, page, rowsPerPage, searchText, formExists]);

    const isPresent = (row) =>
        row.entryTime?.length && row.exitTime?.length &&
        row.entryTime[0] !== '00:00' && row.exitTime[0] !== '00:00';

    const filtered = participants.filter(row => {
        if (filter === 'All') return true;
        if (filter === 'Present') return isPresent(row);
        if (filter === 'Not Present') return !isPresent(row);
        return true;
    });

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {!eventId ? (
                <Text style={[styles.subtitle, { color: colors.cancelButton }]}>No event selected.</Text>
            ) : formExists === null ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                    <ActivityIndicator color={colors.button} />
                </View>
            ) : !formExists ? (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>No registration form found</Text>
                    <Text style={{ color: colors.secondaryText }}>
                        Please create a registration form first before viewing participants.
                    </Text>
                </View>
            ) : !schema ? (
                <Text>Loading form schema…</Text>
            ) : (
                <>
                    <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Event Participant live data</Text>
                    {/* <Text style={[styles.title, { color: colors.button }]}>Participant Overview</Text> */}
                    {/* Search */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <TextInput
                            style={[
                                {
                                    flex: 1,
                                    borderWidth: 1,
                                    borderColor: colors.dropdownBackground,
                                    borderRadius: 6,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    marginRight: 8,
                                    color: colors.text,
                                    backgroundColor: colors.card,
                                },
                            ]}
                            placeholder="Search"
                            placeholderTextColor={colors.secondaryText}
                            value={searchText}
                            onChangeText={setSearchText}
                            onSubmitEditing={() => setPage(1)}
                        />
                        <TouchableOpacity onPress={() => setPage(1)}>
                            <Text style={{ color: colors.button, fontWeight: 'bold' }}>Go</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Filter "Chips" */}
                    <View style={styles.filterContainer}>
                        {['All', 'Present', 'Not Present'].map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.chip,
                                    filter === option && { backgroundColor: colors.button, borderColor: colors.button },
                                    { borderColor: colors.dropdownBackground }
                                ]}
                                onPress={() => setFilter(option)}
                            >
                                <Text style={{
                                    color: filter === option ? colors.buttonText : colors.text,
                                    fontWeight: filter === option ? 'bold' : 'normal',
                                }}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Table header */}
                    <View style={{}}>

                        <View style={[
                            styles.tableHeader,
                            { backgroundColor: colors.dropdownBackground, borderColor: colors.secondaryText }
                        ]}>
                            {schema.fields.map(f => (
                                <Text key={f.id} style={[styles.tableCellHeader, { color: colors.text }]}>
                                    {f.label}
                                </Text>
                            ))}
                            <Text style={[styles.tableCellHeader, { color: colors.text }]}>Visitors</Text>
                            <Text style={[styles.tableCellHeader, { color: colors.text }]}>Entry Time</Text>
                            <Text style={[styles.tableCellHeader, { color: colors.text }]}>Exit Time</Text>
                            <Text style={[styles.tableCellHeader, { color: colors.text }]}>Gift</Text>
                            <Text style={[styles.tableCellHeader, { color: colors.text }]}>Food</Text>
                        </View>
                        <ScrollView style={{ maxHeight: height * 0.5 }}>
                            {loading ? (
                                <View style={{ padding: 32, alignItems: 'center' }}>
                                    <ActivityIndicator color={colors.button} />
                                </View>
                            ) : (
                                filtered.map((row, idx) => (
                                    <View key={row._id || idx} style={[
                                        styles.tableRow,
                                        { borderColor: colors.dropdownBackground }
                                    ]}>
                                        {schema.fields.map(f => {
                                            const resp = row.responses?.find(r => r.fieldId === f.id);
                                            let val = resp?.value ?? '';
                                            if (typeof val === 'boolean') val = val ? 'YES' : 'NO';
                                            else if (val && typeof val === 'object') {
                                                const { text, hyperlink } = val;
                                                if (text && hyperlink) val = text;
                                                else val = JSON.stringify(val);
                                            }
                                            return (
                                                <Text key={f.id} style={[styles.tableCell, { color: colors.text }]}>
                                                    {val}
                                                </Text>
                                            );
                                        })}
                                        <Text style={[styles.tableCell, { color: colors.text }]}>
                                            {row.visitorCount ?? 0}
                                        </Text>
                                        <Text style={[styles.tableCell, { color: colors.secondaryText }]}>
                                            {row.entryTime?.length
                                                ? new Date(row.entryTime[0]).toLocaleTimeString()
                                                : '—'}
                                        </Text>
                                        <Text style={[styles.tableCell, { color: colors.secondaryText }]}>
                                            {row.exitTime?.length
                                                ? new Date(row.exitTime[0]).toLocaleTimeString()
                                                : '—'}
                                        </Text>
                                        <Text style={[
                                            styles.tableCell,
                                            {
                                                color: row.gift == null
                                                    ? colors.secondaryText
                                                    : row.gift
                                                        ? colors.button
                                                        : colors.cancelButton,
                                                fontWeight: 'bold'
                                            }
                                        ]}>
                                            {row.gift == null ? '—' : row.gift ? 'YES' : 'NO'}
                                        </Text>
                                        <Text style={[
                                            styles.tableCell,
                                            {
                                                color: row.food == null
                                                    ? colors.secondaryText
                                                    : row.food
                                                        ? colors.button
                                                        : colors.cancelButton,
                                                fontWeight: 'bold'
                                            }
                                        ]}>
                                            {row.food == null ? '—' : row.food ? 'YES' : 'NO'}
                                        </Text>
                                    </View>
                                ))
                            )}

                        </ScrollView>
                        {/* Pagination */}
                        <View style={styles.pagination}>
                            <TouchableOpacity
                                disabled={page === 1}
                                onPress={() => setPage(prev => Math.max(prev - 1, 1))}
                            >
                                <Text style={[styles.pageBtn, { color: colors.button, opacity: page === 1 ? 0.5 : 1 }]}>Prev</Text>
                            </TouchableOpacity>
                            <Text style={[styles.pageLabel, { color: colors.text }]}>Page {page} of {totalPages}</Text>
                            <TouchableOpacity
                                disabled={page >= totalPages}
                                onPress={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                <Text
                                    style={[
                                        styles.pageBtn,
                                        {
                                            color: colors.button,
                                            opacity: page >= totalPages ? 0.5 : 1,
                                        },
                                    ]}
                                >
                                    Next
                                </Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                <Text style={{ color: colors.secondaryText }}>Rows:</Text>
                                {[10, 25, 50].map(n => (
                                    <TouchableOpacity key={n} onPress={() => { setRowsPerPage(n); setPage(1); }}>
                                        <Text style={[
                                            { marginHorizontal: 4, color: n === rowsPerPage ? colors.button : colors.text }
                                        ]}>
                                            {n}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        padding: 16,
    },
    subtitle: {
        paddingVertical: 12,
        marginBottom: 4,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    tableCellHeader: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 13,
        paddingHorizontal: 6,
    },
    tableCell: {
        flex: 1,
        fontSize: 13,
        paddingHorizontal: 6,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        flexWrap: 'wrap'
    },
    pageBtn: {
        fontSize: 14,
        paddingHorizontal: 10,
        paddingVertical: 2,
    },
    pageLabel: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
