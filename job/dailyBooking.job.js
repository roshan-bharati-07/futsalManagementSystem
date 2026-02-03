import cron from "node-cron";
import mongoose from "mongoose";
import Futsal from "./models/futsal.model.js"; // adjust path

cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0]; 
  console.log("Processing advance bookings for", today);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const futsals = await Futsal.find({
      "advanceBookingSlots.date": today
    }).session(session);

    for (const futsal of futsals) {

      const todaysAdvance = futsal.advanceBookingSlots.filter(
        slot => slot.date === today
      );

      futsal.bookedSlots.push(...todaysAdvance);

      futsal.advanceBookingSlots = futsal.advanceBookingSlots.filter(
        slot => slot.date !== today
      );

      await futsal.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    console.log("Advance bookings for today moved to bookedSlots successfully.");
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error processing advance bookings:", err.message);
  }
});
