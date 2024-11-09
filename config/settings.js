import dotenv from "dotenv";
dotenv.config();
export const mongoConfig = {
  serverUrl: process.env.MONGO_SERVER_URL,
  database: "ride-share",
};
// export const sessionSecret =
//   process.env.SESSION_SECRET || "your_session_secret_here";
