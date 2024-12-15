import express from "express";
import { ObjectId } from "mongodb";
import validator from "../helper.js";
import { users } from "../config/mongoCollection.js";
const router = express.Router();

router.get("/", async (req, res) => {
  let { reviewer, user, rideId } = req.query;
  try {
    reviewer = validator.checkString(reviewer, "Reviewer");
    user = validator.checkString(user, "User");
    // rideId = validator.isValidId(rideId, "Ride ID");
  } catch (e) {
    return res.status(400).render("error", {
      message: e,
      title: "Error",
    });
  }
  try {
    const userCollection = await users();
    let userData = await userCollection.findOne({ username: user });
    if (!userData) {
      return res.status(400).render("review", {
        message: "User not found",
        title: "Error",
      });
    }
    let reviewerData = await userCollection.findOne({ username: reviewer });
    if (!reviewerData) {
      return res.status(400).render("error", {
        message: "Reviewer not found",
        title: "Error",
      });
    }

    return res.render("review", {
      user: user,
      reviewer: reviewer,
      rideId: rideId,
    });
  } catch (e) {
    return res.status(500).render("error", {
      message: e,
      title: "Error",
    });
  }
});

router.post("/", async (req, res) => {
  let reviewer = req.body.reviewer;
  let user = req.body.user;
  let rideId = req.body.rideId;
  let rating = req.body.rating;
  let comment = req.body.comment;
  try {
    reviewer = validator.checkString(reviewer, "Reviewer");
    user = validator.checkString(user, "User");
    // rideId = validator.isValidId(rideId, "Ride ID");
    rating = validator.checkNumber(rating, "Rating");
    if (rating < 1 || rating > 5) {
      throw new Error("Rating should be between 1 and 5");
    }
    comment = validator.checkString(comment, "Comment");
  } catch (e) {
    return res.status(400).render("review", {
      reviewer,
      user,
      rideId,
      error: e.message,
      title: "Error",
    });
  }
  try {
    const userCollection = await users();
    let userData = await userCollection.findOne({ username: user });
    if (!userData) {
      throw new Error("User not found");
    }
    let reviewerData = await userCollection.findOne({ username: reviewer });
    if (!reviewerData) {
      throw new Error("Reviewer not found");
    }

    let reviewsList = userData.reviews;
    if (!reviewsList) {
      reviewsList = [];
    }
    reviewsList.push({
      rideId: rideId,
      reviewer: reviewer,
      rating: rating,
      comment: comment,
    });
    let updatedUser = await userCollection.updateOne(
      { username: user },
      { $set: { reviews: reviewsList } }
    );
    if (updatedUser.modifiedCount === 0) {
      return res.status(400).render("review", {
        reviewer,
        user,
        rideId,
        error: e.message,
        title: "Error",
      });
    }
    return res.render("review", {
      reviewer,
      user,
      rideId,
      success: "Review submitted successfully!",
      title: "Review",
    });
  } catch (e) {
    return res.status(400).render("review", {
      reviewer,
      user,
      rideId,
      error: e.message,
      title: "Error",
    });
  }
});

export default router;