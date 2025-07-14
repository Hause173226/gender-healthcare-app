import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
  Trash2,
  Edit,
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

  // Navigate to create cycle
  const handleCreateCycle = () => {
    router.push("/create-cycle" as any);
  };

  // Navigate to update cycle
  const handleUpdateCycle = (cycleId: string) => {
    router.push(`/update-cycle?cycleId=${cycleId}` as any);
  };

  // API: Delete cycle
  const handleDeleteCycle = async (cycleId: string) => {
    Alert.alert("Delete Cycle", "Are you sure you want to delete this cycle?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const result = await cycleService.deleteCycle(cycleId);

            if (result) {
              toast.success("Cycle deleted successfully");
              loadCycleData();
            } else {
              toast.error("Unable to delete cycle");
            }
          } catch (error) {
            toast.error("Unable to delete cycle");
          }
        },
      },
    ]);
  };

  // API: Get cycle by ID
  const handleViewCycle = async (cycleId: string) => {
    try {
      const result = await cycleService.getCycleById(cycleId);

      if (result) {
        Alert.alert(
          "Cycle Details",
          `Period Days: ${result.periodDays?.length || 0}\n` +
            `Fertile Window: ${result.fertileWindow?.length || 0}\n` +
            `Ovulation Date: ${result.ovulationDate || "Not set"}\n` +
            `Notes: ${result.notes || "No notes"}`
        );
      } else {
        toast.error("Unable to load cycle details");
      }
    } catch (error) {
      toast.error("Unable to load cycle details");
    }
  };

  // Quick add period day to latest cycle
  const handleQuickAddPeriodDay = async () => {
    if (cycles.length === 0) {
      Alert.alert("No Cycles", "Please create a cycle first", [
        { text: "Create Cycle", onPress: handleCreateCycle },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    const latestCycle = cycles[cycles.length - 1];
    const today = new Date().toISOString().split("T")[0];

    if (latestCycle.periodDays.includes(today)) {
      Alert.alert("Already Added", "Today is already marked as a period day");
      return;
    }

    try {
      const updatedPeriodDays = [...latestCycle.periodDays, today];
      const result = await cycleService.updateCycle(latestCycle._id, {
        periodDays: updatedPeriodDays,
      });

      if (result) {
        toast.success("Period day added successfully");
        loadCycleData();
      } else {
        toast.error("Unable to add period day");
      }
    } catch (error) {
      toast.error("Unable to add period day");
    }
  };

  const getCurrentCycleDay = () => {
    if (!periodDates.length) return 0;

    const sortedDates = periodDates.sort();
    const lastPeriodStart = new Date(sortedDates[sortedDates.length - 1]);
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

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const refresh = async () => {
    setRefreshing(true);
    await loadCycleData();
    setRefreshing(false);
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
            <TouchableOpacity
              className="bg-healthcare-secondary rounded-full p-3"
              onPress={refresh}
            >
              <Target size={24} color="white" />
            </TouchableOpacity>
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
            <Card className="flex-1 mx-1 items-center py-4">
              <TrendingUp size={24} color="#F8BBD9" />
              <Text className="text-healthcare-text font-semibold mt-2">
                {getAverageCycleLength() > 0
                  ? `${getAverageCycleLength()} days`
                  : "0"}
              </Text>
              <Text className="text-healthcare-text/70 text-sm text-center">
                Cycle Length
              </Text>
            </Card>
            <Card className="flex-1 mx-1 items-center py-4">
              <Droplets size={24} color="#E57373" />
              <Text className="text-healthcare-text font-semibold mt-2">
                {getAveragePeriodLength() > 0
                  ? `${getAveragePeriodLength()} days`
                  : "0"}
              </Text>
              <Text className="text-healthcare-text/70 text-sm text-center">
                Period Length
              </Text>
            </Card>
            <Card className="flex-1 mx-1 items-center py-4">
              <Heart size={24} color="#81C784" />
              <Text className="text-healthcare-text font-semibold mt-2">
                {cycles.length}
              </Text>
              <Text className="text-healthcare-text/70 text-sm text-center">
                Total Cycles
              </Text>
            </Card>
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
            {/* Log New Period */}
            <TouchableOpacity
              className="bg-healthcare-primary p-4 rounded-lg flex-row items-center justify-center"
              onPress={handleCreateCycle}
            >
              <Plus size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                Log New Period
              </Text>
            </TouchableOpacity>

            {/* Quick Add Period Day */}
            {cycles.length > 0 && (
              <TouchableOpacity
                className="bg-healthcare-secondary p-4 rounded-lg flex-row items-center justify-center"
                onPress={handleQuickAddPeriodDay}
              >
                <Droplets size={20} color="white" />
                <Text className="text-white font-medium ml-2">
                  Add Period Day (Today)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cycles List */}
        {cycles.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Recent Cycles
            </Text>
            <View className="gap-3">
              {cycles.map((cycle, index) => (
                <Card key={cycle._id} className="py-4">
                  <View className="flex-row items-center">
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
                      {cycle.symptoms && cycle.symptoms.length > 0 && (
                        <Text className="text-healthcare-text/60 text-sm">
                          Symptoms: {cycle.symptoms.join(", ")}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => handleViewCycle(cycle._id)}
                      >
                        <Text className="text-healthcare-primary text-sm">
                          View
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => handleUpdateCycle(cycle._id)}
                      >
                        <Edit size={16} color="#F8BBD9" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => handleDeleteCycle(cycle._id)}
                      >
                        <Trash2 size={16} color="#E57373" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

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
                onPress={handleCreateCycle}
              >
                <Plus size={20} color="white" />
                <Text className="text-white font-medium ml-2 text-lg">
                  Log First Period
                </Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
