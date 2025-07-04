import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Shield, Lock, Eye, EyeOff, Smartphone, Key, Trash2 } from 'lucide-react-native';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    twoFactorAuth: false,
    biometricLogin: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePrivacySetting = (key: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    Alert.alert('Success', 'Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft size={24} color="#2C3E50" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-healthcare-text">
              Privacy & Security
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Privacy Settings */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Privacy Settings
            </Text>
            
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Eye size={20} color="#F8BBD9" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Profile Visibility</Text>
                  <Text className="text-healthcare-text/60 text-sm">Allow others to see your profile</Text>
                </View>
              </View>
              <Switch
                value={privacySettings.profileVisibility}
                onValueChange={() => togglePrivacySetting('profileVisibility')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={privacySettings.profileVisibility ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Shield size={20} color="#F8BBD9" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Data Sharing</Text>
                  <Text className="text-healthcare-text/60 text-sm">Share anonymized data for research</Text>
                </View>
              </View>
              <Switch
                value={privacySettings.dataSharing}
                onValueChange={() => togglePrivacySetting('dataSharing')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={privacySettings.dataSharing ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Eye size={20} color="#F8BBD9" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Analytics Tracking</Text>
                  <Text className="text-healthcare-text/60 text-sm">Help improve our services</Text>
                </View>
              </View>
              <Switch
                value={privacySettings.analyticsTracking}
                onValueChange={() => togglePrivacySetting('analyticsTracking')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={privacySettings.analyticsTracking ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Shield size={20} color="#F8BBD9" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Marketing Emails</Text>
                  <Text className="text-healthcare-text/60 text-sm">Receive promotional content</Text>
                </View>
              </View>
              <Switch
                value={privacySettings.marketingEmails}
                onValueChange={() => togglePrivacySetting('marketingEmails')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={privacySettings.marketingEmails ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>
          </Card>

          {/* Security Settings */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Security Settings
            </Text>
            
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Key size={20} color="#B2DFDB" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Two-Factor Authentication</Text>
                  <Text className="text-healthcare-text/60 text-sm">Add extra security to your account</Text>
                </View>
              </View>
              <Switch
                value={privacySettings.twoFactorAuth}
                onValueChange={() => togglePrivacySetting('twoFactorAuth')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={privacySettings.twoFactorAuth ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Smartphone size={20} color="#B2DFDB" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Biometric Login</Text>
                  <Text className="text-healthcare-text/60 text-sm">Use fingerprint or face ID</Text>
                </View>
              </View>
              <Switch
                value={privacySettings.biometricLogin}
                onValueChange={() => togglePrivacySetting('biometricLogin')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={privacySettings.biometricLogin ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>
          </Card>

          {/* Change Password */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Change Password
            </Text>
            
            <Input
              label="Current Password"
              value={passwordData.currentPassword}
              onChangeText={(value) => setPasswordData(prev => ({ ...prev, currentPassword: value }))}
              secureTextEntry={!showPasswords.current}
              leftIcon={<Lock size={20} color="#A0AEC0" />}
              rightIcon={
                <TouchableOpacity onPress={() => togglePasswordVisibility('current')}>
                  {showPasswords.current ? (
                    <EyeOff size={20} color="#A0AEC0" />
                  ) : (
                    <Eye size={20} color="#A0AEC0" />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="New Password"
              value={passwordData.newPassword}
              onChangeText={(value) => setPasswordData(prev => ({ ...prev, newPassword: value }))}
              secureTextEntry={!showPasswords.new}
              leftIcon={<Lock size={20} color="#A0AEC0" />}
              rightIcon={
                <TouchableOpacity onPress={() => togglePasswordVisibility('new')}>
                  {showPasswords.new ? (
                    <EyeOff size={20} color="#A0AEC0" />
                  ) : (
                    <Eye size={20} color="#A0AEC0" />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChangeText={(value) => setPasswordData(prev => ({ ...prev, confirmPassword: value }))}
              secureTextEntry={!showPasswords.confirm}
              leftIcon={<Lock size={20} color="#A0AEC0" />}
              rightIcon={
                <TouchableOpacity onPress={() => togglePasswordVisibility('confirm')}>
                  {showPasswords.confirm ? (
                    <EyeOff size={20} color="#A0AEC0" />
                  ) : (
                    <Eye size={20} color="#A0AEC0" />
                  )}
                </TouchableOpacity>
              }
            />

            <Button title="Change Password" onPress={handleChangePassword} />
          </Card>

          {/* Data Management */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Data Management
            </Text>
            
            <View className="gap-3">
              <Button title="Download My Data" variant="outline" />
              <Button title="Export Health Records" variant="outline" />
              <Button title="Clear Cache" variant="outline" />
            </View>
          </Card>

          {/* Danger Zone */}
          <Card className="mb-6 border-2 border-healthcare-danger/20">
            <Text className="text-lg font-semibold text-healthcare-danger mb-4">
              Danger Zone
            </Text>
            
            <TouchableOpacity 
              className="flex-row items-center justify-center py-4 border border-healthcare-danger rounded-lg"
              onPress={handleDeleteAccount}
            >
              <Trash2 size={20} color="#E57373" />
              <Text className="text-healthcare-danger font-semibold ml-2">
                Delete Account
              </Text>
            </TouchableOpacity>
            
            <Text className="text-healthcare-text/60 text-sm mt-2 text-center">
              This action cannot be undone. All your data will be permanently deleted.
            </Text>
          </Card>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}