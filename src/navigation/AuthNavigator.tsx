// import React from "react";
// import { createStackNavigator } from "@react-navigation/stack";
// import LoginScreen from "./screens/LoginScreen";
// import DashboardScreen from "./screens/DashboardScreen"; 

// const Stack = createStackNavigator();

// export default function AppNavigator({ isLoggedIn }: { isLoggedIn: boolean }) {
//     console.log("eneter - apppnaviagation",isLoggedIn);
//     return (
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//             <Stack.Screen name="Login" component={LoginScreen} />
//             {/* {!isLoggedIn ? (
//                 <Stack.Screen name="Login" component={LoginScreen} />
//             ) : (
//                 <Stack.Screen name="Dashboard" component={DashboardScreen} />
//             )} */}
//         </Stack.Navigator>
//     );
// }


import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import EmailVerificationScreen from "../screens/auth/ResetPasswordScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        </Stack.Navigator>
    );
}
