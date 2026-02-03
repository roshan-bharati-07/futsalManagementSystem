import { to24Hour, formatHour } from "./hour.js";

export function generateTimeSlots(openingTime, closingTime, bookedSlots = []) {
  const slots = [];

  const openingHour = to24Hour(openingTime);
  const closingHour = to24Hour(closingTime);

  for (let hour = openingHour; hour < closingHour; hour++) {
    const start = formatHour(hour);
    const end = formatHour(hour + 1);

    slots.push(`${start}-${end}`);
  }

  return slots.filter(slot => !bookedSlots.includes(slot));
}

