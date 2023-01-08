import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import { AccountSettings } from "./index";
import {
  mockSession,
  mockUser,
  mockUserProfile,
  mockUserRow,
} from "@testing/mockData";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockUserRow),
  useSessionContext: jest.fn(() => mockSession),
}));

jest.mock("@components/store", () => ({
  useUserProfileStore: jest.fn(() => ({
    userProfile: jest.fn(() => mockUserProfile),
  })),
}));

const mockSB = jest.fn();
const MockWrapper = () => {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={mockSession}
    >
      <AccountSettings />
    </SessionContextProvider>
  );
};

describe("AccountSettings Component", () => {
  test("it should exist", () => {
    render(<AccountSettings />);
    expect(screen.getByTestId("AccountSettings-wrapper")).toBeInTheDocument();
  });
});
