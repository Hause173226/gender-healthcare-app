import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Star, Video, Download } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { consultationBookingService, ConsultationBookingPopulated, BookingStatus } from '@/services/consultationBookingService';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import dayjs from 'dayjs';

export default function ConsultationHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'confirmed'>('all');
  const [bookings, setBookings] = useState<ConsultationBookingPopulated[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!user?._id) return;
        const data = await consultationBookingService.getBookingsByCustomer(user._id);
        setBookings(data);
      } catch (err) {
        console.error('❌ Lỗi khi fetch bookings:', err);
      }
    };
    fetch();
  }, [user]);

  const filteredConsultations = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <View className="flex-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            color="#FFB74D"
            fill={i < rating ? '#FFB74D' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'confirmed': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-gray-200 text-gray-500';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#2C3E50" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">Consultation History</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-gray-800">
                {bookings.filter((b) => b.status === 'completed').length}
              </Text>
              <Text className="text-gray-500 text-sm">Completed</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-gray-800">
                {bookings.filter((b) => b.status === 'confirmed').length}
              </Text>
              <Text className="text-gray-500 text-sm">Upcoming</Text>
            </Card>
            <Card className="flex-1 items-center py-3">
              <Text className="text-lg font-bold text-gray-800">-</Text>
              <Text className="text-gray-500 text-sm">Avg Rating</Text>
            </Card>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'completed', label: 'Completed' },
              { key: 'confirmed', label: 'Upcoming' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 py-2 rounded-md ${activeTab === tab.key ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text className={`text-center font-medium ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consultation List */}
        <ScrollView className="flex-1 px-6">
          {filteredConsultations.map((b) => {
            const doctor = b.scheduleId?.counselorId?.accountId;
            const start = dayjs(b.scheduleId?.startTime).format('HH:mm');
            const end = dayjs(b.scheduleId?.endTime).format('HH:mm');
            const date = dayjs(b.bookingDate).format('DD/MM/YYYY');

            return (
              <TouchableOpacity
                key={b._id}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs-customer)/booking-detail',
                    params: { bookingId: b._id },
                  })
                }
                className="mb-4"
              >
                <Card>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-pink-300 rounded-full items-center justify-center">
                        <Text className="text-white font-semibold">
                          {doctor?.name?.split(' ').map((n) => n[0]).join('')}
                        </Text>
                      </View>
                      <View className="ml-3">
                        <Text className="text-gray-900 font-semibold">{doctor?.name || '---'}</Text>
                        <Text className="text-gray-500 text-sm">General Counselor</Text>
                      </View>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${getStatusColor(b.status)}`}>
                      <Text className="text-xs font-medium capitalize">{b.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Calendar size={16} color="#F8BBD9" />
                      <Text className="text-gray-800 ml-2">
                        {date} at {start} - {end}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Video size={16} color="#B2DFDB" />
                      <Text className="text-pink-500 ml-1 text-sm">Online</Text>
                    </View>
                  </View>

                  {b.status === 'completed' && b.rating && (
                    <View className="flex-row items-center mb-3">
                      <Text className="text-gray-700 text-sm mr-2">Your rating:</Text>
                      {renderStars(b.rating)}
                    </View>
                  )}

                  {b.status === 'completed' && (
                    <View className="mb-3">
                      {b.feedback && (
                        <View className="mb-2">
                          <Text className="text-gray-700 font-medium text-sm">Feedback:</Text>
                          <Text className="text-gray-500 text-sm">{b.feedback}</Text>
                        </View>
                      )}
                      {b.result && (
                        <View className="mb-2">
                          <Text className="text-gray-700 font-medium text-sm">Result:</Text>
                          <Text className="text-gray-500 text-sm">{b.result}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
