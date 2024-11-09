import dotenv from "dotenv";
dotenv.config();
console.log("MONGO_SERVER_URL:", process.env.MONGO_SERVER_URL); // Add this line to check
export const mongoConfig = {
  serverUrl: process.env.MONGO_SERVER_URL,
  database: "ride-share",
};
// export const sessionSecret =
//   process.env.SESSION_SECRET || "your_session_secret_here";
