import { users } from "../config/mongoCollection.js";
import validator from "../helper.js";

async function addUser(user) {
  let firstname = user.firstname;
  let lastname = user.lastname;
  let phone = user.phone;
  let username = user.username;
  let email = user.email;
  let password = user.password;
  if (!firstname || !lastname || !phone || !username || !email || !password) {
    return res
      .status(400)
      .render("error", { message: "All the field must be present" });
  }

  try {
    firstname = validator.checkString(firstname, "First Name");
  } catch (e) {
    throw new Error(e.message);
  }
  try {
    lastname = validator.checkString(lastname, "Last Name");
  } catch (e) {
    throw new Error(e.message);
  }

  try {
    phone = validator.isValidPhoneNumber(phone, "Phone Number");
  } catch (e) {
    throw new Error(e.message);
  }

  try {
    username = validator.checkString(username, "UserName");
  } catch (e) {
    throw new Error(e.message);
  }

  try {
    password = validator.checkString(password, "Password");
  } catch (e) {
    throw new Error(e.message);
  }
  try {
    email = validator.isValidEmail(email, "email");
  } catch (e) {
    throw new Error(e.message);
  }

  const userCollection = await users();
  const addedUser = await userCollection.insertOne(user);
  if (!addedUser.insertedId)
    throw new Error("Could not add the user to the database");
  return addedUser;
}

async function findByUsername(username) {
  if (!username) throw new Error("No username was provided");

  const userCollection = await users();
  const user = userCollection.findOne({ username });

  return user;
}

const usersData = {
  addUser,
  findByUsername,
};

export default usersData;
