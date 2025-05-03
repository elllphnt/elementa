import "@testing-library/jest-dom";
import { vi } from "vitest";

global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
