import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useGlobalInfo } from "../../context/GlobalContext";
import { API_ROUTE } from "../../../config";
import { useNavigation } from "@react-navigation/native";
import TopNavBar from "../../components/TopNavBar";

const LandingPage = () => {
    const { userId, changeEvent, theme } = useGlobalInfo();
    console.log(userId, "landing page");
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(0);
    const rowsPerPage = 5;
    const navigation = useNavigation();

    const stats = [
        ['Events completed', events?.filter(e => e.status === 'completed').length],
        ['Total Events', events?.length],
        ['Total Registration', events?.reduce((sum, e) => sum + (e.registrations || 0), 0)],
        ['Total Participants', events?.reduce((sum, e) => sum + (e.participants || 0), 0)],
    ];

    const eventPayload = [{
        cover_image: "https://res.cloudinary.com/dovrpnbxe/image/upload/v1747848227/cx1sxhgj7qigcsbh61gc.jpg",
        description: "This is the static description",
        end_date: "2025:05:22",
        end_time: "23:00",
        event_images: [
            "https://res.cloudinary.com/dovrpnbxe/image/upload/v1747848228/inpjgb3qysrzvman4cuw.jpg",
            "https://res.cloudinary.com/dovrpnbxe/image/upload/v1747848229/upjkuudpbge9ocigeh2u.jpg",
            "https://res.cloudinary.com/dovrpnbxe/image/upload/v1747848229/pbbucoabh47qtt2y6ibt.jpg"
        ],
        food_tracking: true,
        gift_tracking: true,
        location: "chennai",
        logo_image: "https://res.cloudinary.com/dovrpnbxe/image/upload/v1747848227/q9baewl0z1k9trnay0zc.jpg",
        name: "event_102",
        public_event: true,
        start_date: "2025:05:22",
        start_time: "19:00",
        user: "681bc76f713723b2769a6bf5"
    }];

    useEffect(() => {
        if (!userId) return;

        const fetchEvents = async () => {
            try {
                const response = await fetch(`${API_ROUTE}/api/v1/event/userid/${userId}`);

                const result = await response.json();
                console.log(result);
                setEvents(result?.data || eventPayload);
            } catch (error) {
                console.error("Failed to fetch events", error);
                setEvents(eventPayload);
            }
        };

        fetchEvents();
    }, [userId]);

    const handleClick = (id) => {
        changeEvent(id);
        navigation.navigate("DashboardMain", { eventId: id });
    };

    const paginatedEvents = events.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const colors = Colors[theme];

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
            <TopNavBar />
            {/* Top Cards */}
            <View style={styles.cardContainer}>
                {stats.map(([label, value]) => (
                    <View style={[styles.statCard, { backgroundColor: colors.dropdownBackground }]} key={label}>
                        <Text style={[styles.statLabel, { color: colors.text }]}>{label}</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
                    </View>
                ))}
            </View>

            {/* Event List */}
            <Text style={[styles.title, { color: colors.text }]}>Latest Events</Text>
            <View style={[styles.tableHeader, { backgroundColor: colors.card }]}>
                <Text style={[styles.tableCellHeader, { color: colors.secondaryText }]}>Name</Text>
                <Text style={[styles.tableCellHeader, { color: colors.secondaryText }]}>Start Date</Text>
                <Text style={[styles.tableCellHeader, { color: colors.secondaryText }]}>End Date</Text>
                <Text style={[styles.tableCellHeader, { color: colors.secondaryText }]}>Public</Text>
            </View>

            {paginatedEvents.map((item, index) => (
                <TouchableOpacity
                    key={item._id || index}
                    style={[styles.tableRow, { borderColor: colors.overlay }]}
                    onPress={() => handleClick(item._id)}
                >
                    <Text style={[styles.tableCell, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.tableCell, { color: colors.secondaryText }]}>
                        {new Date(item.start_date || item.startDate).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.tableCell, { color: colors.secondaryText }]}>
                        {new Date(item.end_date).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.tableCell, { color: colors.secondaryText }]}>
                        {item.public_event ? "Yes" : "No"}
                    </Text>
                </TouchableOpacity>
            ))}

            {/* Pagination Buttons */}
            <View style={styles.pagination}>
                <TouchableOpacity
                    disabled={page === 0}
                    onPress={() => setPage((prev) => Math.max(prev - 1, 0))}
                >
                    <Text style={[
                        styles.pageBtn,
                        {
                            backgroundColor: colors.button,
                            color: colors.buttonText,
                            opacity: page === 0 ? 0.6 : 1
                        }
                    ]}>
                        Prev
                    </Text>
                </TouchableOpacity>
                <Text style={[styles.pageLabel, { color: colors.text }]}>Page {page + 1}</Text>
                <TouchableOpacity
                    disabled={(page + 1) * rowsPerPage >= events.length}
                    onPress={() => setPage((prev) => prev + 1)}
                >
                    <Text style={[
                        styles.pageBtn,
                        {
                            backgroundColor: colors.button,
                            color: colors.buttonText,
                            opacity: (page + 1) * rowsPerPage >= events.length ? 0.6 : 1
                        }
                    ]}>
                        Next
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    cardContainer: {
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    statCard: {
        width: "47%",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    statLabel: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        padding: 16
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        alignItems: "center",
    },
    pageBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        fontWeight: "bold",
        overflow: "hidden",
        marginHorizontal: 2,
    },
    pageLabel: {
        padding: 16,
        fontWeight: "bold",
        fontSize: 16,
    },
    tableHeader: {
        flexDirection: "row",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        marginBottom: 2,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        paddingVertical: 18,
        paddingHorizontal: 16,
    },
    tableCellHeader: {
        flex: 1,
        fontWeight: "bold",
        fontSize: 14,
    },
    tableCell: {
        flex: 1,
        fontSize: 13,
    },
});

export default LandingPage;
