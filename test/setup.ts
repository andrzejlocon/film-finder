import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Automatyczne czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// Mockowanie localStorage i sessionStorage
const storageMock = () => {
  let storage: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => {
      storage[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      storage = {};
    },
    key: (i: number) => {
      const keys = Object.keys(storage);
      return keys[i] || null;
    },
    get length() {
      return Object.keys(storage).length;
    },
  };
};

Object.defineProperty(window, "localStorage", { value: storageMock() });
Object.defineProperty(window, "sessionStorage", { value: storageMock() });

// Mockowanie matchMedia jeśli są używane media queries
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
