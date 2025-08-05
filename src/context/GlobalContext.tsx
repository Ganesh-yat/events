import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "../constants/Colors";

type ThemeType = keyof typeof Colors;

type GlobalContextType = {
    // Auth/user state
    isLoggedIn: boolean;
    user: string | null;
    userId: string | null;
    userType: string | null;
    token: string | null;
    // Theme
    theme: ThemeType;
    colors: typeof Colors["light"];
    event: string | null,
    // State setters
    changeIsLoggedIn: (v: boolean) => void;
    changeUser: (id: string | null) => void;
    changeUserId: (id: string | null) => void;
    changeUserType: (type: string | null) => void;
    changeTheme: (theme: ThemeType) => void;
    changeEvent: (event: string) => void;
    changeToken: (token: string | null) => void;
};

const defaultContext: GlobalContextType = {
    isLoggedIn: false,
    userId: null,
    userType: null,
    theme: "light",
    colors: Colors.light,
    event: "",
    user: "",
    token: null,
    changeIsLoggedIn: () => { },
    changeUserId: () => { },
    changeUserType: () => { },
    changeTheme: () => { },
    changeEvent: () => { },
    changeUser: () => { },
    changeToken: () => { },
};

const GlobalContext = createContext<GlobalContextType>(defaultContext);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {

    const systemTheme = useColorScheme() as ThemeType || "light";
    const [theme, setTheme] = useState<ThemeType>(systemTheme);

    useEffect(() => {
        setTheme(systemTheme);
    }, [systemTheme]);

    // Auth state
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Temporarily forced to false to show sign-up screen
    const [userId, setUserId] = useState<string | null>(null);
    const [userType, setUserType] = useState<string | null>(null);
    const [event, setEvent] = useState<string | null>("");
    const [user, setUser] = useState<string | null>("");
    const [token, setToken] = useState<string | null>(null);

    // Setters
    const changeIsLoggedIn = (v: boolean) => setIsLoggedIn(v);
    const changeUserId = (id: string | null) => setUserId(id);
    const changeUserType = (type: string | null) => setUserType(type);
    const changeTheme = (newTheme: ThemeType) => setTheme(newTheme);
    const changeEvent = (newEventId: string) => setEvent(newEventId);
    const changeUser = (newUserData: string | null) => setUser(newUserData);
    const changeToken = (newToken: string | null) => setToken(newToken);

    const colors = Colors[theme];

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                user,
                userId,
                userType,
                theme,
                colors,
                event,
                token,
                changeIsLoggedIn,
                changeUser,
                changeUserId,
                changeUserType,
                changeTheme,
                changeEvent,
                changeToken,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalInfo = () => useContext(GlobalContext);
