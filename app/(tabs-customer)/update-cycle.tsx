import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Calendar,
  Clock,
  Droplets,
  Heart,
  ArrowLeft,
  CheckCircle,
  Plus,
  Minus,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { cycleService, Cycle } from "@/services/cycleService";
import { useToast } from "@/hooks/useToast";

export default function UpdateCycleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const { cycleId } = useLocalSearchParams();

  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [periodDays, setPeriodDays] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const symptomOptions = [
    "Cramps",
    "Bloating",
    "Mood swings",
    "Headache",
    "Fatigue",
    "Breast tenderness",
    "Acne",
    "Food cravings",
    "Nausea",
    "Back pain",
    "Insomnia",
    "Hot flashes",
  ];

  useEffect(() => {
    if (cycleId) {
      loadCycleData();
    }
  }, [cycleId]);

  const loadCycleData = async () => {
    try {
      setLoading(true);
      const result = await cycleService.getCycleById(cycleId as string);

      if (result) {
        setCycle(result);
        setPeriodDays(result.periodDays || []);
        setSymptoms(result.symptoms || []);
        setNotes(result.notes || "");
      } else {
        Alert.alert("Error", "Cycle not found");
        router.replace("/cycle");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to load cycle data");
      router.replace("/cycle");
    } finally {
      setLoading(false);
    }
  };

  const addPeriodDay = () => {
    const today = new Date().toISOString().split("T")[0];

    if (periodDays.includes(today)) {
      Alert.alert("Already Added", "Today is already marked as a period day");
      return;
    }

    setPeriodDays([...periodDays, today].sort());
  };

  const removePeriodDay = (dateToRemove: string) => {
    Alert.alert(
      "Remove Period Day",
      `Remove ${formatDisplayDate(dateToRemove)} from period days?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setPeriodDays(periodDays.filter((date) => date !== dateToRemove));
          },
        },
      ]
    );
  };

  const addCustomDate = () => {
    Alert.prompt(
      "Add Period Day",
      "Enter date (YYYY-MM-DD)",
      (input) => {
        if (input && input.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const inputDate = new Date(input);
          if (!isNaN(inputDate.getTime())) {
            if (periodDays.includes(input)) {
              Alert.alert(
                "Already Added",
                "This date is already in your period days"
              );
              return;
            }
            setPeriodDays([...periodDays, input].sort());
          } else {
            Alert.alert("Invalid date", "Please enter a valid date");
          }
        }
      },
      "plain-text"
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (periodDays.length === 0) {
      Alert.alert("Error", "Please add at least one period day");
      return;
    }

    setSaving(true);

    try {
      const updateData = {
        periodDays: periodDays.sort(),
        symptoms,
        notes,
      };

      const result = await cycleService.updateCycle(
        cycleId as string,
        updateData
      );

      if (result) {
        toast.success("Cycle updated successfully!");
        router.replace("/cycle");
      } else {
        throw new Error("Failed to update cycle");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update cycle";
      Alert.alert("Error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-healthcare-light">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F8BBD9" />
          <Text className="text-healthcare-text mt-4">
            Loading cycle data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-healthcare-light">
      <View className="flex-1">
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
                Update Cycle
              </Text>
              <Text className="text-healthcare-text/70 mt-1">
                Edit your period days and symptoms
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {/* Period Days */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Period Days ({periodDays.length})
            </Text>

            {/* Quick Actions */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={addPeriodDay}
                className="flex-1 p-3 bg-healthcare-primary rounded-lg flex-row items-center justify-center"
              >
                <Plus size={16} color="white" />
                <Text className="text-white font-medium ml-2">Add Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addCustomDate}
                className="flex-1 p-3 bg-gray-500 rounded-lg flex-row items-center justify-center"
              >
                <Calendar size={16} color="white" />
                <Text className="text-white font-medium ml-2">Add Date</Text>
              </TouchableOpacity>
            </View>

            {/* Period Days List */}
            <View className="space-y-2">
              {periodDays.sort().map((date, index) => (
                <View
                  key={date}
                  className="flex-row items-center justify-between p-3 bg-healthcare-primary/10 rounded-lg"
                >
                  <View className="flex-row items-center">
                    <Droplets size={16} color="#F8BBD9" />
                    <Text className="text-healthcare-text ml-2 font-medium">
                      {formatDisplayDate(date)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removePeriodDay(date)}
                    className="p-1"
                  >
                    <Minus size={16} color="#E57373" />
                  </TouchableOpacity>
                </View>
              ))}
              {periodDays.length === 0 && (
                <Text className="text-healthcare-text/60 text-center py-4">
                  No period days added yet
                </Text>
              )}
            </View>
          </Card>

          {/* Symptoms */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Symptoms ({symptoms.length})
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {symptomOptions.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  onPress={() => toggleSymptom(symptom)}
                  className={`px-4 py-2 rounded-full border ${
                    symptoms.includes(symptom)
                      ? "bg-healthcare-primary border-healthcare-primary"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      symptoms.includes(symptom)
                        ? "text-white"
                        : "text-healthcare-text"
                    }`}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {symptoms.length > 0 && (
              <Text className="text-healthcare-text/60 text-sm mt-2">
                {symptoms.length} symptom{symptoms.length > 1 ? "s" : ""}{" "}
                selected
              </Text>
            )}
          </Card>

          {/* Notes */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Notes
            </Text>
            <Input
              placeholder="Any additional notes about your period..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              className="h-24 text-top"
            />
          </Card>

          {/* Summary */}
          {periodDays.length > 0 && (
            <Card className="mb-6 bg-healthcare-secondary/10">
              <Text className="text-lg font-semibold text-healthcare-text mb-3">
                Summary
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-2">
                    Period Days: {periodDays.length}
                  </Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Clock size={16} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-2">
                    Start: {formatDisplayDate(periodDays.sort()[0])}
                  </Text>
                </View>
                {periodDays.length > 1 && (
                  <View className="flex-row items-center mb-2">
                    <Clock size={16} color="#F8BBD9" />
                    <Text className="text-healthcare-text ml-2">
                      End:{" "}
                      {formatDisplayDate(
                        periodDays.sort()[periodDays.length - 1]
                      )}
                    </Text>
                  </View>
                )}
                {symptoms.length > 0 && (
                  <View className="flex-row items-center">
                    <Heart size={16} color="#F8BBD9" />
                    <Text className="text-healthcare-text ml-2">
                      Symptoms: {symptoms.join(", ")}
                    </Text>
                  </View>
                )}
              </View>
            </Card>
          )}

          {/* Quick Tips */}
          <Card className="mb-6 bg-healthcare-secondary/20">
            <View className="flex-row items-start">
              <Heart size={24} color="#F8BBD9" className="mt-1" />
              <View className="flex-1 ml-3">
                <Text className="text-healthcare-text font-semibold mb-2">
                  💡 Update Tips
                </Text>
                <Text className="text-healthcare-text/70 text-sm">
                  • Add or remove period days as needed{"\n"}• Update symptoms
                  you experienced{"\n"}• Use "Add Today" to quickly add current
                  day{"\n"}• Remove incorrect dates by tapping the minus button
                </Text>
              </View>
            </View>
          </Card>

          {/* Save Button */}
          <View className="pb-8">
            <Button
              title="Update Cycle"
              onPress={handleSave}
              loading={saving}
              size="large"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
