import { ridePost } from "../config/mongoCollection.js";
import { ObjectId } from "mongodb";

async function addRidePost({
  driverId,
  origin,
  destination,
  date,
  time,
  seats,
  amount,
}) {
  const ridePostCollection = await ridePost();
  const newPost = {
    driverId: driverId,
    origin,
    destination,
    date,
    time,
    seats,
    amount,
     isAvailable: true,
    createdAt: new Date(),
    passengers: [], // Array to store passenger IDs
  };

  const insertInfo = await ridePostCollection.insertOne(newPost);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Could not add ride post.");
  }

  return insertInfo.insertedId;
}

export default { addRidePost };
