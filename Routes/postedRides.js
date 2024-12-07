import express from "express";
import { ridePost, chatSessions } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Ensure the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Route to display posted rides with individual chat sessions
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const ridePostCollection = await ridePost();
    const chatSessionCollection = await chatSessions();

    // Fetch all rides posted by the driver
    const postedRides = await ridePostCollection
      .find({ driverId: user.username })
      .toArray();

    const postedChats = [];

    // Fetch chats for each posted ride
    for (const ride of postedRides) {
      const chats = await chatSessionCollection
        .find({ rideId: ride._id.toString() }) // Use ride ID to find chat sessions
        .toArray();

      chats.forEach((chat) => {
        postedChats.push({
          ride, // Full ride details
          chatId: chat._id.toString(),
          rider: chat.rider, // Rider's username
        });
      });
    }

    res.render("postedRide", { postedChats });
  } catch (err) {
    console.error("Error fetching posted rides and chats:", err);
    res.status(500).render("error", {
      message: "Unable to fetch posted rides and chats. Please try again later.",
    });
  }
});

export default router;
