
// AM/PM into 24 hour format 
function to24Hour(time) {
  const match = time.match(/(\d+)(AM|PM)/i);
  let hour = parseInt(match[1], 10);
  const period = match[2].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour;
}

// AM/PM into 24 hour format 
function formatHour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${formattedHour}${period}`;
}

export {
  to24Hour,
  formatHour
}