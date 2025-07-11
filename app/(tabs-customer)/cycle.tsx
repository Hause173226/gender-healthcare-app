import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { CycleCalendar } from "@/components/CycleCalendar";
import {
  Plus,
  TrendingUp,
  Droplets,
  Heart,
  Calendar,
  Clock,
  Target,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { cycleService, Cycle } from "@/services/cycleService";
import { useToast } from "@/hooks/useToast";

export default function CycleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [selectedDate, setSelectedDate] = useState<string>();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Current cycle data
  const [periodDates, setPeriodDates] = useState<string[]>([]);
  const [fertilityDates, setFertilityDates] = useState<string[]>([]);
  const [ovulationDate, setOvulationDate] = useState<string>("");

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        loadCycleData();
      }
    }, [user])
  );

  const loadCycleData = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const cyclesData = await cycleService.getCyclesByCustomer(user._id);

      if (cyclesData && cyclesData.success && cyclesData.data) {
        setCycles(cyclesData.data);
        processCycleData(cyclesData.data);
      } else if (cyclesData && Array.isArray(cyclesData)) {
        setCycles(cyclesData);
        processCycleData(cyclesData);
      } else if (
        cyclesData &&
        cyclesData.data &&
        Array.isArray(cyclesData.data)
      ) {
        setCycles(cyclesData.data);
        processCycleData(cyclesData.data);
      } else {
        setCycles([]);
        setPeriodDates([]);
        setFertilityDates([]);
        setOvulationDate("");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setCycles([]);
        setPeriodDates([]);
        setFertilityDates([]);
        setOvulationDate("");
      } else {
        toast.error("Unable to load cycle data");
      }
    } finally {
      setLoading(false);
    }
  };

  const processCycleData = (cyclesData: Cycle[]) => {
    let allPeriodDates: string[] = [];
    let allFertilityDates: string[] = [];
    let latestOvulationDate = "";

    cyclesData.forEach((cycle) => {
      if (cycle.periodDays) {
        const formattedPeriodDates = cycle.periodDays.map((date) => {
          const dateObj = new Date(date);
          return dateObj.toISOString().split("T")[0];
        });
        allPeriodDates = [...allPeriodDates, ...formattedPeriodDates];
      }

      if (cycle.fertileWindow) {
        const formattedFertilityDates = cycle.fertileWindow.map((date) => {
          const dateObj = new Date(date);
          return dateObj.toISOString().split("T")[0];
        });
        allFertilityDates = [...allFertilityDates, ...formattedFertilityDates];
      }

      if (cycle.ovulationDate) {
        const dateObj = new Date(cycle.ovulationDate);
        latestOvulationDate = dateObj.toISOString().split("T")[0];
      }
    });

    setPeriodDates(allPeriodDates);
    setFertilityDates(allFertilityDates);
    setOvulationDate(latestOvulationDate);
  };

  const handleLogPeriodStart = async () => {
    if (!user?._id) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const newCycleData = {
        periodDays: [today],
        customerId: user._id,
      };

      const result = await cycleService.createCycle(newCycleData);

      if (result && result._id) {
        toast.success("Period start logged successfully");
        loadCycleData();
      } else {
        toast.error("Unable to log period start");
      }
    } catch (error) {
      toast.error("Unable to log period start");
    }
  };

  const getCurrentCycleDay = () => {
    if (!periodDates.length) return 0;

    const lastPeriodStart = new Date(periodDates[periodDates.length - 1]);
    const today = new Date();
    const diffTime = today.getTime() - lastPeriodStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getAverageCycleLength = () => {
    if (cycles.length < 2) return 0;

    let totalDays = 0;
    for (let i = 1; i < cycles.length; i++) {
      const prevStart = new Date(cycles[i - 1].periodDays[0]);
      const currentStart = new Date(cycles[i].periodDays[0]);
      const diff = Math.abs(currentStart.getTime() - prevStart.getTime());
      totalDays += Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return Math.round(totalDays / (cycles.length - 1));
  };

  const getAveragePeriodLength = () => {
    if (cycles.length === 0) return 0;

    const totalDays = cycles.reduce(
      (sum, cycle) => sum + cycle.periodDays.length,
      0
    );
    return Math.round(totalDays / cycles.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const cycleStats = [
    {
      title: "Cycle Length",
      value:
        getAverageCycleLength() > 0 ? `${getAverageCycleLength()} days` : "N/A",
      icon: TrendingUp,
      color: "#F8BBD9",
    },
    {
      title: "Period Length",
      value:
        getAveragePeriodLength() > 0
          ? `${getAveragePeriodLength()} days`
          : "N/A",
      icon: Droplets,
      color: "#E57373",
    },
    {
      title: "Total Cycles",
      value: cycles.length.toString(),
      icon: Heart,
      color: "#81C784",
    },
  ];

  const refresh = async () => {
    setRefreshing(true);
    await loadCycleData();
    setRefreshing(false);
  };

  const handleViewHistory = () => {
    // Navigate to cycle history - you may need to create this screen
    router.push("/(tabs-customer)/profile" as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-healthcare-light">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F8BBD9" />
          <Text className="text-healthcare-text mt-4">Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-healthcare-text">
                Cycle Tracker
              </Text>
              <Text className="text-healthcare-text/70 mt-1">
                {cycles.length > 0
                  ? `Day ${getCurrentCycleDay()} of your cycle`
                  : "Start tracking your cycle"}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-healthcare-primary rounded-full p-3"
                onPress={() =>
                  router.push("/(tabs-customer)/create-cycle" as any)
                }
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-healthcare-secondary rounded-full p-3"
                onPress={refresh}
              >
                <Target size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Current Status */}
        {cycles.length > 0 && (
          <View className="px-6 mb-6">
            <Card className="bg-gradient-to-r from-healthcare-primary/10 to-healthcare-secondary/10">
              <View className="flex-row items-center">
                <Clock size={32} color="#F8BBD9" />
                <View className="flex-1 ml-4">
                  <Text className="text-healthcare-text font-semibold text-lg">
                    Day {getCurrentCycleDay()}
                  </Text>
                  <Text className="text-healthcare-text/70">
                    {getCurrentCycleDay() <= 5
                      ? "Menstrual phase"
                      : getCurrentCycleDay() <= 14
                      ? "Follicular phase"
                      : getCurrentCycleDay() <= 21
                      ? "Ovulation phase"
                      : "Luteal phase"}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Cycle Stats */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Your Stats
          </Text>
          <View className="flex-row justify-between">
            {cycleStats.map((stat, index) => (
              <Card key={index} className="flex-1 mx-1 items-center py-4">
                <stat.icon size={24} color={stat.color} />
                <Text className="text-healthcare-text font-semibold mt-2">
                  {stat.value}
                </Text>
                <Text className="text-healthcare-text/70 text-sm text-center">
                  {stat.title}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Calendar */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Calendar
          </Text>
          <CycleCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            periodDates={periodDates}
            fertilityDates={fertilityDates}
            ovulationDate={ovulationDate}
          />
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-healthcare-text mb-4">
            Quick Actions
          </Text>
          <View className="gap-3">
            <TouchableOpacity
              className="bg-healthcare-primary p-4 rounded-lg flex-row items-center justify-center"
              onPress={handleLogPeriodStart}
            >
              <Droplets size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                Log Period Start
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-healthcare-primary p-4 rounded-lg flex-row items-center justify-center"
              onPress={() =>
                router.push("/(tabs-customer)/create-cycle" as any)
              }
            >
              <Plus size={20} color="#F8BBD9" />
              <Text className="text-healthcare-primary font-medium ml-2">
                Create Cycle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-healthcare-primary p-4 rounded-lg flex-row items-center justify-center"
              onPress={handleViewHistory}
            >
              <Calendar size={20} color="#F8BBD9" />
              <Text className="text-healthcare-primary font-medium ml-2">
                View History
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* No Data Message */}
        {cycles.length === 0 && (
          <View className="px-6 mb-6">
            <Card className="items-center py-8">
              <Heart size={48} color="#F8BBD9" className="mb-4" />
              <Text className="text-healthcare-text font-semibold mb-2 text-xl">
                Start Your Journey
              </Text>
              <Text className="text-healthcare-text/70 text-center mb-6 px-4">
                Begin tracking your menstrual cycle to get personalized
                insights, predictions, and better understand your body.
              </Text>
              <TouchableOpacity
                className="bg-healthcare-primary px-6 py-3 rounded-lg flex-row items-center"
                onPress={() =>
                  router.push("/(tabs-customer)/create-cycle" as any)
                }
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-medium ml-2 text-lg">
                  Log First Period
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        {/* Recent Cycles */}
        {cycles.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Recent Cycles
            </Text>
            <View className="gap-3">
              {cycles.slice(0, 3).map((cycle, index) => (
                <Card key={cycle._id} className="flex-row items-center py-4">
                  <View className="w-12 h-12 bg-healthcare-primary/20 rounded-full items-center justify-center mr-4">
                    <Droplets size={20} color="#F8BBD9" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-healthcare-text font-medium">
                      Cycle {cycles.length - index}
                    </Text>
                    <Text className="text-healthcare-text/60 text-sm">
                      {cycle.periodDays.length} days period • Started{" "}
                      {formatFullDate(cycle.periodDays[0])}
                    </Text>
                  </View>
                  <TouchableOpacity className="p-2">
                    <Text className="text-healthcare-primary">View</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        <View className="px-6 mb-6">
          <Card className="bg-healthcare-secondary/10">
            <View className="flex-row items-start">
              <Target size={24} color="#F8BBD9" className="mt-1" />
              <View className="flex-1 ml-3">
                <Text className="text-healthcare-text font-semibold mb-2">
                  💡 Tracking Tips
                </Text>
                <Text className="text-healthcare-text/70 text-sm">
                  {cycles.length === 0
                    ? "Start by logging your period start date. After a few cycles, you'll get accurate predictions!"
                    : "Keep logging consistently for better predictions. Note any symptoms or changes you experience."}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
