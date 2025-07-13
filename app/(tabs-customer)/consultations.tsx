import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { consultationBookingService } from '@/services/consultationBookingService';
import { consultationScheduleService } from '@/services/consultationScheduleService';
import dayjs from 'dayjs';

interface Slot {
  label: string;
  start: string;
  end: string;
}

export default function ConsultationsScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [availableCounselors, setAvailableCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const slots: Slot[] = [
    { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
    { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
    { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
    { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
    { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
    { label: '16:00 - 17:00', start: '16:00', end: '17:00' },
  ];

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!user?._id) return;
      try {
        const res = await consultationBookingService.getCustomerByAccountId(user._id);
        setCustomerId(res._id);
      } catch {
        Alert.alert('Lỗi', 'Không thể lấy thông tin khách hàng');
      }
    };
    fetchCustomer();
  }, [user]);

  const fetchCounselors = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const res = await consultationScheduleService.getAvailableCounselorsBySlot(
        dateStr,
        selectedSlot.start,
        selectedSlot.end
      );
      setAvailableCounselors(res);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải danh sách tư vấn viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setAvailableCounselors([]);
  };

  const handleBooking = async (counselorId: string, accountName: string) => {
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const schedules = await consultationScheduleService.getSchedulesByCounselorAndDate(
        counselorId,
        dateStr
      );

      const matched = schedules.find((s: any) =>
        dayjs(s.startTime).format('HH:mm') === selectedSlot?.start
      );

      if (!matched || !matched._id) {
        return Alert.alert(
          'Không có lịch phù hợp',
          'Tư vấn viên không có lịch trống khớp khung giờ.'
        );
      }

      router.push({
        pathname: '/(tabs-customer)/consultation-payment',
        params: {
          scheduleId: matched._id,
          customerId: customerId!,
          doctorId: counselorId,
          doctorName: accountName,
          slotTime: selectedSlot!.label,
          price: matched.price.toString(),
          date: dateStr,
          startTime: selectedSlot!.start,
        },
      });
    } catch (error: any) {
      console.error("❌ Đặt lịch thất bại:", error?.response?.data || error.message);
      Alert.alert('Lỗi', error?.response?.data?.message || error.message || 'Không thể đặt lịch.');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-xl font-bold mb-4">Chọn ngày</Text>

        <TouchableOpacity
          className="border px-4 py-3 rounded-lg bg-gray-100 mb-4"
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{selectedDate.toLocaleDateString('vi-VN')}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}

        <Text className="text-xl font-bold mt-6 mb-2">Chọn khung giờ</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {slots.map(slot => (
            <TouchableOpacity
              key={slot.label}
              className={`px-4 py-2 rounded-lg border ${selectedSlot?.label === slot.label ? 'bg-pink-300' : 'bg-gray-200'}`}
              onPress={() => handleSlotSelect(slot)}
            >
              <Text>{slot.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedSlot && (
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg mb-6"
            onPress={fetchCounselors}
          >
            <Text className="text-white text-center">Tìm tư vấn viên rảnh</Text>
          </TouchableOpacity>
        )}

        {loading && <Text>Đang tải danh sách tư vấn viên...</Text>}

        {availableCounselors.length > 0 && (
          <>
            <Text className="text-xl font-bold mb-2">Tư vấn viên khả dụng</Text>
            {availableCounselors.map(item => {
              const account = item.accountId;
              if (!account) return null;

              return (
                <TouchableOpacity
                  key={item._id}
                  className="border p-4 rounded-lg mb-2 bg-gray-100"
                  onPress={() => handleBooking(item._id, account.name)}
                >
                  <Text className="font-semibold">{account.name}</Text>
                  <Text className="text-sm text-gray-600">{item.degree}</Text>
                  <Text className="text-xs text-gray-500">{item.experience} năm kinh nghiệm</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
