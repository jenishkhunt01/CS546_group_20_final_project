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

// Route to display requested rides for the driver
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const rideRequestsCollection = await rideRequests();
    const ridePostCollection = await ridePost();

    // Fetch all requests for rides posted by the driver
    const requests = await rideRequestsCollection
      .find({ driver: user.username })
      .toArray();

    // Fetch ride details for each request
    const requestsWithRideDetails = await Promise.all(
      requests.map(async (request) => {
        const ride = await ridePostCollection.findOne({
          _id: new ObjectId(request.rideId),
        });

        return {
          rideId: request.rideId,
          rider: request.rider,
          origin: ride?.origin || "Unknown",
          destination: ride?.destination || "Unknown",
          date: ride?.date || "Unknown",
          time: ride?.time || "Unknown",
          amount: ride?.amount || "Unknown",
        };
      })
    );

    res.render("requestedRides", {
      requests: requestsWithRideDetails,
    });
  } catch (err) {
    console.error("Error fetching requested rides:", err);
    res.status(500).render("error", {
      message: "Unable to fetch requested rides. Please try again later.",
    });
  }
});

// Accept a ride request
router.post("/accept/:rideId", ensureAuthenticated, async (req, res) => {
  try {
    const { rideId } = req.params;
    const user = req.session.user;

    const rideRequestsCollection = await rideRequests();

    // Update the request status to accepted
    await rideRequestsCollection.updateOne(
      { rideId, driver: user.username },
      { $set: { status: "accepted" } }
    );

    // Redirect to upcoming rides page
    res.redirect("/upcomingRides");
  } catch (err) {
    console.error("Error accepting ride request:", err);
    res.status(500).render("error", {
      message: "Unable to accept the ride request. Please try again later.",
    });
  }
});

// Reject a ride request
router.post("/reject/:rideId", ensureAuthenticated, async (req, res) => {
  try {
    const { rideId } = req.params;
    const user = req.session.user;

    const rideRequestsCollection = await rideRequests();

    // Delete the request from the collection
    await rideRequestsCollection.deleteOne({ rideId, driver: user.username });

    // Redirect back to the requested rides page
    res.redirect("/requestedRides");
  } catch (err) {
    console.error("Error rejecting ride request:", err);
    res.status(500).render("error", {
      message: "Unable to reject the ride request. Please try again later.",
    });
  }
});

export default router;
