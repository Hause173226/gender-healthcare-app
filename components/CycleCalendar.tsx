import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CycleCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  periodDates: string[];
  fertilityDates: string[];
  ovulationDate?: string;
}

export const CycleCalendar: React.FC<CycleCalendarProps> = ({
  selectedDate,
  onDateSelect,
  periodDates,
  fertilityDates,
  ovulationDate,
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day: number) => {
    return `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const renderDay = (day: number) => {
    const dateString = formatDate(day);
    const isPeriod = periodDates.includes(dateString);
    const isFertile = fertilityDates.includes(dateString);
    const isOvulation = ovulationDate === dateString;
    const isSelected = selectedDate === dateString;
    const isToday = day === today.getDate() && 
                   currentMonth === today.getMonth() && 
                   currentYear === today.getFullYear();

    let dayClasses = 'w-10 h-10 rounded-full items-center justify-center mx-1 mb-2';
    let textClasses = 'text-sm font-medium';

    if (isSelected) {
      dayClasses += ' bg-healthcare-primary';
      textClasses += ' text-white';
    } else if (isOvulation) {
      dayClasses += ' bg-healthcare-accent';
      textClasses += ' text-white';
    } else if (isPeriod) {
      dayClasses += ' bg-red-400';
      textClasses += ' text-white';
    } else if (isFertile) {
      dayClasses += ' bg-healthcare-secondary';
      textClasses += ' text-healthcare-text';
    } else if (isToday) {
      dayClasses += ' border-2 border-healthcare-primary';
      textClasses += ' text-healthcare-primary';
    } else {
      textClasses += ' text-healthcare-text';
    }

    return (
      <TouchableOpacity
        key={day}
        className={dayClasses}
        onPress={() => onDateSelect(dateString)}
      >
        <Text className={textClasses}>{day}</Text>
      </TouchableOpacity>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="w-10 h-10 mx-1 mb-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderDay(day));
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="text-xl font-bold text-healthcare-text mb-4 text-center">
        {monthNames[currentMonth]} {currentYear}
      </Text>
      
      <View className="flex-row justify-around mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Text key={index} className="text-gray-500 font-medium w-10 text-center">
            {day}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {renderCalendar()}
      </View>

      <View className="mt-4 flex-row justify-around">
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-red-400 mr-2" />
          <Text className="text-sm text-healthcare-text">Period</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-healthcare-secondary mr-2" />
          <Text className="text-sm text-healthcare-text">Fertile</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-healthcare-accent mr-2" />
          <Text className="text-sm text-healthcare-text">Ovulation</Text>
        </View>
      </View>
    </View>
  );
};