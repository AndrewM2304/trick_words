import React from "react";
import { render, screen } from "@testing-library/react";
import { AccountSettings } from "./index";
import { mockSession, mockUser, mockUserRow } from "@testing/mockData";

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockUserRow),
}));
describe("AccountSettings Component", () => {
  test("it should exist", () => {
    render(<AccountSettings session={mockSession} />);
    expect(screen.getByTestId("AccountSettings-wrapper")).toBeInTheDocument();
  });
});
