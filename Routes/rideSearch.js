import express from "express";
import { ridePost } from "../config/mongoCollection.js";

const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", ensureAuthenticated, (req, res) => {
  res.render("rideSearch", { title: "Ride Search", user: req.session.user });
});

router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { date, seatsRequired } = req.body;
    const user = req.session.user; // Get the logged-in user's information

    // Validate input
    if (!date || !seatsRequired) {
      return res.status(400).render("error", {
        message: "Date and number of seats are required!",
      });
    }

    const ridePostCollection = await ridePost();

    // Fetch rides that match the selected date and have enough seats available,
    // excluding rides posted by the logged-in user
    const availableRides = await ridePostCollection
      .find({
        isAvailable: true,
        date, // Match the same date
        seats: { $gte: parseInt(seatsRequired) }, // Seats greater than or equal to seatsRequired
        driverId: { $ne: user.username }, // Exclude rides posted by the logged-in user
      })
      .toArray();

    if (availableRides.length === 0) {
      return res.render("rides", {
        title: "Available Rides",
        hasRides: false,
        rides: [],
      });
    }

    res.render("rides", {
      title: "Available Rides",
      hasRides: true,
      rides: availableRides,
    });
  } catch (error) {
    console.error("Error during ride search:", error);
    res.status(500).render("error", {
      message: "Unable to fetch rides. Please try again later.",
    });
  }
});

export default router;
