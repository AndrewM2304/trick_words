import { useSupabaseClient } from "@supabase/auth-helpers-react";
import "@testing-library/jest-dom/extend-expect";
import "whatwg-fetch";
import userAvatar from "./public/indicator.svg";

// src/setupTests.js
import { server } from "./src/mocks/server";
// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

const localStorageMock = (function () {
  let store: any = {};
  return {
    getItem(key: string) {
      return store[key];
    },

    setItem(key: string, value: string) {
      store[key] = value;
    },

    clear() {
      store = {};
    },

    removeItem(key: string) {
      delete store[key];
    },

    getAll() {
      return store;
    },
  };
})();

const createObjectMock = function () {
  return userAvatar;
};

Object.defineProperty(window, "localStorage", { value: localStorageMock });
global.localStorage;

Object.defineProperty(URL, "createObjectURL", { value: createObjectMock });
global.URL;
