import {
  chatSessions,
  ridePost,
  rideHistory,
  rideRequests,
} from "../../config/mongoCollection.js";
import { ObjectId } from "mongodb";

export const chatCleanup = async () => {
  try {
    const currentDate = new Date();

    const chatSessionCollection = await chatSessions();
    const ridePostCollection = await ridePost();
    const rideHistoryCollection = await rideHistory();
    const rideRequestsCollection = await rideRequests();


    const ridesToArchive = await ridePostCollection
      .find({
        $or: [
          { date: { $lt: currentDate.toISOString().split("T")[0] } },
          // { status: { $in: ["completed", "cancelled"] } },
        ],
      })
      .toArray();

    if (ridesToArchive.length > 0) {
     
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

      // Insert archived rides into rideHistory
      await rideHistoryCollection.insertMany(archivedRides);

      // Remove the rides from ridePost after archival
      const rideIdsToCleanup = ridesToArchive.map((ride) =>
        ride._id.toString()
      );

      await chatSessionCollection.deleteMany({
        rideId: { $in: rideIdsToCleanup },
      });

      await rideRequestsCollection.deleteMany({
        rideId: { $in: rideIdsToCleanup },
      });

      console.log(
        `Archived ${ridesToArchive.length} rides to rideHistory and cleaned up associated chat sessions.`
      );
    } else {
      console.log("No rides to archive or clean up.");
    }

    // ---------------------------
    // Step 2: Check orphaned chatSessions and rideRequests
    // ---------------------------
    // Iterate through all chatSessions
    const allChatSessions = await chatSessionCollection.find({}).toArray();
    for (const session of allChatSessions) {
      const rideExists = await ridePostCollection.findOne({
        _id: new ObjectId(session.rideId),
      });
      if (!rideExists) {
        // Delete orphaned chat session
        await chatSessionCollection.deleteOne({ _id: session._id });
        console.log(
          `Deleted orphaned chat session with rideId: ${session.rideId}`
        );
      }
    }

    // Iterate through all rideRequests
    const allRideRequests = await rideRequestsCollection.find({}).toArray();
    for (const request of allRideRequests) {
      const rideExists = await ridePostCollection.findOne({
        _id: new ObjectId(request.rideId),
      });
      if (!rideExists) {
        // Delete orphaned ride request
        await rideRequestsCollection.deleteOne({ _id: request._id });
        console.log(
          `Deleted orphaned ride request with rideId: ${request.rideId}`
        );
      }
    }

    console.log("Chat and ride request cleanup completed.");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};
