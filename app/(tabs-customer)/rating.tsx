import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star } from 'lucide-react-native';
import { consultationBookingService } from '@/services/consultationBookingService';
import { useAuth } from '@/contexts/AuthContext'; // ← nếu bạn có dùng AuthContext
import AsyncStorage from '@react-native-async-storage/async-storage'; // nếu token được lưu trong AsyncStorage

export default function RatingScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const { user } = useAuth(); // Lấy user từ context (nếu có)

  useEffect(() => {
    console.log('📌 bookingId:', bookingId);
    console.log('👤 user hiện tại:', user);
  }, [bookingId, user]);

  const handleSubmit = async () => {
    if (!bookingId) {
      Alert.alert('❌ Lỗi', 'Thiếu bookingId.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); // nếu token lưu trong AsyncStorage
      console.log('🔐 Token đang dùng:', token);

      console.log('📤 Gửi đánh giá với:', {
        rating,
        feedback,
      });

      await consultationBookingService.updateBooking(bookingId, {
        rating,
        feedback,
      });

      Alert.alert('✅ Cảm ơn bạn!', 'Đánh giá của bạn đã được ghi nhận.');
      router.back();
    } catch (err: any) {
      console.error('❌ Lỗi khi gửi đánh giá:', err?.response?.data || err);

      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? 'Bạn không có quyền đánh giá booking này.'
          : 'Không thể gửi đánh giá. Vui lòng thử lại sau.');

      Alert.alert('❌ Lỗi', message);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold text-center mb-6">Đánh giá buổi tư vấn</Text>

      <Text className="text-lg font-medium mb-2">Mức độ hài lòng:</Text>
      <View className="flex-row mb-6">
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity key={value} onPress={() => setRating(value)}>
            <Star
              size={32}
              color={value <= rating ? '#facc15' : '#d1d5db'}
              fill={value <= rating ? '#facc15' : 'none'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-lg font-medium mb-2">Nhận xét của bạn:</Text>
      <TextInput
        multiline
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Hãy chia sẻ trải nghiệm của bạn..."
        className="border border-gray-300 rounded-lg p-3 h-32 text-base text-gray-800 mb-6"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-blue-600 py-3 rounded-lg"
      >
        <Text className="text-white text-center text-lg font-semibold">Gửi đánh giá</Text>
      </TouchableOpacity>
    </View>
  );
}
