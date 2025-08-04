import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useGlobalInfo } from '../../../context/GlobalContext';

const mockData = [
    { id: '#15267', date: 'Mar 1, 2023', amount: 100, questions: 1, status: 'Success' },
    { id: '#153587', date: 'Jan 26, 2023', amount: 300, questions: 3, status: 'Success' },
    { id: '#12436', date: 'Feb 12, 2033', amount: 100, questions: 1, status: 'Success' },
    { id: '#16879', date: 'Feb 12, 2033', amount: 500, questions: 5, status: 'Success' },
    { id: '#16378', date: 'Feb 28, 2033', amount: 500, questions: 5, status: 'Rejected' },
    { id: '#16609', date: 'March 13, 2033', amount: 100, questions: 1, status: 'Success' },
    { id: '#16907', date: 'March 18, 2033', amount: 100, questions: 1, status: 'Pending' },
];

export default function PaymentHistory() {
    const [filter, setFilter] = useState('All');
    const [page, setPage] = useState(0);
    const rowsPerPage = 5;

    const { theme } = useGlobalInfo();
    const colors = Colors[theme];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Success':
                return colors.button;
            case 'Pending':
                return colors.text;
            case 'Rejected':
                return colors.cancelButton || 'red';
            default:
                return colors.secondaryText;
        }
    };

    const filteredData = mockData.filter((item) => {
        if (filter === 'All') return true;
        return item.status.toLowerCase() === filter.toLowerCase();
    });

    const paginatedData = filteredData.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.button }]}>Payment History</Text>

            {/* Earnings Summary */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.summaryCarousel}
            >
                {/* Card 1 */}
                <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.summarySubtitle, { color: colors.secondaryText }]}>Total Earnings</Text>
                    <Text style={[styles.summaryAmount, { color: colors.button }]}>₹430.00</Text>
                    <Text style={[styles.summaryCaption, { color: colors.secondaryText }]}>as of 1-December-2022</Text>
                </View>
                {/* Card 2 */}
                <View style={[styles.summaryCard, { backgroundColor: colors.dropdownBackground }]}>
                    <Text style={[styles.summarySubtitle, { color: colors.secondaryText }]}>Pending Payments</Text>
                    <Text style={[styles.summaryAmount, { color: colors.secondaryText }]}>₹100.00</Text>
                    <Text style={[styles.summaryCaption, { color: colors.secondaryText }]}>as of 1-December-2022</Text>
                </View>
                {/* Card 3 */}
                <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.summarySubtitle, { color: colors.secondaryText }]}>Withdrawal Method</Text>
                    <View style={styles.withdrawalRow}>
                        <Text style={[styles.withdrawalText, { color: colors.text }]}>🏦 1502********4832</Text>
                        <View style={styles.iconRow}>
                            <Text style={{ color: colors.button, fontSize: 18, marginRight: 8 }}>✔️</Text>
                            <Text style={{ color: colors.cancelButton || 'red', fontSize: 18 }}>✖️</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Text style={[styles.subtitle, { color: colors.text }]}>Payment History</Text>

            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                {['All', 'Success', 'Pending', 'Rejected'].map((status) => (
                    <TouchableOpacity
                        key={status}
                        onPress={() => {
                            setFilter(status);
                            setPage(0);
                        }}
                        style={[
                            styles.chip,
                            filter === status && { backgroundColor: colors.button },
                        ]}
                        activeOpacity={0.7}
                    >
                        <Text style={{
                            color: filter === status ? colors.buttonText : colors.text,
                            fontWeight: filter === status ? 'bold' : 'normal',
                        }}>
                            {status === 'Success' ? 'Complete' : status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Table Header */}
            <View style={[styles.tableHeader, { borderColor: colors.dropdownBackground }]}>
                <Text style={[styles.cell, styles.headerCell, { color: colors.text }]}>Order ID</Text>
                <Text style={[styles.cell, styles.headerCell, { color: colors.text }]}>Date</Text>
                <Text style={[styles.cell, styles.headerCell, { color: colors.text }]}>Amount</Text>
                <Text style={[styles.cell, styles.headerCell, { color: colors.text }]}>Questions</Text>
                <Text style={[styles.cell, styles.headerCell, { color: colors.text }]}>Status</Text>
            </View>

            {/* Table Body */}
            {paginatedData.map((item, index) => (
                <View key={index} style={[styles.tableRow, { borderColor: colors.dropdownBackground }]}>
                    <Text style={[styles.cell, { color: colors.text }]}>{item.id}</Text>
                    <Text style={[styles.cell, { color: colors.secondaryText }]}>{item.date}</Text>
                    <Text style={[styles.cell, { color: colors.text }]}>₹{item.amount}</Text>
                    <Text style={[styles.cell, { color: colors.text }]}>{item.questions}</Text>
                    <Text style={[styles.cell, { color: getStatusColor(item.status), fontWeight: '600' }]}>
                        {item.status}
                    </Text>
                </View>
            ))}

            {/* Pagination */}
            <View style={styles.pagination}>
                <TouchableOpacity
                    onPress={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={page === 0}
                >
                    <Text style={[
                        styles.pageBtn,
                        { color: colors.button, opacity: page === 0 ? 0.5 : 1 }
                    ]}>Prev</Text>
                </TouchableOpacity>

                <Text style={[styles.pageLabel, { color: colors.text }]}>
                    Page {page + 1} of {totalPages}
                </Text>

                <TouchableOpacity
                    onPress={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                    disabled={page + 1 >= totalPages}
                >
                    <Text style={[
                        styles.pageBtn,
                        { color: colors.button, opacity: page + 1 >= totalPages ? 0.5 : 1 }
                    ]}>Next</Text>
                </TouchableOpacity>
            </View>
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
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 8,
    },
    summaryCarousel: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        marginBottom: 16,
    },
    summaryCard: {
        flex: 1,
        minWidth: 250,
        margin: 4,
        borderRadius: 10,
        padding: 12,
        elevation: 2,
    },
    summarySubtitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 18,
        paddingVertical: 10,
        fontWeight: 'bold',
    },
    summaryCaption: {
        fontSize: 12,
    },
    withdrawalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    withdrawalText: {
        fontSize: 14,
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'transparent',
        marginRight: 8,
        marginBottom: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingVertical: 12,
    },
    cell: {
        flex: 1,
        fontSize: 13,
    },
    headerCell: {
        fontWeight: 'bold',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    pageBtn: {
        fontSize: 14,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    pageLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
});
