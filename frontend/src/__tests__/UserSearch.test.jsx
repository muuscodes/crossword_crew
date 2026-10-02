import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";
import UserSearch from "../components/Common/UserSearch";
import { mockApi } from "./testUtils";

const USERNAMES = ["annabel", "bob", "Bobby", "carol"];

function mockSearch() {
  return mockApi({
    "GET /users/search": (_body, params) => {
      const query = (params.get("q") ?? "").toLowerCase();
      return { users: USERNAMES.filter((name) => name.toLowerCase().includes(query)) };
    },
  });
}

function Harness() {
  const [value, setValue] = useState("");
  return (
    <>
      <label htmlFor="recipient">Send to</label>
      <UserSearch id="recipient" value={value} onChange={setValue} />
      <p data-testid="value">{value}</p>
    </>
  );
}

const box = () => screen.getByRole("combobox", { name: "Send to" });

describe("UserSearch", () => {
  test("opens a dropdown of every username when focused", async () => {
    const user = userEvent.setup();
    mockSearch();
    render(<Harness />);
    await user.click(box());
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual(USERNAMES);
    expect(box()).toHaveAttribute("aria-expanded", "true");
  });

  test("typing narrows the list and a click picks a name", async () => {
    const user = userEvent.setup();
    mockSearch();
    render(<Harness />);
    await user.type(box(), "bo");
    await screen.findByRole("option", { name: "Bobby" });
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["bob", "Bobby"]);

    await user.click(screen.getByRole("option", { name: "Bobby" }));
    expect(box()).toHaveValue("Bobby");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("arrow keys and Enter pick a name, Escape closes", async () => {
    const user = userEvent.setup();
    mockSearch();
    render(<Harness />);
    await user.type(box(), "o");
    await screen.findByRole("option", { name: "carol" });
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("option", { name: "Bobby" })).toHaveAttribute("aria-selected", "true");
    expect(box()).toHaveAttribute("aria-activedescendant", "recipient-option-1");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("Bobby");

    await user.keyboard("{ArrowDown}");
    expect(box()).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    expect(box()).toHaveAttribute("aria-expanded", "false");
  });

  test("says when nothing matches", async () => {
    const user = userEvent.setup();
    mockSearch();
    render(<Harness />);
    await user.type(box(), "zzz");
    expect(await screen.findByText("No matching users")).toBeInTheDocument();
  });
});
