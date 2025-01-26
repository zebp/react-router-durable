import { DurableObject, WorkerEntrypoint } from "cloudflare:workers";
import type { env } from "cloudflare:test";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";

export class TestDurableObject extends DurableObject<typeof env> {
  async testLoader() {
    return { called: "testLoader" };
  }

  async testAction() {
    return { called: "testAction" };
  }

  async argsDataLoader(args: LoaderFunctionArgs) {
    return {
      params: args.params,
      request: {
        url: args.request.url,
        headers: Object.fromEntries(args.request.headers.entries()),
        body: await args.request.text(),
      },
    };
  }

  async formAction({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }

  async redirectAction() {
    return redirect("/");
  }
}

export default class Main extends WorkerEntrypoint {}
