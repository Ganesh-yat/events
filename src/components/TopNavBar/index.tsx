import React, { useState } from "react";
import {
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useGlobalInfo } from "../../context/GlobalContext";
import navItems from "../../lib/config/navItems";

const TopNavBar: React.FC = () => {
    const navigation = useNavigation<any>();
    const [menuVisible, setMenuVisible] = useState(false);

    const { userType, theme, changeTheme, colors, changeEvent, changeIsLoggedIn } = useGlobalInfo();
    const items = navItems[userType] || [];

    return (
        <SafeAreaView style={{ backgroundColor: colors.background }}>
            {/* Top bar */}
            <View
                style={[
                    styles.container,
                    { borderBottomColor: colors.secondaryText },
                ]}
            >
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Text style={[styles.menuIcon, { color: colors.button }]}>☰</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Events
                    </Text>
                </TouchableOpacity>

                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => changeTheme(theme === "light" ? "dark" : "light")}
                    >
                        <Text style={styles.icon}>{theme === "light" ? "🌙" : "☀️"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {/* your notif logic */ }}>
                        <Text style={[styles.icon, { color: colors.text }]}>🔔</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                        <Text style={[styles.icon, { color: colors.text }]}>👤</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal transparent visible={menuVisible} animationType="slide">
                <TouchableOpacity
                    style={[styles.overlay, { backgroundColor: colors.overlay }]}
                    activeOpacity={1}
                    onPressOut={() => setMenuVisible(false)}
                >
                    <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                        {items.map((item, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    if (item.path === "Login") {
                                        changeIsLoggedIn(false);
                                        return
                                    } else {
                                        changeEvent(null);
                                        navigation.navigate(item.path);
                                    }
                                }}
                            >
                                <Image
                                    source={
                                        item.icon.startsWith("http")
                                            ? { uri: item.icon }
                                            : { uri: `https://your-cdn.com${item.icon}` }
                                    }
                                    style={[styles.iconImage, { tintColor: colors.button }]}
                                />
                                <Text style={[styles.menuText, { color: colors.text }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    menuIcon: {
        fontSize: 26,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    icon: {
        fontSize: 22,
        marginLeft: 16,
    },
    overlay: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
    menuContainer: {
        width: 240,
        padding: 16,
        paddingTop: 40,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    iconImage: {
        width: 20,
        height: 20,
        marginRight: 12,
        resizeMode: "contain",
    },
    menuText: {
        fontSize: 16,
    },
});

export default TopNavBar;
