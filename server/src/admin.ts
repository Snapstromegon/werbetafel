import sql from "./db.js";
import { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import { Message, Photo, User, Video, VideoNote } from "./db_types.js";

export const fastifyPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(cors);
  fastify.get("/messages", async (request) => {
    const query = request.query as { from?: string };
    const from = parseInt(query.from);
    const messages = await sql<Message[]>`SELECT * FROM messages`;
    const users = await sql<User[]>`SELECT * FROM users WHERE id in ${sql(
      messages.map((message) => message.from_user_id)
    )}`;
    const animations = await sql<
      Animation[]
    >`SELECT * FROM animations WHERE message_id in ${sql(
      messages.map((message) => message.message_id)
    )}`;
    const videoNotes = await sql<
      VideoNote[]
    >`SELECT * FROM video_notes WHERE message_id in ${sql(
      messages.map((message) => message.message_id)
    )}`;
    const videos = await sql<
      Video[]
    >`SELECT * FROM videos WHERE message_id in ${sql(
      messages.map((message) => message.message_id)
    )}`;
    const photos = await sql<
      Photo[]
    >`SELECT * FROM photos WHERE message_id in ${sql(
      messages.map((message) => message.message_id)
    )}`;
    const response = {
      messages,
      users,
      photos,
      animations,
      videoNotes,
      videos,
    };
    console.log(response);
    return response;
  });

  fastify.post("/hideMessage/", async (request) => {
    const body: {
      messageId: string;
      hidden: boolean;
      password: string;
    } = request.body as any;

    if (body.password != process.env.ADMIN_SECRET) {
      throw { statusCode: 403, message: "Wrong Password" };
    }
    const newHidden =
      await sql`UPDATE messages SET hidden = ${body.hidden} WHERE message_id = ${body.messageId} RETURNING hidden`;
    return { hidden: newHidden[0], messageId: body.messageId };
  });
};
