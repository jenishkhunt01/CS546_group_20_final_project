import express from "express";
import validator from "../helper.js";
import isAuthenticated from "../middleware/authMiddleware.js";
import rideData from "../data/rides.js";
import moment from "moment";
import { users } from "../config/mongoCollection.js";

const router = express.Router();

router.get("/ridePost", isAuthenticated, (req, res) => {
  let today = moment().format("YYYY-MM-DD");
  let isVerified = req.session.user.isVerified;
  if (!isVerified) {
    return res.redirect("/verify");
  }
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

router.get("/verify", isAuthenticated, (req, res) => {
  if (req.session.user.isVerified) {
    return res.redirect("/ridePost");
  }
  return res.render("verify", { title: "Verify DL", user: req.session.user });
});

router.post("/verify", isAuthenticated, async (req, res) => {
  const license = req.body.license;
  const licenseImg = req.file;

  if (!license || !licenseImg) {
    return res.status(400).send("License number and image are required.");
  }

  return await rideData.addDrivingLicense(license, licenseImg, res, req);
});

export default router;
