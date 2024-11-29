import express from "express";
import validator from "../helper.js"; // Ensure helper.js exists and has necessary functions
import isAuthenticated from "../middleware/authMiddleware.js";
import rideData from "../data/rides.js";

const router = express.Router();

router.get("/ridePost", isAuthenticated, (req, res) => {
  res.render("ridePublish", { title: "Ride Post", user: req.session.user });
});

router.post("/ridePost", isAuthenticated, async (req, res) => {
  let reqBody = req.body;
  return await rideData.addRide(reqBody);
});

export default router;
