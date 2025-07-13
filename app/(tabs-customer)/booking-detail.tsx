import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { consultationBookingService } from '@/services/consultationBookingService';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultationScheduleService } from '@/services/consultationScheduleService';


export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const router = useRouter();

  const fetchBooking = async () => {
    setBooking(null);
    try {
      const data = await consultationBookingService.getBookingById(bookingId as string);
      setBooking(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load booking information.');
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      fetchBooking();
    }, [bookingId])
  );

  const handleCancel = async () => {
    try {
      // 1. Cập nhật trạng thái booking thành 'cancelled'
      await consultationBookingService.updateBooking(bookingId as string, {
        status: 'cancelled',
      });

      // 2. Cập nhật lại status schedule là 'available'
      const scheduleId = booking.scheduleId?._id;
      if (scheduleId) {
        await consultationScheduleService.updateSchedule(scheduleId, {
          status: 'available',
        });
      }

      Alert.alert('✅ Cancelled', 'Your booking has been cancelled.');
      router.replace('/(tabs-customer)/consultation-history');
    } catch {
      Alert.alert('❌ Error', 'Unable to cancel the booking.');
    }
  };



  const goToRating = () => {
    router.push({
      pathname: '/(tabs-customer)/rating',
      params: { bookingId },
    });
  };

  if (!booking) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-2 text-gray-500">Loading...</Text>
      </View>
    );
  }

  const doctor = booking.scheduleId?.counselorId?.accountId;
  const time = `${booking.scheduleId?.startTime?.slice(11, 16)} - ${booking.scheduleId?.endTime?.slice(11, 16)}`;
  const date = booking.bookingDate?.slice(0, 10)?.split('-').reverse().join('/');
  const price = booking.scheduleId?.price || 0;
  const canRate =
    ['cancelled', 'missed', 'completed'].includes(booking.status) && !booking.rating;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.replace('/(tabs-customer)/consultation-history')} className="pr-4">
          <ArrowLeft size={24} color="#ec4899" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-pink-600">Booking Detail</Text>
      </View>

      <ScrollView className="flex-1 bg-white px-4 py-6">
        {/* Counselor Info */}
        <View className="bg-white p-4 rounded-xl shadow mb-6 border border-gray-100">
          <Text className="text-sm text-gray-400 mb-3">Counselor</Text>
          <View className="flex-row items-center">
            {doctor?.image ? (
              <Image source={{ uri: doctor.image }} className="w-16 h-16 rounded-full bg-gray-200" />
            ) : (
              <View className="w-16 h-16 rounded-full bg-pink-300 items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  {doctor?.name?.split(' ').map((n: string) => n[0]).join('') || '---'}
                </Text>
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold text-gray-800">{doctor?.name || '---'}</Text>
              <Text className="text-sm text-gray-500 mt-1">Gender: {doctor?.gender || '---'}</Text>
              <Text className="text-sm text-gray-500">Email: {doctor?.email || '---'}</Text>
              <Text className="text-sm text-gray-500">Phone: {doctor?.phone || '---'}</Text>
            </View>
          </View>
        </View>

        {/* Booking Info */}
        <View className="bg-white p-4 rounded-xl shadow mb-6 border border-gray-100">
          <Text className="text-sm text-gray-400 mb-1">Your Booking</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-700 font-medium">Date</Text>
            <Text className="text-gray-800">{date}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-700 font-medium">Time</Text>
            <Text className="text-gray-800">
              {booking.scheduleId?.startTime
                ? `${new Date(booking.scheduleId.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.scheduleId.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                : '---'}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-700 font-medium">Status</Text>
            <Text className="capitalize text-gray-800">{booking.status}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700 font-medium">Price</Text>
            <Text className="text-gray-800">{price.toLocaleString('vi-VN')}.000 VND</Text>
          </View>
        </View>

        {/* Result & Feedback */}
        {booking.status === 'completed' && (
          <View className="bg-white p-4 rounded-xl shadow mb-6 border border-gray-100">
            <Text className="text-sm text-gray-400 mb-1">Consultation Result</Text>
            {booking.result ? (
              <View className="mb-3">
                <Text className="text-gray-700 font-medium mb-1">Result</Text>
                <Text className="text-gray-600">{booking.result}</Text>
              </View>
            ) : (
              <Text className="text-gray-500 italic mb-3">No consultation result yet.</Text>
            )}

            {['completed', 'missed', 'cancelled'].includes(booking.status) && (
              <View className="bg-white p-4 rounded-xl shadow mb-6 border border-gray-100 items-center">
                {typeof booking.rating !== 'number' ? (
                  <Text className="text-gray-500 italic text-center">No rating provided.</Text>
                ) : (
                  <>
                    <Text className="text-yellow-500 text-2xl mb-1 text-center">
                      {'★'.repeat(booking.rating)}{'☆'.repeat(5 - booking.rating)}
                    </Text>
                    {booking.feedback && booking.feedback.trim() !== '' ? (
                      <View className="mt-2 px-2">
                        <Text className="text-gray-700 font-medium text-center mb-1">Feedback</Text>
                        <Text className="text-gray-600 text-center">{booking.feedback}</Text>
                      </View>
                    ) : (
                      <Text className="text-gray-500 italic text-center">No feedback provided.</Text>
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {(booking.status === 'missed' || booking.status === 'cancelled') && (
          <View className="bg-white p-4 rounded-xl shadow mb-6 border border-gray-100">
            <Text className="text-sm text-gray-400 mb-1">Consultation Result</Text>
            <Text className="text-gray-500 italic">
              No result due to the booking being {booking.status === 'missed' ? 'missed' : 'cancelled'}.
            </Text>
          </View>
        )}

        {/* Actions */}
        <View>
          {booking.status === 'confirmed' && (
            <TouchableOpacity onPress={handleCancel} className="bg-red-500 py-3 rounded-lg mb-3">
              <Text className="text-white text-center font-medium">Cancel Booking</Text>
            </TouchableOpacity>
          )}

          {canRate && (
            <TouchableOpacity onPress={goToRating} className="bg-yellow-500 py-3 rounded-lg">
              <Text className="text-white text-center font-medium">Rate</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
