export const calculateCycleEvents = (
  periodDays: string[],
  cycleLength: number = 28
) => {
  if (!periodDays || periodDays.length === 0) return null;

  const firstDayOfPeriod = new Date(periodDays[0]);
  const lastDayOfPeriod = new Date(periodDays[periodDays.length - 1]);

  // Tính ngày rụng trứng (thường là 14 ngày trước kì kế tiếp)
  const ovulationDate = new Date(firstDayOfPeriod);
  ovulationDate.setDate(ovulationDate.getDate() + 14);

  // Tính cửa sổ thụ thai (5 ngày trước và 1 ngày sau rụng trứng)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  // Tính kì kế tiếp
  const nextPeriodDate = new Date(firstDayOfPeriod);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

  return {
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    nextPeriodDate,
    periodEndDate: lastDayOfPeriod,
  };
};

export const generateReminderDates = (cycleEvents: any) => {
  if (!cycleEvents) return [];

  const reminders = [];
  const today = new Date();

  // 1. Nhắc nhở kì kinh kế tiếp (chỉ nếu chưa qua)
  const periodReminder = new Date(cycleEvents.nextPeriodDate);
  periodReminder.setDate(periodReminder.getDate() - 3);

  if (periodReminder > today) {
    reminders.push({
      type: "Period",
      date: periodReminder,
      message: "Kì kinh nguyệt sắp đến trong 3 ngày tới",
    });
  }

  // 2. Nhắc nhở rụng trứng (chỉ nếu chưa qua)
  const ovulationReminder = new Date(cycleEvents.ovulationDate);
  ovulationReminder.setDate(ovulationReminder.getDate() - 1);

  if (ovulationReminder > today) {
    reminders.push({
      type: "Ovulation",
      date: ovulationReminder,
      message: "Ngày rụng trứng sắp đến, thời gian thụ thai cao",
    });
  }

  // 3. Nhắc nhở thuốc tránh thai - CHỈ TẠO 3 REMINDER GẦN NHẤT
  const pillStartDate = new Date(cycleEvents.periodEndDate);
  pillStartDate.setDate(pillStartDate.getDate() + 1);

  // Chỉ tạo reminder cho 3 ngày tiếp theo từ hôm nay
  for (let i = 0; i < 3; i++) {
    const pillDate = new Date(today);
    pillDate.setDate(pillDate.getDate() + i);
    pillDate.setHours(20, 0, 0, 0);

    // Chỉ tạo nếu trong khoảng thời gian cần uống thuốc
    if (pillDate >= pillStartDate) {
      // SỬA LỖI: Ép kiểu Date thành number để tính toán
      const dayNumber =
        Math.floor(
          (pillDate.getTime() - pillStartDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      if (dayNumber <= 21) {
        // Chỉ trong 21 ngày
        reminders.push({
          type: "Pill",
          date: pillDate,
          message: `Nhắc nhở uống thuốc tránh thai (ngày ${dayNumber}/21)`,
        });
      }
    }
  }

  return reminders;
};
