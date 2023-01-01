import React, { useState, useEffect } from "react";
import { render, screen, act } from "@testing-library/react";
import { Layout } from "./index";
import mockRouter from "next-router-mock";
import { mockGame, mockSession, mockUser } from "@testing/mockData";
import { useUserProfileStore } from "@components/store";

jest.mock("next/router", () => require("next-router-mock"));

jest.mock("@supabase/auth-helpers-react", () => ({
  useSession: jest.fn(() => mockSession),
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockSB),
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
  })),
};

const MockWrapper = () => {
  const { setUserAvatarUrl } = useUserProfileStore();

  useEffect(() => {
    setUserAvatarUrl("hello");
  }, []);
  return (
    <Layout>
      <div>hello test</div>
    </Layout>
  );
};

describe("Layout Component", () => {
  test("it should exist", () => {
    act(() => render(<MockWrapper />));
    expect(screen.getByTestId("Layout-wrapper")).toBeInTheDocument();
    expect(screen.getByText(/hello test/i)).toBeInTheDocument();
  });
});
