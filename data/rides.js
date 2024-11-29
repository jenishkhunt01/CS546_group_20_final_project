import { ride } from "../config/mongoCollection.js";
import validator from "../helper.js";

async function addRide(reqBody) {
  let rideData = {
    driverId,
    destination,
    rideFrom,
    isActive,
    isCancelled,
    price,
    date,
    time,
    ridersList,
    waitList,
    car,
  };
  try {
    rideData.driverId = isValidId(reqBody.driverId);
    rideData.destination = checkString(reqBody.destination, "destination");
    rideData.rideFrom = checkString(reqBody.rideFrom, "rideFrom");
    rideData.isActive = true;
    rideData.isCancelled = false;
    rideData.price = isNumber(reqBody.price, "price");
    rideData.date = checkDate(reqBody.date);
    rideData.time = checkTime(reqBody.time);
    rideData.ridersList = [];
    rideData.waitList = [];
    let carObj = {
      carType: checkString(reqBody.carType, "carType"),
      seatsAvailable: isNumber(reqBody.seatsAvailable, "seatsAvailable"),
    };
    rideData.car = carObj;
  } catch (e) {
    return res.status(400).render("error", {
      message: e.message,
      title: "Ride Post",
    });
  }

  const rideCollection = await ride();
  const ridesPosted = await rideCollection.find({}).toArray(); //check if the ride is already posted
}

const rideData = {
  addRide,
};

export default rideData;
