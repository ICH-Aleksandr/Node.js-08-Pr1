import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import db_config from "./config.js";

dotenv.config();

const env = process.NODE_ENV || "development";
const config = db_config[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
  },
);

export default sequelize;
