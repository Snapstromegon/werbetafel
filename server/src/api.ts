import sql from "./db.js";
import { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";
import { Message, Photo, User, Video, VideoNote } from "./db_types.js";
import fastifyReplyFrom from "@fastify/reply-from";

export const fastifyPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(fastifyReplyFrom, {
    undici: {
      pipelining: 5,
      keepAliveTimeout: 60 * 1000,
    },
  });
  fastify.register(cors);
  fastify.get("/messages", async (request) => {
    const query = request.query as { from?: string };
    const from = parseInt(query.from);
    const messages = await sql<
      Message[]
    >`SELECT * FROM messages WHERE hidden = false ${
      from ? sql`AND number >= ${from}` : sql``
    } LIMIT 1024`;
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
    const hidden =
      await sql`SELECT message_id FROM messages WHERE hidden = true`;
    return {
      messages,
      users,
      photos,
      animations,
      videoNotes,
      videos,
      hidden,
    };
  });

  fastify.get("/file/:fileId", (request, reply) => {
    const fileId = (request.params as { fileId: string }).fileId;
    console.log("Requested file", fileId);
    fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
    )
      .then((response) => response.json())
      .then((result) => {
        const filePath = result?.result?.file_path;
        console.log("Respond with file", fileId, filePath, result);
        reply.from(
          `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`
        );
      });
  });
};
