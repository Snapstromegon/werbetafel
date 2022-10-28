import "./env.js";
import sql from "./db.js";
import { FastifyPluginAsync } from "fastify";
import responses from "./responses.js";

const seed = Math.random() + "";
let webhookReachableCallback;

export const fastifyPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.all("/webhook", async (request) => {
    console.log("Telegram Webhook", JSON.stringify(request.body));
    await sql`INSERT INTO received_hooks ${sql({
      update_id: (request.body as any).update_id,
      data: JSON.stringify(request.body),
    })}`;

    if (!("message" in (request.body as Object))) {
      console.log("Not a message");
      return {};
    }

    try {
      const message = (request.body as any).message as {
        message_id: number;
        from: {
          id: number;
          is_bot: boolean;
          first_name: string;
          last_name: string;
          username: string;
          language_code: string;
        };
        chat: {
          id: number;
          is_bot: boolean;
          first_name: string;
          last_name: string;
          username: string;
          type: string;
        };
        date: number;
        text?: string;
        caption?: string;
        photo: {
          file_id: string;
          file_unique_id: string;
          file_size: number;
          width: number;
          height: number;
        }[];
        animation: {
          file_id: string;
          file_unique_id: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          width: number;
          height: number;
          duration: number;
        };
        video_note: {
          file_id: string;
          file_unique_id: string;
          file_size: number;
          length: number;
          duration: number;
        };
        video: {
          file_id: string;
          file_unique_id: string;
          mime_type: string;
          file_size: number;
          width: number;
          height: number;
          duration: number;
        };
      };

      let mode = "text";

      await sql`INSERT INTO users ${sql({
        id: message.from.id,
        is_bot: message.from.is_bot,
        first_name: message.from.first_name,
        last_name: message.from.last_name,
        username: message.from.username,
      })} ON CONFLICT ("id") DO UPDATE SET
    is_bot = ${message.from.is_bot},
    first_name = ${message.from.first_name},
    last_name = ${message.from.last_name},
    username = ${message.from.username}
    WHERE users."id" = ${message.from.id}`;

      const messageId = (
        await sql`INSERT INTO messages ${sql({
          message_id: message.message_id,
          update_id: (request.body as any).update_id,
          from_user_id: message.from.id,
          chat_id: message.chat.id,
          date: new Date(message.date * 1000),
          text: message.text || message.caption || null,
        })} RETURNING message_id`
      )[0].message_id;

      if (message.photo) {
        await sql`INSERT INTO photos ${sql(
          message.photo.map((photoVersion) => ({
            file_id: photoVersion.file_id,
            file_unique_id: photoVersion.file_unique_id,
            width: photoVersion.width,
            height: photoVersion.height,
            file_size: photoVersion.file_size,
            message_id: messageId,
          }))
        )}`;
        mode = "photo";
      }
      if (message.animation) {
        await sql`INSERT INTO animations ${sql({
          file_id: message.animation.file_id,
          file_unique_id: message.animation.file_unique_id,
          file_size: message.animation.file_size,
          file_name: message.animation.file_name,
          mime_type: message.animation.mime_type,
          duration: message.animation.duration,
          width: message.animation.width,
          height: message.animation.height,
          message_id: messageId,
        })}`;
        mode = "animation";
      }
      if (message.video_note) {
        await sql`INSERT INTO video_notes ${sql({
          file_id: message.video_note.file_id,
          file_unique_id: message.video_note.file_unique_id,
          file_size: message.video_note.file_size,
          duration: message.video_note.duration,
          length: message.video_note.length,
          message_id: messageId,
        })}`;
        mode = "videoNote";
      }
      if (message.video) {
        await sql`INSERT INTO videos ${sql({
          file_id: message.video.file_id,
          file_unique_id: message.video.file_unique_id,
          file_size: message.video.file_size,
          mime_type: message.video.mime_type,
          duration: message.video.duration,
          width: message.video.width,
          height: message.video.height,
          message_id: messageId,
        })}`;
        mode = "video";
      }
      fetch(
        `https://api.telegram.org/bot${
          process.env.TELEGRAM_BOT_TOKEN
        }/sendMessage?chat_id=${message.chat.id}&text=${encodeURIComponent(
          pickRandomResponse(mode)
        )}`
      );
    } catch (e) {
      console.error("Webhook error", e);
    }
    return {};
  });
  fastify.get("/setuptest/:seed", (request) => {
    if ((request.params as { seed: string }).seed == seed) {
      webhookReachableCallback?.();
      return { success: "Verified" };
    } else {
      return { error: "Wrong seed", seed };
    }
  });
};

export const init = async () => {
  console.log("Initializing bot...");
  const verifier = new Promise((res, rej) => {
    const timeout = setTimeout(rej, 10000);
    webhookReachableCallback = () => {
      clearTimeout(timeout);
      res(undefined);
    };
  }).catch(() => {
    console.log("Bot init failed", seed);
  });
  fetch(`${process.env.BASE_URL}telegram/setuptest/${seed}`);
  await verifier;
  console.log("Bot route verified");
  console.log("Registering webhook");

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${process.env.BASE_URL}telegram/webhook`
  );
  const result = await response.json();
  console.log(result);
  console.log("Bot init done");
};

const pickRandomResponse = (mode) => {
  const possibleResponses = [...responses.all, ...(responses[mode] || [])];
  return possibleResponses[
    Math.floor(Math.random() * possibleResponses.length)
  ];
};
