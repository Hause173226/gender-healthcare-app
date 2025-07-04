import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, Video, MapPin, User } from 'lucide-react-native';

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState('today');

  const todayAppointments = [
    {
      id: 1,
      patientName: 'Sarah Wilson',
      time: '09:00 AM',
      type: 'online',
      duration: '30 min',
      topic: 'Cycle consultation',
      status: 'upcoming',
    },
    {
      id: 2,
      patientName: 'Emma Johnson',
      time: '10:30 AM',
      type: 'in-person',
      duration: '45 min',
      topic: 'STI testing consultation',
      status: 'upcoming',
    },
    {
      id: 3,
      patientName: 'Michael Chen',
      time: '02:00 PM',
      type: 'online',
      duration: '30 min',
      topic: 'Follow-up consultation',
      status: 'completed',
    },
  ];

  const weekStats = [
    {
      title: 'Total Appointments',
      value: '28',
      change: '+12%',
      color: '#B2DFDB',
    },
    {
      title: 'Online Sessions',
      value: '18',
      change: '+8%',
      color: '#E1F5FE',
    },
    {
      title: 'Avg Rating',
      value: '4.9',
      change: '+0.2',
      color: '#81C784',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-healthcare-text">
            My Schedule
          </Text>
          <Text className="text-healthcare-text/70 mt-1">
            Monday, December 21, 2024
          </Text>
        </View>

        {/* Week Stats */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            This Week
          </Text>
          <View className="flex-row justify-between">
            {weekStats.map((stat, index) => (
              <Card key={index} className="flex-1 mx-1 items-center py-4">
                <Text className="text-2xl font-bold text-healthcare-text">
                  {stat.value}
                </Text>
                <Text className="text-healthcare-text/70 text-sm text-center mb-1">
                  {stat.title}
                </Text>
                <Text className={`text-xs font-medium ${
                  stat.change.startsWith('+') ? 'text-healthcare-success' : 'text-healthcare-danger'
                }`}>
                  {stat.change}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <Button title="Add Appointment" size="small" className="flex-1" />
            <Button title="View Calendar" variant="outline" size="small" className="flex-1" />
            <Button title="Set Availability" variant="outline" size="small" className="flex-1" />
          </View>
        </View>

        {/* Today's Appointments */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Today's Appointments
          </Text>
          
          {todayAppointments.map((appointment) => (
            <Card key={appointment.id} className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-healthcare-accent rounded-full items-center justify-center">
                    <User size={20} color="white" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-healthcare-text font-semibold">
                      {appointment.patientName}
                    </Text>
                    <Text className="text-healthcare-text/60 text-sm">
                      {appointment.topic}
                    </Text>
                  </View>
                </View>
                <View className={`px-3 py-1 rounded-full ${
                  appointment.status === 'completed' 
                    ? 'bg-healthcare-success/20' 
                    : 'bg-healthcare-warning/20'
                }`}>
                  <Text className={`text-xs font-medium ${
                    appointment.status === 'completed' 
                      ? 'text-healthcare-success' 
                      : 'text-healthcare-warning'
                  }`}>
                    {appointment.status}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Clock size={16} color="#A0AEC0" />
                  <Text className="text-healthcare-text/60 ml-1 text-sm">
                    {appointment.time} ({appointment.duration})
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {appointment.type === 'online' ? (
                    <Video size={16} color="#B2DFDB" />
                  ) : (
                    <MapPin size={16} color="#B2DFDB" />
                  )}
                  <Text className="text-healthcare-accent ml-1 text-sm capitalize">
                    {appointment.type}
                  </Text>
                </View>
              </View>
              
              {appointment.status === 'upcoming' && (
                <View className="flex-row gap-2">
                  <Button title="Start Session" size="small" className="flex-1" />
                  <Button title="Reschedule" variant="outline" size="small" className="flex-1" />
                </View>
              )}
            </Card>
          ))}
        </View>

        {/* Upcoming This Week */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Upcoming This Week
          </Text>
          <Card>
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Tomorrow (Dec 22)</Text>
                <Text className="text-healthcare-primary font-semibold">5 appointments</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Wednesday (Dec 23)</Text>
                <Text className="text-healthcare-primary font-semibold">3 appointments</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-healthcare-text">Thursday (Dec 24)</Text>
                <Text className="text-healthcare-primary font-semibold">2 appointments</Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}