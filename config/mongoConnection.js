import { MongoClient } from "mongodb";
import { mongoConfig as _mongoConfig } from "./settings.js";
const mongoConfig = _mongoConfig;

let _connection = undefined;
let _db = undefined;

export default async () => {
  if (!_connection) {
    _connection = await MongoClient.connect(mongoConfig.serverUrl, {
      useUnifiedTopology: true,
    });
    _db = await _connection.db(mongoConfig.database);
  }

  return _db;
};
