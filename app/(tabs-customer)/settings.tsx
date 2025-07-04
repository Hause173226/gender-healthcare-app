import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Globe, Moon, Sun, Volume2, VolumeX, Smartphone, Download, RefreshCw } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    darkMode: false,
    soundEffects: true,
    hapticFeedback: true,
    autoSync: true,
    offlineMode: false,
    language: 'English',
    timezone: 'UTC-5 (EST)',
    units: 'Metric',
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const languages = ['English', 'Vietnamese', 'Spanish', 'French', 'German'];
  const timezones = ['UTC-5 (EST)', 'UTC-8 (PST)', 'UTC+0 (GMT)', 'UTC+7 (ICT)'];
  const unitSystems = ['Metric', 'Imperial'];

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
              Settings
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Appearance */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Appearance
            </Text>
            
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                {settings.darkMode ? (
                  <Moon size={20} color="#F8BBD9" />
                ) : (
                  <Sun size={20} color="#F8BBD9" />
                )}
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Dark Mode</Text>
                  <Text className="text-healthcare-text/60 text-sm">Switch to dark theme</Text>
                </View>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={() => toggleSetting('darkMode')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={settings.darkMode ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>

            {/* Language Selection */}
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Globe size={20} color="#F8BBD9" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Language</Text>
                  <Text className="text-healthcare-text/60 text-sm">{settings.language}</Text>
                </View>
              </View>
              <Text className="text-healthcare-text/40">›</Text>
            </TouchableOpacity>
          </Card>

          {/* Audio & Haptics */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Audio & Haptics
            </Text>
            
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                {settings.soundEffects ? (
                  <Volume2 size={20} color="#B2DFDB" />
                ) : (
                  <VolumeX size={20} color="#B2DFDB" />
                )}
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Sound Effects</Text>
                  <Text className="text-healthcare-text/60 text-sm">Play sounds for interactions</Text>
                </View>
              </View>
              <Switch
                value={settings.soundEffects}
                onValueChange={() => toggleSetting('soundEffects')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={settings.soundEffects ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Smartphone size={20} color="#B2DFDB" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Haptic Feedback</Text>
                  <Text className="text-healthcare-text/60 text-sm">Feel vibrations for interactions</Text>
                </View>
              </View>
              <Switch
                value={settings.hapticFeedback}
                onValueChange={() => toggleSetting('hapticFeedback')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={settings.hapticFeedback ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>
          </Card>

          {/* Data & Sync */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Data & Sync
            </Text>
            
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <RefreshCw size={20} color="#81C784" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Auto Sync</Text>
                  <Text className="text-healthcare-text/60 text-sm">Automatically sync your data</Text>
                </View>
              </View>
              <Switch
                value={settings.autoSync}
                onValueChange={() => toggleSetting('autoSync')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={settings.autoSync ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Download size={20} color="#81C784" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Offline Mode</Text>
                  <Text className="text-healthcare-text/60 text-sm">Access data without internet</Text>
                </View>
              </View>
              <Switch
                value={settings.offlineMode}
                onValueChange={() => toggleSetting('offlineMode')}
                trackColor={{ false: '#E2E8F0', true: '#F8BBD9' }}
                thumbColor={settings.offlineMode ? '#FFFFFF' : '#A0AEC0'}
              />
            </View>
          </Card>

          {/* Regional Settings */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Regional Settings
            </Text>
            
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Globe size={20} color="#FFB74D" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Timezone</Text>
                  <Text className="text-healthcare-text/60 text-sm">{settings.timezone}</Text>
                </View>
              </View>
              <Text className="text-healthcare-text/40">›</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center flex-1">
                <Globe size={20} color="#FFB74D" />
                <View className="ml-3 flex-1">
                  <Text className="text-healthcare-text">Units</Text>
                  <Text className="text-healthcare-text/60 text-sm">{settings.units}</Text>
                </View>
              </View>
              <Text className="text-healthcare-text/40">›</Text>
            </TouchableOpacity>
          </Card>

          {/* App Information */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              App Information
            </Text>
            
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Version</Text>
                <Text className="text-healthcare-text/60">1.0.0</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Build</Text>
                <Text className="text-healthcare-text/60">2024.12.21</Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Last Updated</Text>
                <Text className="text-healthcare-text/60">Dec 21, 2024</Text>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="pb-6 gap-3">
            <Button title="Check for Updates" variant="outline" />
            <Button title="Reset to Defaults" variant="outline" />
            <Button title="Clear App Cache" variant="outline" />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}