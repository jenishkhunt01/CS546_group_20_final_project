import express from "express";
import http from "http";
import { Server } from "socket.io";
import session from "express-session";
import exphbs from "express-handlebars";
import path from "path";
import constructorMethods from "./Routes/index.js";
import cron from "node-cron";
import { chatCleanup } from "./Routes/utils/chatCleanup.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "AuthCookie",
    secret: "your_session_secret", // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }, // 10 minutes
  })
);

// Set up the view engine
// const hbs = exphbs.create({ defaultLayout: "main" });

const hbs = exphbs.create({
  helpers: {
    json: (context) => JSON.stringify(context), // Define JSON.stringify helper
  },
  defaultLayout: "main",
  layoutsDir: path.join(path.resolve(), "views", "layouts"),
  partialsDir: [path.join(path.resolve(), "views", "partials")],
});

cron.schedule("* * * * *", async () => {
  console.log("Running daily chat cleanup...");
  await chatCleanup();
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(path.resolve(), "views"));

// Serve static files
app.use("/public", express.static(path.join(path.resolve(), "public")));

constructorMethods(app);

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
