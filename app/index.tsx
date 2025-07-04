import { Redirect } from 'expo-router';

export default function Index() {
  // Check if user is authenticated
  // For now, redirect to auth
  return <Redirect href="/(auth)/login" />;
}