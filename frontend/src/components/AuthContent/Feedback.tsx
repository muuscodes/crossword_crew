import { faBug, faCheck, faCommentDots, faLightbulb, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type FormEvent, useState } from "react";
import { apiRequest, errorMessage } from "../../lib/api";
import PageHeader from "../Common/PageHeader";
import StatusMessage, { type Status } from "../Common/StatusMessage";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, CARD_HEADER, INPUT } from "../Common/styles";

const KINDS = [
  {
    value: "bug",
    label: "Bug",
    icon: faBug,
    description: "Something broke or didn't work the way you expected.",
    placeholder: "What happened, and what did you expect to happen? Which page were you on?",
  },
  {
    value: "feedback",
    label: "Feedback",
    icon: faLightbulb,
    description: "An idea, a feature request, or something that could work better.",
    placeholder: "What would make Crossword Crew better for you?",
  },
  {
    value: "comment",
    label: "Comment",
    icon: faCommentDots,
    description: "Anything else on your mind.",
    placeholder: "Say hello, tell me about a puzzle you loved, anything at all.",
  },
] as const;

type Kind = (typeof KINDS)[number]["value"];

const MAX_MESSAGE = 5000;

// Bug reports, ideas and comments, sent to whoever runs the site. The server adds the sender's
// username and account email, so there's nothing to fill in but the message.
export default function Feedback() {
  const [kind, setKind] = useState<Kind | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const chosen = KINDS.find((option) => option.value === kind);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!kind) return setStatus({ tone: "error", text: "Choose whether this is a bug, feedback or a comment." });
    if (!message.trim()) return setStatus({ tone: "error", text: "Write your message first." });
    setSending(true);
    setStatus(null);
    try {
      await apiRequest("/email/feedback", {
        method: "POST",
        // Browser details help track down bugs; other messages don't need them.
        body: { kind, message, userAgent: kind === "bug" ? navigator.userAgent : null },
      });
      setSent(true);
      setKind(null);
      setMessage("");
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14">
      <PageHeader label="Bugs, ideas and comments" title="Send feedback">
        <p>
          This form is for feedback about Crossword Crew: bug reports, ideas for new features, or any
          other comments. Your message comes straight to me, the person who builds the site.
        </p>
      </PageHeader>

      {sent ? (
        <section role="status" className={`${CARD} flex flex-col items-center gap-4 p-8 text-center`}>
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center border-2 border-black bg-cursor text-2xl">
            <FontAwesomeIcon icon={faCheck} />
          </span>
          <h2 className="text-3xl font-extrabold">Thanks for writing in!</h2>
          <p className="text-lg text-neutral-700">
            Your message is on its way. If I need more details, I'll reply to the email on your account.
          </p>
          <button type="button" className={BUTTON_SECONDARY} onClick={() => setSent(false)}>
            Send another message
          </button>
        </section>
      ) : (
        <form onSubmit={submit} aria-busy={sending} className={CARD}>
          <h2 className={CARD_HEADER}>Your message</h2>
          <div className="flex flex-col gap-6 p-5 text-left sm:p-6">
            <fieldset>
              <legend className="mb-3 text-lg font-bold">What kind of message is this?</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {KINDS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer flex-col gap-1 border-2 border-black bg-white p-3 shadow-tile transition-colors hover:bg-yellow-50 has-checked:bg-cursor has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
                  >
                    <input
                      type="radio"
                      name="kind"
                      value={option.value}
                      checked={kind === option.value}
                      onChange={() => setKind(option.value)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2 text-xl font-extrabold">
                      <FontAwesomeIcon icon={option.icon} />
                      {option.label}
                    </span>
                    <span className="text-base text-neutral-700">{option.description}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-2">
              <label htmlFor="feedback-message" className="text-lg font-bold">
                Message
              </label>
              <textarea
                id="feedback-message"
                rows={8}
                maxLength={MAX_MESSAGE}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={chosen?.placeholder ?? "Choose a type above, then tell me about it."}
                className={`${INPUT} resize-y`}
              />
              <p className="text-right text-sm text-neutral-500">
                {message.length} / {MAX_MESSAGE}
              </p>
            </div>

            <p className="border-2 border-black bg-blue-50 p-3 text-base">
              Your username and account email are sent with your message, so I can reply.
              {kind === "bug" && " Bug reports also include your browser and device type, to help track the problem down."}
            </p>

            <StatusMessage status={status} />
            <button type="submit" className={`${BUTTON_PRIMARY} self-start`} disabled={sending}>
              {sending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Sending…
                </>
              ) : (
                "Send feedback"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
