import express from "express";
import { chatSessions, rideRequests } from "../config/mongoCollection.js";
import { ridePost } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Serve the chat page and initialize the session
router.get("/:rideId", async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const user = req.session?.user;

    if (!user || !user.username) {
      return res.status(401).render("error", {
        message: "You need to log in to access the chat.",
      });
    }

    const ridePostCollection = await ridePost();
    const ride = await ridePostCollection.findOne({
      _id: new ObjectId(rideId),
    });

    if (!ride) {
      return res.status(404).render("error", {
        message: "Ride not found.",
      });
    }

    const chatSessionCollection = await chatSessions();

    // Check if a chat session already exists between this rider and the driver
    let chatSession = await chatSessionCollection.findOne({
      rideId,
      rider: user.username,
    });

    if (!chatSession) {
      // Create a new chat session if none exists
      const newChatSession = await chatSessionCollection.insertOne({
        rideId,
        driver: ride.driverId,
        rider: user.username,
        messages: [],
        createdAt: new Date(),
      });

      chatSession = await chatSessionCollection.findOne({
        _id: newChatSession.insertedId,
      });
    }

    const rideRequestsCollection = await rideRequests();

    // Check if the rider has already requested the ride
    const existingRequest = await rideRequestsCollection.findOne({
      rideId,
      rider: user.username,
    });

    // Render the chat page
    res.render("chat", {
      chatId: chatSession._id.toString(),
      driverUsername: ride.driverId,
      riderUsername: user.username,
      chat: chatSession,
      user, // Pass the user object to the template
      requestExists: !!existingRequest, // Pass a flag indicating if a request exists
    });
  } catch (err) {
    console.error("Error during chat initialization:", err);
    res.status(500).render("error", {
      message: "Unable to start chat session. Please try again later.",
    });
  }
});

// Serve the chat page for a specific chat session (Driver or Rider)
router.get("/session/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const user = req.session?.user;

    if (!user || !user.username) {
      return res.status(401).render("error", {
        message: "You need to log in to access the chat.",
      });
    }

    const chatSessionCollection = await chatSessions();
    const chatSession = await chatSessionCollection.findOne({
      _id: new ObjectId(chatId),
    });

    if (!chatSession) {
      return res.status(404).render("error", {
        message: "Chat session not found.",
      });
    }

    // Ensure the user is either the driver or the rider in the chat
    if (
      chatSession.driver !== user.username &&
      chatSession.rider !== user.username
    ) {
      return res.status(403).render("error", {
        message: "You are not authorized to view this chat.",
      });
    }

    // Render the chat page
    res.render("chat", {
      chatId: chatSession._id.toString(),
      driverUsername: chatSession.driver,
      riderUsername: chatSession.rider,
      chat: chatSession,
      user, // Pass the user object to the template
    });
  } catch (err) {
    console.error("Error during chat initialization:", err);
    res.status(500).render("error", {
      message: "Unable to load chat session. Please try again later.",
    });
  }
});

// Route to send a message
router.post("/send/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { sender, message } = req.body;

    if (!sender || !message) {
      return res
        .status(400)
        .json({ error: "Sender and message are required." });
    }

    const objectId = new ObjectId(chatId);
    const chatSessionCollection = await chatSessions();

    const newMessage = {
      sender,
      message,
      timestamp: new Date().toISOString(),
    };

    const result = await chatSessionCollection.updateOne(
      { _id: objectId },
      { $push: { messages: newMessage } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Chat session not found." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Route to fetch messages
router.get("/messages/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const objectId = new ObjectId(chatId);
    const chatSessionCollection = await chatSessions();

    const chatSession = await chatSessionCollection.findOne({ _id: objectId });

    if (!chatSession) {
      return res.status(404).json({ error: "Chat session not found." });
    }

    res.json({ messages: chatSession.messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
