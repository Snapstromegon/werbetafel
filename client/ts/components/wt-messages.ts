import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  AppMessage,
  Message,
  Photo,
  User,
  VideoNote,
  Animation,
  Video,
} from "../types.js";
import "./wt-message.js";
import { map } from "lit/directives/map.js";
import { range } from "lit/directives/range.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("wt-messages")
export default class WTMessages extends LitElement {
  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    main {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .remaining {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }
    wt-message {
      flex-shrink: 1;
    }

    .remainingMessage {
      width: 2rem;
      height: 2rem;
      background: #aaa;
      border-radius: 50%;
    }

    .connectionError {
      border-bottom: 1rem solid #f00;
    }
  `;

  @state() unseenMessages: AppMessage[] = [];
  seenMessages: AppMessage[] = [];
  @state() currentMessage: AppMessage;
  @state() connectionError: boolean = false;

  get totalMessageCount() {
    return this.seenMessages.length + this.unseenMessages.length;
  }

  usersById: Map<number, User> = new Map();
  photoVersionsByMessageId: Map<number, Photo[]> = new Map();
  animationByMessageId: Map<number, Animation> = new Map();
  videoNoteByMessageId: Map<number, VideoNote> = new Map();
  videoByMessageId: Map<number, Video> = new Map();

  override render() {
    return html`
      <main
        @click=${this.nextImage}
        class=${classMap({ connectionError: this.connectionError })}
      >
        <wt-message .message=${this.currentMessage}></wt-message>
        <div class="remaining">
          ${map(
            range(this.unseenMessages.length),
            () => html`<div class="remainingMessage"></div>`
          )}
        </div>
      </main>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadMessages();
    setInterval(() => this.loadMessages(), 10000);
    setInterval(() => this.nextImage(), 10000);
  }

  nextImage() {
    console.log("next image");
    const nextUnseenMessage = this.unseenMessages.shift();
    if (nextUnseenMessage) {
      this.currentMessage = nextUnseenMessage;
      this.seenMessages.push(nextUnseenMessage);
    } else {
      this.currentMessage =
        this.seenMessages[Math.floor(Math.random() * this.seenMessages.length)];
    }
  }

  async loadMessages() {
    console.log("Updating Messages");
    let data;
    try {
      const resp = await fetch(
        `https://telegram.home.hoeser.dev/api/messages?from=${
          this.totalMessageCount + 1
        }`
      );
      data = await resp.json();
      this.connectionError = false;
    } catch (e) {
      this.connectionError = true;
      return;
    }
    console.log(data);

    for (const user of data.users) {
      if (!this.usersById.has(user.id)) {
        this.usersById.set(user.id, user);
      }
    }
    for (const photo of data.photos) {
      if (!this.photoVersionsByMessageId.has(photo.message_id)) {
        this.photoVersionsByMessageId.set(photo.message_id, []);
      }
      this.photoVersionsByMessageId.get(photo.message_id).push(photo);
    }

    for (const animation of data.animations) {
      if (!this.animationByMessageId.has(animation.message_id)) {
        this.animationByMessageId.set(animation.message_id, animation);
      }
    }

    for (const videoNote of data.videoNotes) {
      if (!this.videoNoteByMessageId.has(videoNote.message_id)) {
        this.videoNoteByMessageId.set(videoNote.message_id, videoNote);
      }
    }

    for (const video of data.videos) {
      if (!this.videoByMessageId.has(video.message_id)) {
        this.videoByMessageId.set(video.message_id, video);
      }
    }

    const linkedMessages = linkMessages(
      data.messages,
      this.usersById,
      this.photoVersionsByMessageId,
      this.animationByMessageId,
      this.videoNoteByMessageId,
      this.videoByMessageId
    );
    if (linkedMessages.length) {
      this.unseenMessages.push(...linkedMessages);
      if (this.seenMessages.length == 0) {
        this.nextImage();
      }
      this.requestUpdate();
    }

    for (let i = 0; i < this.seenMessages.length; i++) {
      if (data.hidden.includes(this.seenMessages[i].message_id)) {
        this.seenMessages.splice(i, 1);
      }
    }
    for (let i = 0; i < this.unseenMessages.length; i++) {
      if (data.hidden.includes(this.unseenMessages[i].message_id)) {
        this.unseenMessages.splice(i, 1);
      }
    }

    console.log(linkedMessages);
  }
}

const linkMessages = (
  messages: Message[],
  usersById: Map<number, User>,
  photosByMessageId: Map<number, Photo[]>,
  animationByMessageId: Map<number, Animation>,
  videoNoteByMessageId: Map<number, VideoNote>,
  videoByMessageId: Map<number, Video>
) => {
  return messages.map((message) => {
    return {
      ...message,
      user: usersById.get(message.from_user_id),
      photo: photosByMessageId.get(message.message_id),
      animation: animationByMessageId.get(message.message_id),
      videoNote: videoNoteByMessageId.get(message.message_id),
      video: videoByMessageId.get(message.message_id),
    };
  });
};
