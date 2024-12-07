import express from "express";
import ridePostData from "../data/ridePost.js"; // Data layer for ridePost collection
import validator from "../helper.js"; // Add your validation logic

const router = express.Router();

const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", ensureAuthenticated, (req, res) => {
  res.render("ridePost", { title: "Ride Post", user: req.session.user });
});

router.post("/post", ensureAuthenticated, async (req, res) => {
  try {
    const { origin, destination, date, time, seats, amount } = req.body;

    // Validation
    if (!origin || !destination || !date || !time || !seats || !amount) {
      return res
        .status(400)
        .render("error", { message: "All fields are required!" });
    }

    // Use a helper to validate inputs further if needed
    const validatedOrigin = validator.checkString(origin, "Origin");
    const validatedDestination = validator.checkString(
      destination,
      "Destination"
    );
    const validatedSeats = parseInt(seats);
    const validatedAmount = parseFloat(amount);

    if (validatedSeats <= 0 || validatedAmount <= 0) {
      return res.status(400).render("error", {
        message: "Seats and amount must be greater than 0!",
      });
    }

    const driverId = req.session.user.username;

    // Insert ride post
    const ridePost = await ridePostData.addRidePost({
      driverId: driverId, // Assuming session stores user info
      origin: validatedOrigin,
      destination: validatedDestination,
      date,
      time,
      seats: validatedSeats,
      amount: validatedAmount,
    });

    res.redirect(`/dashboard`); // Redirect to a dashboard or confirmation page
  } catch (error) {
    res.status(500).render("error", {
      message: "Unable to post ride. Please try again later.",
    });
  }
});

export default router;
