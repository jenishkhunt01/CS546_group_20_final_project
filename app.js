import express from "express";
import configRoutes from "./Routes/index.js";
import bodyParser from "body-parser";
import exphbs from "express-handlebars";
import session from "express-session";
import isAuthenticated from "./middleware/authMiddleware.js";
import multer from "multer";
const app = express();
// const upload = multer({ dest: "uploads/" });
import upload from "./middleware/upload.js";

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};

app.use(
  session({
    name: "AuthCookie", // Custom name for the session cookie
    secret: process.env.SESSION_SECRET, // Secret key for signing the session ID
    resave: false, // Prevent session from being saved if it wasn't modified
    saveUninitialized: false, // Do not save empty sessions
    cookie: { maxAge: 600000 }, // Set cookie expiration time (10 minutes)
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use("/public", express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use((req, res, next) => {
  if (req.path === "/login" || req.path === "/signup") {
    return next();
  }
  return isAuthenticated(req, res, next);
});

app.post("/verify", upload.single("licenseImg"), (req, res, next) => {
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
