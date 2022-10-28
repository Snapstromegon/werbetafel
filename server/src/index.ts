import "./env.js";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import * as url from "url";
import {
  fastifyPlugin as telegramBot,
  init as initBot,
} from "./telegram-bot.js";
import { fastifyPlugin as api } from "./api.js";
import { fastifyPlugin as admin } from "./admin.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const app = Fastify({ logger: true });

app.register(fastifyStatic, { root: join(__dirname, "../../client/build") });
app.register(telegramBot, { prefix: "telegram" });
app.register(api, { prefix: "api" });
app.register(admin, { prefix: "admin" });

app.listen({ port: parseInt(process.env.port || "80"), host: "0.0.0.0" });

await initBot();

// console.log(process.env);
