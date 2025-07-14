import React, { useEffect, useState } from 'react';

import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { consultationBookingService, ConsultationBookingPopulated, BookingStatus } from '@/services/consultationBookingService';
import { counselorService, Counselor } from '@/services/counselorService';
import { Card } from '@/components/ui/Card';
import dayjs from 'dayjs';
import { useFocusEffect } from '@react-navigation/native';


export default function ConsultationHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'confirmed'>('all');
  const [bookings, setBookings] = useState<ConsultationBookingPopulated[]>([]);

  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        if (!user?._id) return;
        const [bookingData, counselorData] = await Promise.all([
          consultationBookingService.getBookingsByCustomer(user._id),
          counselorService.getAll()
        ]);
        setBookings(bookingData);
        setCounselors(counselorData);
        setSearchQuery('');
        setActiveTab('all');
      };
      fetch();
    }, [user?._id])
  );

  // 1. Filter by search
 const filteredBySearch = bookings.filter((b) => {
  const name = b.scheduleId?.counselorId?.accountId?.name?.toLowerCase() || '';
  return name.includes(searchQuery.trim().toLowerCase());
});
;

  // 2. Count filtered by search for each status
  const filteredCountByStatus = {
    all: filteredBySearch.length,
    completed: filteredBySearch.filter(b => b.status === 'completed').length,
    confirmed: filteredBySearch.filter(b => b.status === 'confirmed').length,
  };

  // 3. Apply tab filter
  const filteredConsultations = filteredBySearch.filter((b) =>
    activeTab === 'all' ? true : b.status === activeTab
  );


  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <View className="flex-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            color="#FFB74D"

            fill={i < rating ? '#FFB74D' : 'none'}
            stroke="#FFB74D"
          />
        ))}
      </View>
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'confirmed': return 'bg-yellow-100 text-yellow-700';

      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'missed': return 'bg-gray-100 text-gray-700';

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

            <Card className="flex-1 items-center py-3 rounded-xl shadow-sm border">
              <Text className="text-lg font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </Text>
              <Text className="text-sm text-gray-600">Success</Text>
            </Card>

            <Card className="flex-1 items-center py-3 rounded-xl shadow-sm border">
              <Text className="text-lg font-bold text-red-500">
                {bookings.filter((b) => b.status === 'missed' || b.status === 'cancelled').length}
              </Text>
              <Text className="text-sm text-gray-600">Unsuccess</Text>
            </Card>

            <Card className="flex-1 items-center py-3 rounded-xl shadow-sm border">
              <Text className="text-lg font-bold text-blue-500">
                {bookings.filter(b => b.status === 'confirmed').length}
              </Text>
              <Text className="text-sm text-gray-600">Upcoming</Text>
            </Card>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 mb-4">
          <View className="flex-row bg-gray-100 rounded-lg p-1">
            {[

              { key: 'all', label: `All (${filteredCountByStatus.all})` },
              { key: 'completed', label: `Completed (${filteredCountByStatus.completed})` },
              { key: 'confirmed', label: `Upcoming (${filteredCountByStatus.confirmed})` },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 py-2 rounded-lg ${activeTab === tab.key ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text className={`text-center font-medium ${activeTab === tab.key ? 'text-pink-600' : 'text-gray-500'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search bar */}
        <View className="px-6 mb-3">
          <View className="bg-gray-100 rounded-xl px-4 py-2">
            <TextInput
              placeholder="Search by counselor name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-base text-gray-800"
            />
          </View>
          {filteredConsultations.length > 0 && (
            <Text className="text-sm text-gray-500 mt-1">
              {filteredConsultations.length} result{filteredConsultations.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Consultation List */}
        <ScrollView className="flex-1 px-6">

          {filteredConsultations.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10">No consultation found.</Text>
          ) : (
            <>
              {filteredConsultations
                .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
                .map((b) => {
                  const counselorId = b.scheduleId?.counselorId?._id;
                  const counselor = counselors.find(c => c._id === counselorId);
                  const account = counselor?.accountId;
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
                      <Card className="rounded-2xl p-4 border shadow-sm bg-white">
                        <View className="flex-row items-center justify-between mb-3">
                          <View className="flex-row items-center">
                            {account?.image ? (
                              <Image source={{ uri: account.image }} className="w-12 h-12 rounded-full" />
                            ) : (
                              <View className="w-12 h-12 bg-pink-300 rounded-full items-center justify-center">
                                <Text className="text-white font-semibold">
                                  {account?.name?.split(' ').map((n) => n[0]).join('')}
                                </Text>
                              </View>
                            )}
                            <View className="ml-3">
                              <Text className="text-pink-700 font-semibold">{account?.name || '---'}</Text>
                              <Text className="text-gray-500 text-sm">{account?.gender || '---'}</Text>
                            </View>
                          </View>
                          <View className={`px-3 py-1 rounded-full ${getStatusColor(b.status)}`}>
                            <Text className="text-xs font-medium capitalize">{b.status}</Text>
                          </View>
                        </View>

                        <View className="flex-row items-center mb-3">
                          <Calendar size={16} color="#EC4899" />
                          <Text className="text-gray-800 ml-2 text-sm">
                            {date} at {start} - {end}
                          </Text>
                        </View>

                        {b.status === 'completed' && b.rating && (
                          <View className="flex-row items-center mb-3">
                            <Text className="text-gray-700 text-sm mr-2">Your rating:</Text>
                            {renderStars(b.rating)}
                          </View>
                        )}

                        {b.status === 'completed' && (
                          <View>
                            {b.feedback && (
                              <View className="mb-2">
                                <Text className="text-gray-700 font-semibold text-sm">Feedback:</Text>
                                <Text className="text-gray-600 text-sm">{b.feedback}</Text>
                              </View>
                            )}
                            {b.result && (
                              <View className="mb-2">
                                <Text className="text-gray-700 font-semibold text-sm">Result:</Text>
                                <Text className="text-gray-600 text-sm">{b.result}</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              <Text className="text-center text-gray-400 text-sm mt-6 mb-10">
                You have reached the end of the list
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
