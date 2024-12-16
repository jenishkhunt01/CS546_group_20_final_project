import express from "express";
import { ridePost, users } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";

const router = express.Router();

// Ensure the user is authenticated
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
    const { startLocation, endLocation, date, time, seatsRequired } = req.body;
    const user = req.session.user;

    if (!startLocation || !endLocation || !date || !time || !seatsRequired) {
      return res.status(400).render("error", {
        message: "All fields are required.",
      });
    }

    const riderTime = dayjs(`${date} ${time}`, "YYYY-MM-DD HH:mm", true);
    if (!riderTime.isValid()) {
      return res.status(400).render("error", {
        message: "Invalid date or time.",
      });
    }

    const timeLowerBound = riderTime.subtract(1, "hour").format("HH:mm");
    const timeUpperBound = riderTime.add(1, "hour").format("HH:mm");

    const ridePostCollection = await ridePost();
    const usersCollection = await users();

    const availableRides = await ridePostCollection
      .find({
        isAvailable: true,
        date,
        seats: { $gte: parseInt(seatsRequired) },
        origin: startLocation,
        destination: endLocation,
        driverId: { $ne: user.username },
        time,
        time: { $gte: timeLowerBound, $lte: timeUpperBound },
      })
      .toArray();

    const ridesWithDetails = await Promise.all(
      availableRides.map(async (ride) => {
        const driver = await usersCollection.findOne({
          username: ride.driverId,
        });
        return {
          rideId: ride._id.toString(),
          origin: ride.origin,
          destination: ride.destination,
          date: ride.date,
          time: ride.time,
          seats: ride.seats,
          amount: ride.amount,
          driverName: driver
            ? `${driver.firstname} ${driver.lastname}`
            : "Unknown",
          carType: ride.carType,
        };
      })
    );

    res.render("rides", {
      title: "Available Rides",
      hasRides: ridesWithDetails.length > 0,
      rides: ridesWithDetails,
    });
  } catch (error) {
    console.error("Error during ride search:", error);
    res.status(500).render("error", {
      message: "Unable to fetch rides. Please try again later.",
    });
  }
});

export default router;
