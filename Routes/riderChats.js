import express from "express";
import { chatSessions, ridePost } from "../config/mongoCollection.js";
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

// Route to display all chats for the rider
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const chatSessionCollection = await chatSessions();
    const ridePostCollection = await ridePost();

    // Fetch all chat sessions where the user is the rider
    const chats = await chatSessionCollection.find({ rider: user.username }).toArray();

    const riderChats = [];

    // Get ride details for each chat session
    for (const chat of chats) {
      const ride = await ridePostCollection.findOne({
        _id: new ObjectId(chat.rideId),
      });

      if (ride) {
        riderChats.push({
          chatId: chat._id.toString(),
          driver: chat.driver, // Driver's username
          ride: {
            origin: ride.origin,
            destination: ride.destination,
            date: ride.date,
            time: ride.time,
          },
        });
      }
    }

    res.render("riderChats", { chats: riderChats });
  } catch (err) {
    console.error("Error fetching rider chats:", err);
    res.status(500).render("error", {
      message: "Unable to fetch chats. Please try again later.",
    });
  }
});

export default router;
