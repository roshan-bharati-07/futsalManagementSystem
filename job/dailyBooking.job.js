import cron from "node-cron";
import mongoose from "mongoose";
import {Futsal} from "../model/futsal.model.js"; // adjust path
import {User} from "../model/user.model.js"; // adjust path

cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0]; 
  console.log("Processing advance bookings for", today);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    // getting all the futsals with advance bookings of current date 
    const futsals = await Futsal.find({
      "advanceBookedSlots.date": today
    }).session(session);

    // looping through all the futsals 
    for (const futsal of futsals) {

      // remove old bookedSlots 
      futsal.bookedSlots = null 
      
      // clear the record from old booked users 
      const user = await User.deleteMany({
        bookedFutsal: futsal._id,
        bookedDate: { $lt: today }
      }, {
        session
      })

      // gettting the advance bookings of futsal
      const todaysAdvance = futsal.advanceBookedSlots.filter(
        slot => slot.date === today
      );

      // adding advance bookings to bookedSlots
      futsal.bookedSlots.push(...todaysAdvance);

      // removing advance bookings when pushed into bookedSlots
      futsal.advanceBookedSlots = futsal.advanceBookedSlots.filter(
        slot => slot.date !== today
      );

      // users advance booking into bookedSlots 
      for (const slot of todaysAdvance) {
        const user = await User.findById(slot.user);
        if (user) {
          user.bookedFutsal = user.advanceBooking.futsalId;
          user.bookedDate = user.advanceBooking.date;
          user.bookedTime = user.advanceBooking.time;
          await user.save({ session });
        }
      }

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
