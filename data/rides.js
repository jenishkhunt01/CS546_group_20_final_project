import { ride, users } from "../config/mongoCollection.js";
import validator from "../helper.js";
import { carTypes, locations } from "../constants.js";
import moment from "moment";

async function addRide(reqBody, res, userId) {
  let rideData = {
    driverId: "",
    endLocation: "",
    startLocation: "",
    isActive: false,
    isCancelled: false,
    price: 0,
    date: "",
    time: "",
    ridersList: [],
    waitList: [],
    carType: "",
    seatsAvailable: 0,
  };
  try {
    rideData.driverId = validator.checkString(userId, "driverId");
    rideData.endLocation = validator.checkString(
      reqBody.endLocation,
      "end Location"
    );
    rideData.startLocation = validator.checkString(
      reqBody.startLocation,
      "start Location"
    );
    rideData.isActive = true;
    rideData.isCancelled = false;
    rideData.price = validator.checkNumber(reqBody.price, "price");
    rideData.date = validator.checkDate(reqBody.date);
    rideData.time = validator.checkTime(reqBody.time);
    rideData.ridersList = [];
    rideData.waitList = [];
    rideData.carType = validator.checkString(reqBody.carType, "carType");
    rideData.seatsAvailable = validator.checkNumber(
      reqBody.seatsAvailable,
      "seatsAvailable"
    );
    if (!locations.includes(rideData.endLocation)) {
      throw new Error("Invalid destination");
    }
    if (!locations.includes(rideData.startLocation)) {
      throw new Error("Invalid ride start location");
    }
    if (!carTypes.has(rideData.carType)) {
      throw new Error("Invalid car type");
    }
    if (
      rideData.seatsAvailable > carTypes.get(rideData.carType) ||
      rideData.seatsAvailable < 1
    ) {
      throw new Error(
        `Invalid number of seats available. Maximum allowed seats for ${
          rideData.carType
        } is ${carTypes.get(rideData.carType)}`
      );
    }
    if (
      rideData.startLocation.toLowerCase() ===
      rideData.endLocation.toLowerCase()
    ) {
      throw new Error("Start and end locations cannot be the same");
    }
    const currentDate = moment();
    const rideDateTime = moment(
      `${rideData.date} ${rideData.time}`,
      "YYYY-MM-DD HH:mm"
    );

    if (!rideDateTime.isValid() || rideDateTime.isSameOrBefore(currentDate)) {
      throw new Error("Date and time must be in the future");
    }
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
  const rideCollection = await ride();
  const ridesPosted = await rideCollection.count({
    driverId: rideData.driverId,
    isActive: true,
  }); //check if the ride is already posted
  if (ridesPosted > 0) {
    return res.status(400).json({ message: "You have already posted a ride" });
  }
  try {
    const insertInfo = await rideCollection.insertOne(rideData);
    if (insertInfo.insertedCount === 0) {
      return res.status(500).json({ message: "Could not add ride" });
    }
    return res.status(200).json({ message: "Ride added successfully" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
}

async function addDrivingLicense(license, licenseImg, res, req) {
  try {
    license = validator.checkString(license, "license");
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
  let driverDetails = {
    license,
    licenseImg: licenseImg.id,
  };
  try {
    const userCollection = await users();
    const updateInfo = await userCollection.updateOne(
      { userId: req.session.user.userId },
      { $set: { driverDetails, isVerified: true } }
    );
    if (updateInfo.modifiedCount === 0) {
      return res.status(500).json({ message: "Could not add driving license" });
    }
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
  req.session.user.isVerified = true;
  return res.redirect("/ridePost");
}

const rideData = {
  addRide,
  addDrivingLicense,
};

export default rideData;
