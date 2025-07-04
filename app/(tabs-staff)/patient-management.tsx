import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, User, Calendar, MessageCircle, FlaskConical, Phone, Video, Filter } from 'lucide-react-native';

export default function PatientManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');

  const patients = [
    {
      id: 1,
      name: 'Sarah Wilson',
      age: 28,
      lastVisit: '2024-12-20',
      status: 'active',
      upcomingAppointment: 'Dec 22, 2:00 PM',
      unreadMessages: 2,
      pendingTests: 1,
      avatar: 'SW',
    },
    {
      id: 2,
      name: 'Emma Johnson',
      age: 32,
      lastVisit: '2024-12-18',
      status: 'pending',
      upcomingAppointment: null,
      unreadMessages: 0,
      pendingTests: 0,
      avatar: 'EJ',
    },
    {
      id: 3,
      name: 'Michael Chen',
      age: 35,
      lastVisit: '2024-12-15',
      status: 'active',
      upcomingAppointment: 'Dec 24, 10:00 AM',
      unreadMessages: 1,
      pendingTests: 2,
      avatar: 'MC',
    },
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-healthcare-success/20 text-healthcare-success';
      case 'pending': return 'bg-healthcare-warning/20 text-healthcare-warning';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-healthcare-text mb-4">
            Patient Management
          </Text>
          
          {/* Search and Filter */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 relative">
              <Search size={20} color="#A0AEC0" className="absolute left-3 top-3 z-10" />
              <TextInput
                className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3"
                placeholder="Search patients..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <TouchableOpacity className="bg-white border border-gray-300 rounded-lg p-3">
              <Filter size={20} color="#A0AEC0" />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'pending', label: 'Pending' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 py-2 rounded-md ${
                  filterStatus === tab.key 
                    ? 'bg-white shadow-sm' 
                    : ''
                }`}
                onPress={() => setFilterStatus(tab.key as any)}
              >
                <Text className={`text-center font-medium ${
                  filterStatus === tab.key 
                    ? 'text-healthcare-accent' 
                    : 'text-healthcare-text/60'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">{patients.length}</Text>
              <Text className="text-healthcare-text/70 text-sm">Total Patients</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {patients.filter(p => p.status === 'active').length}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Active</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {patients.reduce((sum, p) => sum + p.unreadMessages, 0)}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Unread</Text>
            </Card>
          </View>
        </View>

        {/* Patient List */}
        <ScrollView className="flex-1 px-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-healthcare-primary rounded-full items-center justify-center">
                    <Text className="text-white font-semibold">{patient.avatar}</Text>
                  </View>
                  
                  <View className="ml-3 flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-healthcare-text font-semibold">
                        {patient.name}
                      </Text>
                      <View className={`px-2 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                        <Text className="text-xs font-medium capitalize">
                          {patient.status}
                        </Text>
                      </View>
                    </View>
                    
                    <Text className="text-healthcare-text/60 text-sm">
                      Age {patient.age} • Last visit: {patient.lastVisit}
                    </Text>
                    
                    {patient.upcomingAppointment && (
                      <Text className="text-healthcare-primary text-sm">
                        Next: {patient.upcomingAppointment}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Patient Stats */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <MessageCircle size={16} color="#F8BBD9" />
                  <Text className="text-healthcare-text text-sm ml-1">
                    {patient.unreadMessages} unread
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <FlaskConical size={16} color="#B2DFDB" />
                  <Text className="text-healthcare-text text-sm ml-1">
                    {patient.pendingTests} pending tests
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <Button title="Message" size="small" className="flex-1" />
                <TouchableOpacity className="bg-healthcare-secondary/30 rounded-lg px-3 py-2">
                  <Phone size={16} color="#F8BBD9" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-healthcare-accent/30 rounded-lg px-3 py-2">
                  <Video size={16} color="#B2DFDB" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}