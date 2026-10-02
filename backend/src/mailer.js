import nodemailer from "nodemailer";
import { escapeHtml } from "./lib/html.js";

const SIGN_OFF = "<p>The Crossword Crew Team</p>";

function htmlEmail(paragraphs) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      ${paragraphs.map((text) => `<p>${text}</p>`).join("\n      ")}
      ${SIGN_OFF}
    </div>
  `;
}

const FEEDBACK_LABELS = { bug: "Bug report", feedback: "Feedback", comment: "Comment" };

// emailConfig is { user, pass } for a Gmail account, or null to disable email. feedbackTo is the
// inbox for the Feedback page (the sending account when it's not set). transport overrides the
// Gmail transport (tests pass a stub).
export function createMailer(emailConfig, { feedbackTo = null, transport } = {}) {
  const transporter =
    transport ??
    (emailConfig
      ? nodemailer.createTransport({ service: "gmail", auth: emailConfig })
      : null);
  const from = emailConfig?.user;

  async function send(message) {
    if (!transporter) return;
    await transporter.sendMail({ from, ...message });
  }

  return {
    isConfigured: Boolean(transporter && from),

    sendWelcomeEmail(username, to) {
      const name = escapeHtml(username);
      return send({
        to,
        subject: "Welcome to Crossword Crew!",
        html: htmlEmail([
          `Hi ${name},`,
          "Thanks for signing up for Crossword Crew. In the Create tab, you can create new crosswords without limits! In the Library tab you'll find all the crosswords others have shared with you as well as your own crosswords. You can edit your crosswords and solve those shared with you, all from the Library tab.",
          "If you run into a problem or have an idea, send it through the Feedback page. Enjoy crosswording!",
        ]),
      });
    },

    sendSharingEmail(senderUsername, to, recipientUsername) {
      return send({
        to,
        subject: "A crossword was shared with you",
        html: htmlEmail([
          `Hi ${escapeHtml(recipientUsername)},`,
          `You've received a new crossword from ${escapeHtml(senderUsername)}! Log in to your account to start solving.`,
        ]),
      });
    },

    // A bug report, idea or comment for whoever runs the site, with the sender's account email to
    // reply to. Plain text only, so nothing in it can render as HTML.
    sendFeedback({ kind, message, username, email, userAgent }) {
      const label = FEEDBACK_LABELS[kind] ?? "Message";
      const details = [`From: ${username}${email ? ` <${email}>` : ""}`, `Type: ${label}`];
      if (userAgent) details.push(`Browser: ${userAgent}`);
      return send({
        to: feedbackTo ?? from,
        replyTo: email ?? undefined,
        subject: `Crossword Crew ${label.toLowerCase()} from ${username}`,
        text: `${details.join("\n")}\n\n${message}`,
      });
    },
  };
}
