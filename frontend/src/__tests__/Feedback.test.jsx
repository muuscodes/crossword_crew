import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Feedback from "../components/AuthContent/Feedback";
import { callsTo, jsonResponse, mockApi, renderPage } from "./testUtils";

const renderFeedback = () => renderPage(<Feedback />, { route: "/feedback", path: "/feedback" });

describe("Feedback", () => {
  test("says plainly what the form is for", () => {
    renderFeedback();
    expect(screen.getByRole("heading", { level: 1, name: "Send feedback" })).toBeInTheDocument();
    expect(screen.getByText(/bug reports, ideas for new features, or any\s+other comments/)).toBeInTheDocument();
    for (const kind of ["Bug", "Feedback", "Comment"]) {
      expect(screen.getByRole("radio", { name: new RegExp(`^${kind}`) })).toBeInTheDocument();
    }
  });

  test("sends a bug report with browser details, then says thanks", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /email/feedback": { message: "Thanks! Your message is on its way." } });
    renderFeedback();
    await user.click(screen.getByRole("radio", { name: /^Bug/ }));
    expect(screen.getByText(/Bug reports also include your browser/)).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Message" }), "The grid froze.");
    await user.click(screen.getByRole("button", { name: "Send feedback" }));

    expect(await screen.findByRole("heading", { name: "Thanks for writing in!" })).toBeInTheDocument();
    expect(callsTo(fetchMock, "POST", "/email/feedback")).toEqual([
      { kind: "bug", message: "The grid froze.", userAgent: navigator.userAgent },
    ]);

    await user.click(screen.getByRole("button", { name: "Send another message" }));
    expect(screen.getByRole("textbox", { name: "Message" })).toHaveValue("");
  });

  test("comments don't include browser details", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({ "POST /email/feedback": { message: "Thanks!" } });
    renderFeedback();
    await user.click(screen.getByRole("radio", { name: /^Comment/ }));
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Love it!");
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    await screen.findByRole("heading", { name: "Thanks for writing in!" });
    expect(callsTo(fetchMock, "POST", "/email/feedback")[0]).toEqual({ kind: "comment", message: "Love it!", userAgent: null });
  });

  test("asks for a type and a message before sending", async () => {
    const user = userEvent.setup();
    const fetchMock = mockApi({});
    renderFeedback();
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Hello");
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Choose whether this is a bug, feedback or a comment.");

    await user.clear(screen.getByRole("textbox", { name: "Message" }));
    await user.click(screen.getByRole("radio", { name: /^Feedback/ }));
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Write your message first.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("shows the server's error", async () => {
    const user = userEvent.setup();
    mockApi({ "POST /email/feedback": jsonResponse({ message: "Email isn't set up on this server yet." }, 503) });
    renderFeedback();
    await user.click(screen.getByRole("radio", { name: /^Feedback/ }));
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Hello");
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Email isn't set up");
  });
});
