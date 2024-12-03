import authRoutes from "./auth.js";
import rideRoutes from "./rides.js";
import { static as staticDir } from "express";
const constructorMethods = (app) => {
  app.use("/", authRoutes);
  app.use("/", rideRoutes);
  app.use("/public", staticDir("public"));
  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

export default constructorMethods;
