import authRoutes from "./auth.js";
import { static as staticDir } from "express";
const constructorMethods = (app) => {
  app.use("/", authRoutes);
  app.use("/public", staticDir("public"));
  app.use("*", (req, res) => {
    res.redirect("/");
  });
};

export default constructorMethods;
