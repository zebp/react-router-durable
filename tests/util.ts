import { env } from "cloudflare:test";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export const context = { cloudflare: { env } };

export function loaderArgs(
  opts: Partial<LoaderFunctionArgs> = {},
): LoaderFunctionArgs {
  return {
    context,
    request: new Request("https://example.com"),
    params: {},
    ...opts,
  };
}

export function actionArgs(
  opts: Partial<ActionFunctionArgs> = {},
): ActionFunctionArgs {
  return {
    context,
    request: new Request("https://example.com"),
    params: {},
    ...opts,
  };
}

export function unreachable(): never {
  throw new Error("unreachable");
}
