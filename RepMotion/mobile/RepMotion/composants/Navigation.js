import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// navigation interne
import Menu from "./Menu";

// écrans user
import EditProfile from "../ecrans/user/EditProfile";
import ResetPassword from "../ecrans/user/ResetPassword";

// auth
import Login from "./auth/Login";
import Register from "./auth/Register";
import ForgotPassword from "./auth/ForgotPassword";

// store
import { useAuthStore } from "../store/authStore";

//écran 
import CalibrationSetupScreen from "../ecrans/CalibrationSetupScreen";
import RepWeightConfiguratorTest from "../ecrans/RepWeightConfiguratorTest";

// debug/dev
import MotionDebugScreen from "../ecrans/debug/MotionDebugScreen";
import MotionCalibrationSessionScreen from "../ecrans/debug/MotionCalibrationSessionScreen";


const Stack = createNativeStackNavigator();

export default function Navigation() {
  const token = useAuthStore((s) => s.token);
  // const isAuthed = !!token;
  const isAuthed = true;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthed ? (
        <>
          {/* <Stack.Screen name="MotionDebugScreen" component={MotionDebugScreen} /> */}
          <Stack.Screen name="MotionCalibrationSessionScreen" component={MotionCalibrationSessionScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      ) : (
        <>
          <Stack.Screen name="menu" component={Menu} />

           <Stack.Screen
            name="CalibrationSetupScreen"
            component={CalibrationSetupScreen}
            options={{ headerShown: true, title: "" }}
          />
            <Stack.Screen
            name="RepWeightConfiguratorTest"
            component={RepWeightConfiguratorTest}
            options={{ headerShown: true, title: "" }}
          />


          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{ headerShown: true, title: "" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
