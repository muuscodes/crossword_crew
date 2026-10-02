import request from "supertest";
import { afterEach, expect, test } from "vitest";
import { api, createTestContext, signUp } from "./helpers.js";

let context;
afterEach(() => context?.close());

const feedback = { kind: "bug", message: "The grid froze on 7 down.", userAgent: "TestBrowser/1.0" };

test("feedback goes to the owner's inbox, ready to reply to the sender", async () => {
  context = await createTestContext();
  const { client } = await signUp(context.app, "ann");
  context.sentEmails.length = 0;
  await client.post("/email/feedback").send(feedback).expect(200);

  expect(context.sentEmails).toEqual([
    expect.objectContaining({
      to: "owner@example.com",
      replyTo: "ann@example.com",
      subject: "Crossword Crew bug report from ann",
    }),
  ]);
  const { text } = context.sentEmails[0];
  expect(text).toContain("The grid froze on 7 down.");
  expect(text).toContain("Browser: TestBrowser/1.0");
});

test("without FEEDBACK_EMAIL, feedback goes to the sending account", async () => {
  context = await createTestContext({ feedbackTo: null });
  const { client } = await signUp(context.app, "ann");
  context.sentEmails.length = 0;
  await client.post("/email/feedback").send({ kind: "comment", message: "Love it!" }).expect(200);
  expect(context.sentEmails[0]).toMatchObject({ to: "team@example.com", subject: "Crossword Crew comment from ann" });
  expect(context.sentEmails[0].text).not.toContain("Browser:");
});

test("feedback needs a type and a message", async () => {
  context = await createTestContext();
  const { client } = await signUp(context.app, "ann");
  const missingKind = await client.post("/email/feedback").send({ message: "Hi" }).expect(400);
  expect(missingKind.body.message).toBe("Choose whether this is a bug, feedback or a comment.");
  const blank = await client.post("/email/feedback").send({ kind: "feedback", message: "   " }).expect(400);
  expect(blank.body.message).toBe("Messages are 1 to 5000 characters.");
});

test("feedback needs a login", async () => {
  context = await createTestContext();
  await api(request(context.app)).post("/email/feedback").send(feedback).expect(401);
});
