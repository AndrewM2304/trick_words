import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import { AccountSettings } from "./index";
import {
  mockSession,
  mockUser,
  mockUserProfile,
  mockUserRow,
} from "@testing/mockData";
import {
  SessionContextProvider,
  SupabaseClient,
} from "@supabase/auth-helpers-react";
// import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import userAvatar from "../../../../public/user.svg";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockUserRow),
  useSession: jest.fn(() => mockSession),
}));

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createBrowserSupabaseClient: jest.fn(),
}));

jest.mock("@components/store", () => ({
  useUserProfileStore: jest.fn(() => ({
    userProfile: jest.fn(() => mockUserProfile),
  })),
}));

const mockImage = {
  playerOneImage: userAvatar,
  playerTwoImage: userAvatar,
  downloadImagesFromUrls: jest.fn(),
};

jest.mock("@hooks/useDownloadImages", () => ({
  useDownloadImages: () => {
    return mockImage;
  },
}));

describe("AccountSettings Component", () => {
  test("it should exist", () => {
    render(<AccountSettings />);
    expect(screen.getByTestId("AccountSettings-wrapper")).toBeInTheDocument();
  });
});
