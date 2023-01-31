import React, { useState, useEffect } from "react";
import { render, screen, act } from "@testing-library/react";
import { Layout } from "./index";
import mockRouter from "next-router-mock";
import {
  mockGame,
  mockSession,
  mockUser,
  mockUserProfile,
} from "@testing/mockData";
import { useUserProfileStore } from "@components/store";

jest.mock("next/router", () => require("next-router-mock"));

jest.mock("@supabase/auth-helpers-react", () => ({
  useSessionContext: jest.fn(() => ({
    session: () => mockSession,
  })),
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockSB),
}));
jest.mock("@hooks/useHandleError", () => ({
  useHandleError: jest.fn(() => ({
    captureError: jest.fn(),
  })),
}));
jest.mock("@hooks/useWindowVisibilityState", () => ({
  useWindowVisibilityState: jest.fn(() => ({
    visible: true,
  })),
}));

const mockSB = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      or: jest.fn(() => ({
        data: [mockGame],
        status: 200,
        error: null,
      })),
    })),
  })),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      })),
    })),
    subscribe: jest.fn(),
  })),
};

const MockWrapper = () => {
  const { setUserProfile } = useUserProfileStore();

  useEffect(() => {
    setUserProfile(mockUserProfile);
  }, []);
  return (
    <Layout>
      <div>hello test</div>
    </Layout>
  );
};

describe("Layout Component", () => {
  test("it should exist", async () => {
    act(() => render(<MockWrapper />));
    expect(await screen.findByTestId("Layout-wrapper")).toBeInTheDocument();
    expect(await screen.findByText("hello test")).toBeInTheDocument();
  });
});
