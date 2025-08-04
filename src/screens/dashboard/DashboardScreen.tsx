import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView
} from "react-native";
import { useGlobalInfo } from "../../context/GlobalContext";
import TopNavBar from "../../components/TopNavBar";
import Polls from "./tabs/Poll";
import Email from "./tabs/EmailsMessage";
import Reports from "./tabs/Reports";
import PaymentHistory from "./tabs/PaymentHistory";
import ViewParticipants from "./tabs/ViewParticipants";
import SingleReg from "./tabs/SingleReg";
import BulkTicket from "./tabs/BulkTicket";
import ParticipantReg from "./tabs/ParticipantReg";
import Feedback from "./tabs/Feedback";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainAppStackParamList } from "../../navigation/MainAppNavigator";
import EventDashboard from "./tabs/EventDashboard";

type Props = NativeStackScreenProps<MainAppStackParamList, "DashboardMain">;

export default function DashboardScreen({ route, navigation }: Props) {

    const { eventId } = route.params || {};

    const { colors } = useGlobalInfo();
    const [activeTab, setActiveTab] = useState(0);

    const dashboardTabs = [
        { name: "Event Dashboard", component: <EventDashboard eventId={eventId} /> },
        { name: "Participant Registration", component: <ParticipantReg /> },
        // { name: "Bulk Ticket", component: <BulkTicket /> },
        { name: "Single Registration", component: <SingleReg /> },
        { name: "View Participants", component: <ViewParticipants /> },
        { name: "Feedback", component: <Feedback /> },
        { name: "Poll", component: <Polls /> },
        { name: "Payment History", component: <PaymentHistory /> },
        { name: "Email/Message", component: <Email /> },
        { name: "Reports", component: <Reports /> },
    ];

    return (
        <View style={{ backgroundColor: colors.background }}>
            <TopNavBar />

            {/* Tab Bar - fixed height, not scrollable vertically */}
            <ScrollView
                horizontal
                style={[styles.tabs, { backgroundColor: colors.card, borderColor: colors.overlay }]}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ alignItems: "center" }}
            >
                {dashboardTabs.map((tab, index) => {
                    const isActive = activeTab === index;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setActiveTab(index)}
                            style={[
                                styles.tabItem,
                                isActive && { borderBottomColor: colors.button, borderBottomWidth: 2 },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: isActive ? colors.button : colors.secondaryText,
                                        fontWeight: isActive ? "bold" : "normal",
                                    },
                                ]}
                            >
                                {tab.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={{}}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, backgroundColor: colors.background }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{height:700}}>
                        {dashboardTabs[activeTab]?.component}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    tabs: {
        // height:120,
        flexDirection: "row",
        paddingHorizontal: 10,
    },
    tabItem: {
        marginRight: 16,
        paddingVertical: 8,
    },
    tabText: {
        fontSize: 14,
    },
});
