import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AppMessage } from "../types.js";

@customElement("wt-message")
export default class WTMessage extends LitElement {
  static styles = css`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    img,
    video {
      width: 100%;
      height: auto;
    }

    h1 {
      text-align: center;
      font-size: 10rem;
      word-break: break-word;
    }
    p {
      font-size: 3rem;
      word-break: break-word;
    }

    #message {
      width: 100%;
      height: 100%;
      display: grid;
      align-items: center;
    }
  `;

  @property({ attribute: false }) message: AppMessage;

  get videoSrc() {
    if (
      this.message &&
      (this.message.animation || this.message.video || this.message.videoNote)
    ) {
      return `https://telegram.home.hoeser.dev/api/file/${
        this.message?.animation?.file_id ||
        this.message?.video?.file_id ||
        this.message?.videoNote?.file_id
      }`;
    }
  }

  override render() {
    return html`
      <p>#${this.message?.number} ${this.message?.user.first_name}</p>
      <div id="message">
        ${this.message?.photo
          ? html`
              <img
                src=${`https://telegram.home.hoeser.dev/api/file/${
                  this.message.photo.at(-1).file_id
                }`}
              />
            `
          : html``}
        ${this.videoSrc
          ? html` <video autoplay loop muted src=${this.videoSrc}></video> `
          : html``}
        ${this.message?.text ? html`<h1>${this.message.text}</h1>` : html``}
      </div>
    `;
  }
}
