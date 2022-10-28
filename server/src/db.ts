import postgres from "postgres";
import "./env.js";
import { join } from "path";
import * as url from "url";
import { readFile } from "fs/promises";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const sql = postgres({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  db: process.env.POSTGRES_DB,
}); // will use psql environment variables

await sql.file(join(__dirname, "../init.sql"));

export default sql;
