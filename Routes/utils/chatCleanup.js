import {
  chatSessions,
  ridePost,
  rideHistory,
} from "../../config/mongoCollection.js";
import { ObjectId } from "mongodb";

export const chatCleanup = async () => {
  try {
    const currentDate = new Date();

    const chatSessionCollection = await chatSessions();
    const ridePostCollection = await ridePost();
    const rideHistoryCollection = await rideHistory();

    // Find rides in the past (completed or canceled)
    const ridesToArchive = await ridePostCollection
      .find({
        date: { $lt: currentDate.toISOString().split("T")[0] },
        status: { $in: ["completed", "canceled"] },
      })
      .toArray();

    if (ridesToArchive.length > 0) {
      // Archive rides in rideHistory
      const archivedRides = ridesToArchive.map((ride) => ({
        origin: ride.origin,
        destination: ride.destination,
        date: ride.date,
        time: ride.time,
        amount: ride.amount,
        seats: ride.seats,
        status: ride.status,
        driver: ride.driver,
        rider: ride.rider,
        createdAt: ride.createdAt,
        archivedAt: currentDate, // Timestamp for archival
      }));

      await rideHistoryCollection.insertMany(archivedRides);

      // Remove associated chat sessions
      const rideIdsToCleanup = ridesToArchive.map((ride) =>
        ride._id.toString()
      );

      await chatSessionCollection.deleteMany({
        rideId: { $in: rideIdsToCleanup },
      });

      console.log(
        `Archived ${ridesToArchive.length} rides to rideHistory and cleaned up associated chat sessions.`
      );
    } else {
      console.log("No rides to archive or clean up.");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};
