import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import ErrorBoundary from "../components/Common/ErrorBoundary";

function Broken() {
  throw new Error("Boom");
}

test("a crash shows a way out instead of a blank page", () => {
  // React and the boundary both log the crash; keep the test output clean.
  vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>,
  );
  expect(screen.getByRole("heading", { name: "Something went wrong" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Reload the page" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
});

test("pages that work are shown as usual", () => {
  render(
    <ErrorBoundary>
      <p>All good</p>
    </ErrorBoundary>,
  );
  expect(screen.getByText("All good")).toBeInTheDocument();
});
