import { ride, users } from "../config/mongoCollection.js";
import validator from "../helper.js";
import moment from "moment";

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
      { username: req.session.user.username },
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
  addDrivingLicense,
};

export default rideData;
