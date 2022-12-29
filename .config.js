import dotenv from "dotenv";

dotenv.config(".env");

let config = {}

config.common_db_host = process.env.COMMON_DB_PASSWORD
config.common_db_port = process.env.COMMON_DB_HOST
config.db_user_name = process.env.DB_USERNAME
config.db_port = process.env.DB_PORT