import {
  getApiBaseUrl,
  listSessions,
  createSession,
  startSession,
  endSession,
  joinSession,
  getLayout,
  publishLayout,
} from "../api/sessions";

describe("sessions API module", () => {
  it("exports all expected functions", () => {
    expect(typeof getApiBaseUrl).toBe("function");
    expect(typeof listSessions).toBe("function");
    expect(typeof createSession).toBe("function");
    expect(typeof startSession).toBe("function");
    expect(typeof endSession).toBe("function");
    expect(typeof joinSession).toBe("function");
    expect(typeof getLayout).toBe("function");
    expect(typeof publishLayout).toBe("function");
  });

  it("getApiBaseUrl returns a non-empty string", () => {
    const url = getApiBaseUrl();
    expect(typeof url).toBe("string");
    expect(url.length).toBeGreaterThan(0);
  });
});
