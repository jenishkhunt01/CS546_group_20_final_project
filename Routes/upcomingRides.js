import express from "express";
import { rideRequests, ridePost } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";

const router = express.Router();

// Ensure the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.session?.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Route to display upcoming rides for the user (driver or rider)
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const rideRequestsCollection = await rideRequests();
    const ridePostCollection = await ridePost();

    // Fetch all accepted ride requests where the user is either the driver or the rider
    const acceptedRequests = await rideRequestsCollection
      .find({
        $or: [{ driver: user.username }, { rider: user.username }],
        status: "accepted",
      })
      .toArray();

    // Fetch ride details and determine the user's role
    const upcomingRides = await Promise.all(
      acceptedRequests.map(async (request) => {
        const ride = await ridePostCollection.findOne({
          _id: new ObjectId(request.rideId),
        });

        // Calculate time difference for cancellation visibility
        const rideDate = dayjs(`${ride.date} ${ride.time}`);
        const currentDate = dayjs();
        const canCancel = rideDate.diff(currentDate, "hour") > 12;

        return {
          rideId: request.rideId,
          role: request.driver === user.username ? "Driver" : "Rider",
          rider: request.rider,
          driver: request.driver,
          origin: ride?.origin || "Unknown",
          destination: ride?.destination || "Unknown",
          date: ride?.date || "Unknown",
          time: ride?.time || "Unknown",
          amount: ride?.amount || "Unknown",
          canCancel, // Whether the cancel button should be visible
        };
      })
    );

    res.render("upcomingRides", {
      rides: upcomingRides,
    });
  } catch (err) {
    console.error("Error fetching upcoming rides:", err);
    res.status(500).render("error", {
      message: "Unable to fetch upcoming rides. Please try again later.",
    });
  }
});

// Route to cancel a ride
router.post("/cancel/:rideId", ensureAuthenticated, async (req, res) => {
  try {
    const { rideId } = req.params;
    const user = req.session.user;

    const rideRequestsCollection = await rideRequests();
    const ridePostCollection = await ridePost();

    // Check if the ride exists
    const ride = await ridePostCollection.findOne({
      _id: new ObjectId(rideId),
    });
    if (!ride) {
      return res.status(404).render("error", {
        message: "Ride not found.",
      });
    }

    // Calculate time difference for cancellation restriction
    const rideDate = dayjs(`${ride.date} ${ride.time}`);
    const currentDate = dayjs();
    if (rideDate.diff(currentDate, "hour") <= 12) {
      return res.status(400).send(`
        <script>
          alert("You cannot cancel this ride as it is within 12 hours of the journey.");
          window.location.href = "/upcomingRides";
        </script>
      `);
    }

    // Delete the ride and associated requests
    await rideRequestsCollection.deleteMany({ rideId });
    await ridePostCollection.deleteOne({ _id: new ObjectId(rideId) });

    res.redirect("/upcomingRides");
  } catch (err) {
    console.error("Error canceling ride:", err);
    res.status(500).render("error", {
      message: "Unable to cancel the ride. Please try again later.",
    });
  }
});

export default router;
