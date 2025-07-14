import React, { useEffect, useState } from 'react';
import {

  View, Text, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { consultationBookingService } from '@/services/consultationBookingService';
import { consultationScheduleService } from '@/services/consultationScheduleService';

import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { ArrowLeft } from 'lucide-react-native';

interface Slot {
  label: string;
  start: string;
  end: string;
}


const slots: Slot[] = [
  { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
  { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
  { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
  { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
  { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
  { label: '16:00 - 17:00', start: '16:00', end: '17:00' },
];

function ExpandableBio({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const toggle = () => setExpanded(!expanded);

  return (
    <View>
      <Text
        className="text-sm italic text-gray-500 mt-1"
        numberOfLines={expanded ? undefined : 1}
        onTextLayout={(e) => {
          if (e.nativeEvent.lines.length > 1) {
            setShowMore(true);
          }
        }}
      >
        {text}
      </Text>
      {showMore && (
        <TouchableOpacity onPress={toggle}>
          <Text className="text-pink-500 text-sm font-medium">
            {expanded ? 'See less' : 'See more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ConsultationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState(dayjs().toDate());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [availableCounselors, setAvailableCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);


  const days = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs().add(i, 'day');
    return {
      date: date.toDate(),
      label: i === 0 ? 'Today' : date.format('ddd'),
      dayNumber: date.date(),
    };
  });

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(dayjs().toDate());
      setSelectedSlot(null);
      setAvailableCounselors([]);
    }, [])
  );

  useEffect(() => {
    if (selectedSlot) fetchCounselors();
  }, [selectedDate, selectedSlot]);


  useEffect(() => {
    const fetchCustomer = async () => {
      if (!user?._id) return;
      try {
        const res = await consultationBookingService.getCustomerByAccountId(user._id);
        setCustomerId(res._id);
      } catch {

        Alert.alert('Error', 'Unable to fetch customer info');

      }
    };
    fetchCustomer();
  }, [user]);

  const fetchCounselors = async () => {
    if (!selectedSlot) return;
    setLoading(true);

    setAvailableCounselors([]);

    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const res = await consultationScheduleService.getAvailableCounselorsBySlot(
        dateStr,
        selectedSlot.start,
        selectedSlot.end
      );
      setAvailableCounselors(res);
    } catch {

      Alert.alert('Error', 'Unable to fetch available counselors');

    } finally {
      setLoading(false);
    }
  };


  const handleBooking = async (counselorId: string, accountName: string) => {
    try {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      const schedules = await consultationScheduleService.getSchedulesByCounselorAndDate(
        counselorId,
        dateStr
      );

      const matched = schedules.find(
        (s: any) => dayjs(s.startTime).format('HH:mm') === selectedSlot?.start
      );

      if (!matched?._id) {
        return Alert.alert('No suitable schedule', 'This time slot is no longer available.');
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

      Alert.alert('Error', error?.response?.data?.message || error.message || 'Failed to book appointment.');
    }
  };

  return (

    <View className="flex-1 bg-healthcare-light" style={{ paddingTop: insets.top }}>
      {/* Header màu hồng */}
      <View className=" flex-row px-4 py-3">
    
        <Text className="text-2xl font-bold text-healthcare-text">Booking Consultation</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-xl font-bold mb-3">Choose a date</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
          <View className="flex-row gap-3">
            {days.map(({ date, label, dayNumber }) => {
              const isSelected = dayjs(selectedDate).isSame(date, 'day');
              return (
                <TouchableOpacity
                  key={label + dayNumber}
                  onPress={() => setSelectedDate(date)}
                  className={`w-16 items-center py-2 rounded-xl border ${isSelected ? 'bg-pink-500 border-pink-600' : 'bg-white border-gray-300'}`}
                >
                  <Text className={`text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                    {label}
                  </Text>
                  <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-black'}`}>
                    {dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <Text className="text-xl font-bold mb-2">Choose a time slot</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.label === slot.label;
              return (
                <TouchableOpacity
                  key={slot.label}
                  className={`px-4 py-2 rounded-full border ${isSelected
                    ? 'bg-pink-500 border-pink-600'
                    : 'bg-white border-gray-300'
                    }`}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-black'}`}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {loading && (
          <View className="items-center mb-4">
            <ActivityIndicator size="small" color="#ec4899" />
            <Text className="text-gray-500 mt-2">Loading...</Text>
          </View>
        )}

        {!loading && selectedSlot && availableCounselors.length === 0 && (
          <Text className="text-center text-gray-400 italic mb-6">
            No available counselors
          </Text>
        )}

        {availableCounselors.length > 0 && (
          <>
            <Text className="text-xl font-bold mb-3">
              Available counselors ({availableCounselors.length})
            </Text>

            {availableCounselors.map((item) => {
              const account = item.accountId;
              if (!account) return null;

              return (
                <TouchableOpacity
                  key={item._id}

                  className="flex-row items-start space-x-4 border border-pink-300 bg-white rounded-2xl px-4 py-3 mb-4 shadow-sm"
                  onPress={() => handleBooking(item._id, account.name)}
                >
                  <View className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden items-center justify-center">
                    {account.image ? (
                      <Image
                        source={{ uri: account.image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-gray-500 text-xl">👤</Text>
                    )}
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-semibold text-pink-700">{account.name}</Text>
                    {account.gender && (
                      <Text className="text-sm text-gray-700">Gender: {account.gender}</Text>
                    )}
                    <Text className="text-sm text-gray-600">
                      {item.degree ? `${item.degree} - ` : ''}
                      {item.experience} years experience
                    </Text>

                    {item.bio && <ExpandableBio text={item.bio} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            <View className="items-center mt-2 mb-10">
              <Text className="text-gray-400 italic">
                You've reached the end of the list
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
