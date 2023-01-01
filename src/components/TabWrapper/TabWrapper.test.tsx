import React from "react";
import { render, screen } from "@testing-library/react";
import { TabWrapper } from "./index";
import mockrouter from "next-router-mock";
import { mockUser } from "@testing/mockData";
jest.mock("next/router", () => require("next-router-mock"));

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: jest.fn(() => mockUser),
}));

describe("TabWrapper Component", () => {
  test("it should exist", () => {
    mockrouter.setCurrentUrl("/");
    render(
      <TabWrapper>
        <div>hello</div>
      </TabWrapper>
    );
    expect(screen.getByTestId("TabWrapper-wrapper")).toBeInTheDocument();
    const tabs = screen.getAllByRole("link");
    expect(tabs[0]).toHaveAttribute("data-active-tab", "true");
    expect(tabs[1]).toHaveAttribute("data-active-tab", "false");
    expect(tabs[2]).toHaveAttribute("data-active-tab", "false");
  });
});
