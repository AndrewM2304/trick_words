import React from "react";
import { render, screen } from "@testing-library/react";
import { SetupProfile } from "./index";
import { mockUser, mockUserRow } from "@testing/mockData";

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockUserRow),
}));
describe("SetupProfile Component", () => {
  test("it should exist", () => {
    render(<SetupProfile />);
    expect(screen.getAllByText("Welcome").length).toBe(2);
  });
});
