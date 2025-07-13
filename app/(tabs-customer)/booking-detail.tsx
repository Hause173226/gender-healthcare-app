import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { consultationBookingService } from '@/services/consultationBookingService';

export default function BookingDetailScreen() {
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const router = useRouter();

  const fetchBooking = async () => {
    setBooking(null); // 🧼 Reset state trước khi fetch mới
    try {
      const data = await consultationBookingService.getBookingById(bookingId as string);
      setBooking(data);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể tải thông tin booking');
    }
  };

  // ✅ Fetch ngay lần đầu
  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  // ✅ Refetch khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      fetchBooking();
    }, [bookingId])
  );

  const handleCancel = async () => {
    try {
      await consultationBookingService.updateBooking(bookingId as string, {
        status: 'cancelled',
      });
      Alert.alert('✅ Huỷ thành công', 'Lịch đã được huỷ.');
      router.replace('/(tabs-customer)/consultation-history');
    } catch {
      Alert.alert('❌ Lỗi', 'Không thể huỷ.');
    }
  };

  const goToRating = () => {
    router.push({
      pathname: '/(tabs-customer)/rating',
      params: { bookingId },
    });
  };

  // 🌀 Loading UI
  if (!booking) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text className="mt-2 text-gray-500">Đang tải thông tin...</Text>
      </View>
    );
  }

  const doctor = booking.scheduleId?.counselorId?.accountId;
  const time = `${booking.scheduleId?.startTime?.slice(11, 16)} - ${booking.scheduleId?.endTime?.slice(11, 16)}`;
  const date = booking.bookingDate?.slice(0, 10)?.split('-').reverse().join('/');

  const canRate =
    ['completed', 'cancelled', 'missed'].includes(booking.status) && !booking.rating;

  return (
    <ScrollView className="p-4 bg-white">
      <Text className="text-xl font-bold mb-4 text-center">Chi tiết cuộc hẹn</Text>

      <View className="bg-gray-100 rounded-lg p-4 mb-4">
        <Text className="text-base mb-2">
          👤 Tư vấn viên: <Text className="font-semibold">{doctor?.name}</Text>
        </Text>
        <Text className="text-base mb-2">
          📅 Ngày: <Text className="font-semibold">{date}</Text>
        </Text>
        <Text className="text-base mb-2">
          ⏰ Giờ: <Text className="font-semibold">{time}</Text>
        </Text>
        <Text className="text-base mb-2">
          📌 Trạng thái: <Text className="font-semibold capitalize">{booking.status}</Text>
        </Text>
      </View>

      <View className="flex-row gap-3">
        {booking.status === 'confirmed' && (
          <TouchableOpacity
            onPress={handleCancel}
            className="flex-1 bg-red-500 p-3 rounded-lg mb-3"
          >
            <Text className="text-white text-center font-medium">Huỷ lịch hẹn</Text>
          </TouchableOpacity>
        )}

        {canRate && (
          <TouchableOpacity
            onPress={goToRating}
            className="flex-1 bg-yellow-500 p-3 rounded-lg mb-3"
          >
            <Text className="text-white text-center font-medium">Đánh giá</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
