import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
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
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { cycleService } from "@/services/cycleService";
import { useToast } from "@/hooks/useToast";

export default function CreateCycleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState<"light" | "medium" | "heavy">("medium");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const flowOptions = [
    { value: "light", label: "Light", color: "#FFB74D", icon: "💧" },
    { value: "medium", label: "Medium", color: "#F8BBD9", icon: "💧💧" },
    { value: "heavy", label: "Heavy", color: "#E57373", icon: "💧💧💧" },
  ];

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

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const generatePeriodDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const resetForm = () => {
    setStartDate("");
    setEndDate("");
    setFlow("medium");
    setSymptoms([]);
    setNotes("");
  };

  const handleSave = async () => {
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    if (!user?._id) {
      toast.error("User not found");
      return;
    }

    setLoading(true);

    try {
      const periodDays = generatePeriodDays(startDate, endDate || startDate);

      const cycleData = {
        periodDays,
        customerId: user._id,
        symptoms,
        notes,
      };

      const result = await cycleService.createCycle(cycleData);

      toast.success("Cycle logged successfully!");

      // Reset form về trạng thái ban đầu
      resetForm();

      // Có thể chọn 1 trong 2 cách:
      // Cách 1: Navigate về cycle screen
      router.replace("/(tabs-customer)/cycle");

      // Cách 2: Ở lại trang create để có thể tạo cycle mới
      // (Uncomment dòng dưới nếu muốn dùng cách 2)
      // toast.success("Form reset! You can create another cycle.");
    } catch (error: any) {
      console.error("Error creating cycle:", error);
      toast.error(error.message || "Failed to log cycle");
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const setToday = () => {
    setStartDate(getTodayDate());
  };

  const setYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setStartDate(yesterday.toISOString().split("T")[0]);
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Simple date input function
  const promptDateInput = (type: "start" | "end") => {
    Alert.prompt(
      `Select ${type} date`,
      "Enter date (YYYY-MM-DD)",
      (input) => {
        if (input && input.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const inputDate = new Date(input);
          if (!isNaN(inputDate.getTime())) {
            if (type === "start") {
              setStartDate(input);
            } else {
              setEndDate(input);
            }
          } else {
            Alert.alert("Invalid date", "Please enter a valid date");
          }
        }
      },
      "plain-text",
      type === "start" ? getTodayDate() : ""
    );
  };

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
                Log Period
              </Text>
              <Text className="text-healthcare-text/70 mt-1">
                Track your menstrual cycle for better health insights
              </Text>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {/* Start Date */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Period Start Date *
            </Text>

            {/* Quick Date Buttons */}
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={setToday}
                className="flex-1 p-3 bg-healthcare-primary/10 rounded-lg border border-healthcare-primary/20"
              >
                <Text className="text-healthcare-primary font-medium text-center">
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={setYesterday}
                className="flex-1 p-3 bg-gray-100 rounded-lg border border-gray-200"
              >
                <Text className="text-gray-600 font-medium text-center">
                  Yesterday
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="flex-row items-center p-4 border border-gray-300 rounded-lg bg-white"
              onPress={() => promptDateInput("start")}
            >
              <Calendar size={20} color="#F8BBD9" />
              <Text className="text-healthcare-text ml-3 flex-1">
                {startDate ? formatDisplayDate(startDate) : "Select start date"}
              </Text>
              {startDate && <CheckCircle size={16} color="#4CAF50" />}
            </TouchableOpacity>
          </Card>

          {/* End Date (Optional) */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Period End Date (Optional)
            </Text>
            <TouchableOpacity
              className="flex-row items-center p-4 border border-gray-300 rounded-lg bg-white"
              onPress={() => promptDateInput("end")}
            >
              <Calendar size={20} color="#F8BBD9" />
              <Text className="text-healthcare-text ml-3 flex-1">
                {endDate
                  ? formatDisplayDate(endDate)
                  : "Select end date (if period has ended)"}
              </Text>
              {endDate && <CheckCircle size={16} color="#4CAF50" />}
            </TouchableOpacity>
          </Card>

          {/* Flow Intensity */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Flow Intensity
            </Text>
            <View className="flex-row justify-between gap-2">
              {flowOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setFlow(option.value as any)}
                  className={`flex-1 p-4 rounded-xl border-2 items-center ${
                    flow === option.value
                      ? "border-healthcare-primary bg-healthcare-primary/10"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text className="text-2xl mb-2">{option.icon}</Text>
                  <Text
                    className={`font-medium text-sm ${
                      flow === option.value
                        ? "text-healthcare-primary"
                        : "text-healthcare-text"
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Symptoms */}
          <Card className="mb-6">
            <Text className="text-lg font-semibold text-healthcare-text mb-4">
              Symptoms (Optional)
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
              Additional Notes
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
          {startDate && (
            <Card className="mb-6 bg-healthcare-secondary/10">
              <Text className="text-lg font-semibold text-healthcare-text mb-3">
                Summary
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-2">
                    Start: {formatDisplayDate(startDate)}
                  </Text>
                </View>
                {endDate && (
                  <View className="flex-row items-center mb-2">
                    <Calendar size={16} color="#F8BBD9" />
                    <Text className="text-healthcare-text ml-2">
                      End: {formatDisplayDate(endDate)}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center mb-2">
                  <Droplets size={16} color="#F8BBD9" />
                  <Text className="text-healthcare-text ml-2">
                    Flow: {flow.charAt(0).toUpperCase() + flow.slice(1)}
                  </Text>
                </View>
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
                  💡 Tracking Tips
                </Text>
                <Text className="text-healthcare-text/70 text-sm">
                  • Log your period on the first day of bleeding{"\n"}• Track
                  symptoms to identify patterns{"\n"}• Regular tracking helps
                  predict your next cycle{"\n"}• End date is optional - you can
                  add it later
                </Text>
              </View>
            </View>
          </Card>

          {/* Save Button */}
          <View className="pb-8">
            <Button
              title="Save Period Log"
              onPress={handleSave}
              loading={loading}
              size="large"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
