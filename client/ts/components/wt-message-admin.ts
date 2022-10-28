import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { AppMessage } from "../types.js";

@customElement("wt-message-admin")
export default class WTMessageAdmin extends LitElement {
  static styles = css`
  `;

  @state() messages = [];

  override render() {
    return html`
    `;
  }
}
