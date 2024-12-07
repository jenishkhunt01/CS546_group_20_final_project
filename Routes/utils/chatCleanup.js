import { chatSessions, ridePost } from "../../config/mongoCollection.js";
import { ObjectId } from "mongodb";

export const chatCleanup = async () => {
  try {
    const currentDate = new Date();

    // Cleanup chat sessions
    const chatSessionCollection = await chatSessions();
    const ridePostCollection = await ridePost();

    // Find and delete all chat sessions where the ride date is in the past
    const ridesToDelete = await ridePostCollection
      .find({ date: { $lt: currentDate.toISOString().split("T")[0] } })
      .toArray();

    const rideIdsToDelete = ridesToDelete.map((ride) => ride._id.toString());

    if (rideIdsToDelete.length > 0) {
      // Delete chat sessions associated with the rides
      await chatSessionCollection.deleteMany({
        rideId: { $in: rideIdsToDelete },
      });

      // Delete rides with past dates
      await ridePostCollection.deleteMany({
        _id: { $in: ridesToDelete.map((ride) => new ObjectId(ride._id)) },
      });

      console.log(
        `Deleted ${ridesToDelete.length} rides and their associated chat sessions.`
      );
    } else {
      console.log("No rides or chat sessions to delete.");
    }
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};
