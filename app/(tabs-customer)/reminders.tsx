import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Card } from "@/components/ui/Card";
import {
  Bell,
  Clock,
  Pill,
  Calendar,
  Heart,
  ArrowLeft,
  Check,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { reminderService, Reminder } from "@/services/reminderService";
import { useToast } from "@/hooks/useToast";

export default function RemindersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?._id) {
      loadReminders();
    }
  }, [user]);

  const loadReminders = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const data = await reminderService.getRemindersByCustomer(user._id);
      setReminders(data || []);
    } catch (error) {
      console.error("Error loading reminders:", error);
      toast.error("Unable to load reminders");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReminders();
    setRefreshing(false);
  };

  const markAsSent = async (id: string) => {
    try {
      await reminderService.updateReminder(id, { isSent: true });
      toast.success("Reminder marked as completed");
      await loadReminders();
    } catch (error) {
      console.error("Error marking reminder as sent:", error);
      toast.error("Unable to update reminder");
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case "Pill":
        return <Pill size={20} color="#F8BBD9" />;
      case "Period":
        return <Calendar size={20} color="#F8BBD9" />;
      case "Ovulation":
        return <Heart size={20} color="#F8BBD9" />;
      default:
        return <Bell size={20} color="#F8BBD9" />;
    }
  };

  const getReminderEmoji = (type: string) => {
    switch (type) {
      case "Pill":
        return "💊";
      case "Period":
        return "🩸";
      case "Ovulation":
        return "🥚";
      default:
        return "⏰";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const reminderDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (reminderDate.getTime() === today.getTime()) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (reminderDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const categorizeReminders = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const categories = {
      overdue: [] as Reminder[],
      today: [] as Reminder[],
      tomorrow: [] as Reminder[],
      upcoming: [] as Reminder[],
      completed: [] as Reminder[],
    };

    reminders.forEach((reminder) => {
      const reminderDate = new Date(reminder.date);
      const reminderDay = new Date(
        reminderDate.getFullYear(),
        reminderDate.getMonth(),
        reminderDate.getDate()
      );

      if (reminder.isSent) {
        categories.completed.push(reminder);
      } else if (reminderDay.getTime() < today.getTime()) {
        categories.overdue.push(reminder);
      } else if (reminderDay.getTime() === today.getTime()) {
        categories.today.push(reminder);
      } else if (reminderDay.getTime() === tomorrow.getTime()) {
        categories.tomorrow.push(reminder);
      } else {
        categories.upcoming.push(reminder);
      }
    });

    return categories;
  };

  const renderReminderItem = (reminder: Reminder) => {
    const isPast = new Date(reminder.date) < new Date();
    const isToday =
      new Date(reminder.date).toDateString() === new Date().toDateString();

    return (
      <Card
        key={reminder._id}
        className={`mb-3 ${
          isPast && !reminder.isSent
            ? "border-l-4 border-red-400"
            : isToday
            ? "border-l-4 border-blue-400"
            : ""
        }`}
      >
        <View className="flex-row items-center">
          <View
            className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
              reminder.isSent ? "bg-green-100" : "bg-healthcare-primary/20"
            }`}
          >
            <Text className="text-lg">{getReminderEmoji(reminder.type)}</Text>
          </View>

          <View className="flex-1">
            <Text
              className={`font-semibold text-healthcare-text ${
                reminder.isSent ? "opacity-60" : ""
              }`}
            >
              {reminder.type}
            </Text>
            <Text
              className={`text-sm text-healthcare-text/60 ${
                reminder.isSent ? "opacity-60" : ""
              }`}
            >
              {formatDate(reminder.date)}
            </Text>
            {reminder.message && (
              <Text
                className={`text-sm text-healthcare-text/70 mt-1 ${
                  reminder.isSent ? "opacity-60" : ""
                }`}
              >
                {reminder.message}
              </Text>
            )}
          </View>

          <View className="items-end">
            {reminder.isSent ? (
              <View className="flex-row items-center">
                <Check size={16} color="#4CAF50" />
                <Text className="text-green-600 text-sm ml-1">Done</Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-healthcare-primary px-3 py-1 rounded-full"
                onPress={() => markAsSent(reminder._id)}
              >
                <Text className="text-white text-sm font-medium">
                  Mark Done
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  const renderSection = (title: string, items: Reminder[], emoji: string) => {
    if (items.length === 0) return null;

    return (
      <View className="mb-6">
        <Text className="text-lg font-semibold text-healthcare-text mb-4">
          {emoji} {title} ({items.length})
        </Text>
        {items.map(renderReminderItem)}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-healthcare-light">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F8BBD9" />
          <Text className="text-healthcare-text mt-4">
            Loading reminders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const categories = categorizeReminders();

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-white shadow-sm">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.replace("/cycle")}
            className="mr-4 p-2 rounded-full bg-gray-100"
          >
            <ArrowLeft size={20} color="#2C3E50" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-healthcare-text">
              Reminders
            </Text>
            <Text className="text-healthcare-text/70 mt-1">
              {reminders.length} total reminders
            </Text>
          </View>
          <View className="items-center">
            <Bell size={24} color="#F8BBD9" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 pt-6"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#F8BBD9"]}
          />
        }
      >
        {reminders.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Bell size={60} color="#D1D5DB" />
            <Text className="text-healthcare-text/60 text-lg mt-4 text-center">
              No reminders yet
            </Text>
            <Text className="text-healthcare-text/40 text-center mt-2 px-8">
              Create a cycle to automatically generate reminders for your
              period, ovulation, and medications
            </Text>
          </View>
        ) : (
          <>
            {renderSection("Overdue", categories.overdue, "⚠️")}
            {renderSection("Today", categories.today, "🔔")}
            {renderSection("Tomorrow", categories.tomorrow, "⏰")}
            {renderSection("Upcoming", categories.upcoming, "📅")}
            {renderSection("Completed", categories.completed, "✅")}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
