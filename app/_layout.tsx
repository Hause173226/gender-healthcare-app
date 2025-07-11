// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// export default function RootLayout() {
//   useFrameworkReady();

//   return (
//     <>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(auth)" />
//         <Stack.Screen name="(tabs-customer)" />
//         <Stack.Screen name="(tabs-staff)" />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </>
//   );
// }

import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </AuthProvider>
  );
}
