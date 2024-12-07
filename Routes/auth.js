import express from "express";
import validator from "../helper.js"; // Ensure helper.js exists and has necessary functions
import bcrypt from "bcrypt";
import usersData from "../data/users.js";
import isAuthenticated from "../middleware/authMiddleware.js";

const router = express.Router();

// Middleware to protect routes
const ensureAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Render signup page
router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

// Handle signup form submission
router.post("/signup", async (req, res) => {
  // console.log(req.body);
  let { firstname, lastname, phone, username, email, password } = req.body;

  // Initial field presence check
  if (!firstname || !lastname || !phone || !username || !email || !password) {
    return res.status(400).render("error", {
      message: "All fields must be filled out.",
      title: "Sign Up",
    });
  }

  // Validation checks
  let errors = [];
  try {
    firstname = validator.checkString(firstname, "First Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    lastname = validator.checkString(lastname, "Last Name");
  } catch (e) {
    errors.push(e);
  }
  try {
    phone = validator.isValidPhoneNumber(phone, "Phone Number");
  } catch (e) {
    errors.push(e);
  }
  try {
    username = validator.checkString(username, "Username");
  } catch (e) {
    errors.push(e);
  }
  try {
    password = validator.checkString(password, "Password");
  } catch (e) {
    errors.push(e);
  }
  try {
    email = validator.isValidEmail(email, "Email");
  } catch (e) {
    errors.push(e);
  }

  // Check if username already exists (this should be asynchronous)
  if (await usersData.findByUsername(username)) {
    errors.push(`${username} already exists.`);
  }

  if (errors.length > 0) {
    return res.status(400).render("signup", {
      errors,
      hasErrors: true,
      signup: { firstname, lastname, phone, username, email },
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Attempt to add the user
  try {
    await usersData.addUser({
      firstname,
      lastname,
      phone,
      username,
      email,
      password: hashedPassword,
      rider_review: 0,
      Driver_reviw: 0,
      number_of_rides_taken: 0,
      number_of_rides_given: 0,
      number_of_reports_made: 0,
    });
    res.redirect("/login");
  } catch (e) {
    res.status(500).render("signup", {
      error: "Error creating account. Please try again.",
      title: "Sign Up",
    });
  }
});

// Render login page
router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("login", { title: "Login" });
});

// Handle login form submission
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await usersData.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = {
        id: user.id,
        username: user.username,
      };
      return res.redirect("/dashboard");
    } else {
      return res.status(400).render("login", {
        error: "Invalid username or password",
        title: "Login",
      });
    }
  } catch (e) {
    res.status(500).render("login", {
      error: "Login failed",
      title: "Login",
    });
  }
});

// Handle logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Unable to log out");
    }
    res.redirect("/login");
  });
});

// router.use(isAuthenticated);
// Render dashboard page after login
router.get("/", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { title: "Dashboard", user: req.session.user });
});

// router.get("/rideSearch", ensureAuthenticated, (req, res) => {
//   res.render("rideSearch", { title: "Ride Search", user: req.session.user });
// });

// router.get("/ridePost", ensureAuthenticated, (req, res) => {
//   res.render("ridePost", { title: "Ride Post", user: req.session.user });
// });

router.get("/profile", async (req, res) => {
  try {
    // Assuming `req.session.user` contains the logged-in user's ID or username
    const username = req.session.user.username;
    const user = await usersData.findByUsername(username);

    if (!user) {
      return res
        .status(404)
        .render("error", { message: "User not found", title: "Error" });
    }

    // Pass the user data to the template
    res.render("profile", {
      title: "Profile",
      user: {
        name: user.firstname + " " + user.lastname,
        phone: user.phone || "Not Provided",
        email: user.email || "Not Provided",
        username: user.username,
        reviewsAsRider: user.reviewsAsRider || 0,
        reviewsAsDriver: user.reviewsAsDriver || 0,
        ridesTaken: user.ridesTaken || 0,
        ridesGiven: user.ridesGiven || 0,
        reportsMade: user.reportsMade || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { message: "Internal Server Error", title: "Error" });
  }
});

export default router;
