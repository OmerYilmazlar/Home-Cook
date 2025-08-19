import { Stack } from "expo-router";
import Colors from "@/constants/colors";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Log In" }} />
      <Stack.Screen name="signup" options={{ title: "Sign Up" }} />
      <Stack.Screen name="verify-email" options={{ title: "Verify Email" }} />
      <Stack.Screen name="verify-email-confirm" options={{ headerShown: false }} />
      <Stack.Screen name="user-type" options={{ title: "Select User Type" }} />
    </Stack>
  );
}