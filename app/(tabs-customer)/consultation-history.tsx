import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, MessageCircle, Video, MapPin, Calendar, Clock, Star, Download } from 'lucide-react-native';

export default function ConsultationHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'upcoming'>('all');

  const consultations = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Wilson',
      specialty: 'Reproductive Health',
      date: '2024-12-20',
      time: '2:00 PM',
      type: 'online',
      status: 'completed',
      rating: 5,
      notes: 'Discussed menstrual cycle irregularities. Recommended lifestyle changes.',
      prescription: 'Iron supplements, Vitamin D',
      followUp: '2025-01-20',
    },
    {
      id: 2,
      doctorName: 'Dr. Emma Johnson',
      specialty: 'Sexual Health',
      date: '2024-12-22',
      time: '10:30 AM',
      type: 'in-person',
      status: 'upcoming',
      rating: null,
      notes: null,
      prescription: null,
      followUp: null,
    },
    {
      id: 3,
      doctorName: 'Dr. Michael Chen',
      specialty: 'General Health',
      date: '2024-12-15',
      time: '3:00 PM',
      type: 'online',
      status: 'completed',
      rating: 4,
      notes: 'General health checkup. All vitals normal.',
      prescription: 'Multivitamins',
      followUp: '2025-03-15',
    },
  ];

  const filteredConsultations = consultations.filter(consultation => {
    if (activeTab === 'all') return true;
    return consultation.status === activeTab;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={14}
        color="#FFB74D"
        fill={index < rating ? "#FFB74D" : "transparent"}
      />
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-healthcare-success/20 text-healthcare-success';
      case 'upcoming': return 'bg-healthcare-warning/20 text-healthcare-warning';
      default: return 'bg-gray-200 text-gray-600';
    }
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
              Consultation History
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {consultations.filter(c => c.status === 'completed').length}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Completed</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">
                {consultations.filter(c => c.status === 'upcoming').length}
              </Text>
              <Text className="text-healthcare-text/70 text-sm">Upcoming</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-healthcare-text">4.5</Text>
              <Text className="text-healthcare-text/70 text-sm">Avg Rating</Text>
            </Card>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'completed', label: 'Completed' },
              { key: 'upcoming', label: 'Upcoming' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 py-2 rounded-md ${
                  activeTab === tab.key 
                    ? 'bg-white shadow-sm' 
                    : ''
                }`}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text className={`text-center font-medium ${
                  activeTab === tab.key 
                    ? 'text-healthcare-primary' 
                    : 'text-healthcare-text/60'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consultation List */}
        <ScrollView className="flex-1 px-6">
          {filteredConsultations.map((consultation) => (
            <Card key={consultation.id} className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-healthcare-accent rounded-full items-center justify-center">
                    <Text className="text-white font-semibold">
                      {consultation.doctorName.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View className="ml-3">
                    <Text className="text-healthcare-text font-semibold">
                      {consultation.doctorName}
                    </Text>
                    <Text className="text-healthcare-text/60 text-sm">
                      {consultation.specialty}
                    </Text>
                  </View>
                </View>
                
                <View className={`px-2 py-1 rounded-full ${getStatusColor(consultation.status)}`}>
                  <Text className="text-xs font-medium capitalize">
                    {consultation.status}
                  </Text>
                </View>
              </View>

              {/* Date and Type */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <Calendar size={16} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-2">
                    {consultation.date} at {consultation.time}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {consultation.type === 'online' ? (
                    <Video size={16} color="#B2DFDB" />
                  ) : (
                    <MapPin size={16} color="#B2DFDB" />
                  )}
                  <Text className="text-healthcare-accent ml-1 text-sm capitalize">
                    {consultation.type}
                  </Text>
                </View>
              </View>

              {/* Rating (for completed consultations) */}
              {consultation.status === 'completed' && consultation.rating && (
                <View className="flex-row items-center mb-3">
                  <Text className="text-healthcare-text text-sm mr-2">Your rating:</Text>
                  <View className="flex-row">
                    {renderStars(consultation.rating)}
                  </View>
                </View>
              )}

              {/* Notes and Prescription (for completed consultations) */}
              {consultation.status === 'completed' && (
                <View className="mb-3">
                  {consultation.notes && (
                    <View className="mb-2">
                      <Text className="text-healthcare-text font-medium text-sm">Notes:</Text>
                      <Text className="text-healthcare-text/70 text-sm">{consultation.notes}</Text>
                    </View>
                  )}
                  {consultation.prescription && (
                    <View className="mb-2">
                      <Text className="text-healthcare-text font-medium text-sm">Prescription:</Text>
                      <Text className="text-healthcare-text/70 text-sm">{consultation.prescription}</Text>
                    </View>
                  )}
                  {consultation.followUp && (
                    <View>
                      <Text className="text-healthcare-text font-medium text-sm">Follow-up:</Text>
                      <Text className="text-healthcare-text/70 text-sm">{consultation.followUp}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                {consultation.status === 'upcoming' ? (
                  <View className="flex-row gap-2 flex-1">
                    <Button title="Join Call" size="small" className="flex-1" />
                    <Button title="Reschedule" variant="outline" size="small" className="flex-1" />
                  </View>
                ) : (
                  <View className="flex-row gap-2 flex-1">
                    <Button title="Book Again" size="small" className="flex-1" />
                    <TouchableOpacity className="bg-healthcare-secondary/30 rounded-lg px-3 py-2 flex-row items-center">
                      <Download size={16} color="#F8BBD9" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}