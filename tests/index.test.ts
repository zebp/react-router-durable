import { describe, expect, it, vitest } from "vitest";
import { actionArgs, loaderArgs, unreachable } from "./util.js";
import { durableAction, durableLoader } from "../src/index.js";
import { TestDurableObject } from "./worker.js";

describe("calling loaders/actions", () => {
  it("should be able to call a loader with a static id", async () => {
    const loader = durableLoader(
      TestDurableObject,
      (env) => env.test.testLoader,
      "testLoader",
    );

    const result = await loader(loaderArgs());
    expect(result).toEqual({ called: "testLoader" });
  });

  it("should be able to call a loader with a dynamic id", async () => {
    const loader = durableLoader(
      TestDurableObject,
      (env) => env.test.testLoader,
      () => Math.random().toString(36),
    );

    const result = await loader(loaderArgs());
    expect(result).toEqual({ called: "testLoader" });
  });

  it("should be able to call a loader with a dynamic id", async () => {
    const loader = durableLoader(
      TestDurableObject,
      (env) => env.test.argsDataLoader,
      "name",
    );

    const result = await loader(
      loaderArgs({
        params: { foo: "bar" },
        request: new Request("https://example.com", {
          method: "POST",
          headers: {
            "x-test": "true",
          },
          body: "Hello, world!",
        }),
      }),
    );

    expect(result).toEqual({
      params: {
        foo: "bar",
      },
      request: {
        url: "https://example.com",
        headers: {
          "content-type": "text/plain;charset=UTF-8",
          "x-test": "true",
        },
        body: "Hello, world!",
      },
    });
  });

  it("should be able to use form in both name getter and action", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: new URLSearchParams({ foo: "bar" }),
    });

    const nameGetter = vitest.fn(async ({ request }) => {
      const form = await request.formData();
      return form.get("foo")?.toString() ?? unreachable();
    });

    const action = durableAction(
      TestDurableObject,
      (env) => env.test.formAction,
      nameGetter,
    );

    const result = await action(actionArgs({ request }));
    expect(result).toEqual({ foo: "bar" });
    expect(nameGetter).toHaveResolvedWith("bar");
  });

  it("should be able to return a response from an action", async () => {
    const action = durableAction(
      TestDurableObject,
      (env) => env.test.redirectAction,
      "testLoader",
    );

    const result = await action(actionArgs());
    expect(result).toBeInstanceOf(Response);
    expect(result.url).toBe("");
    expect(result.headers.get("location")).toBe("/");
  });
});
