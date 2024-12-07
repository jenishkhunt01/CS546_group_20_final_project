import express from "express";
import { rideRequests, ridePost } from "../config/mongoCollection.js";
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

// Handle ride request
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { rideId, rider } = req.body;
    const user = req.session.user;

    if (!rideId || !rider) {
      return res.status(400).json({ error: "Ride ID is required." });
    }

    const ridePostCollection = await ridePost();
    const rideRequestsCollection = await rideRequests();

    // Check if the ride exists
    const ride = await ridePostCollection.findOne({
      _id: new ObjectId(rideId),
    });
    if (!ride) {
      return res.status(404).json({ error: "Ride not found." });
    }

    // Prevent duplicate requests
    const existingRequest = await rideRequestsCollection.findOne({
      rideId,
      rider: rider,
    });
    if (existingRequest) {
      return res.status(400).json({ error: "Ride request already exists." });
    }

    // Add the request to the collection
    const request = {
      rideId,
      rider: user.username,
      driver: ride.driverId,
      status: "pending",
      createdAt: new Date(),
    };

    await rideRequestsCollection.insertOne(request);

    // Redirect back with success
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error requesting ride:", err);
    res.status(500).render("error", {
      message: "Unable to request ride. Please try again later.",
    });
  }
});

export default router;
