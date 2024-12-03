import express from "express";
import validator from "../helper.js";
import isAuthenticated from "../middleware/authMiddleware.js";
import rideData from "../data/rides.js";
import moment from "moment";

const router = express.Router();

router.get("/ridePost", isAuthenticated, (req, res) => {
  let today = moment().format("YYYY-MM-DD");
  res.render("ridePublish", {
    title: "Ride Post",
    user: req.session.user,
    currentDate: today,
  });
});

router.post("/ridePost", isAuthenticated, async (req, res) => {
  let reqBody = req.body;
  let userId = req.session.user.username;
  return await rideData.addRide(reqBody, res, userId);
});

export default router;
