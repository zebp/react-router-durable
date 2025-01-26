import { RpcStub } from "cloudflare:workers";
import type { EnvGetter, NameGetter, StubGetter } from "./types.js";

export function constructWrapper<
  Args extends { context?: unknown; request: Request },
  T extends (...args: any[]) => unknown,
  Env extends {} = {},
>(
  stubGetter: StubGetter<Env, T>,
  idGetter: NameGetter<Args>,
  envGetter: EnvGetter<any>,
): (args: Args) => Promise<Awaited<ReturnType<T>>> {
  return async (args) => {
    const env = envGetter(args.context) as unknown as Env;
    if (!env) {
      throw new Error(
        "No env found in context, if your env is not in `context.cloudflare.env` ensure you've called `setEnvFromContextGetter`.",
      );
    }

    const proxiedEnv = proxyFor(env);
    const { durableObject, method } = stubGetter(proxiedEnv) as unknown as {
      durableObject: keyof Env;
      method: string;
    };

    const namespace = env[durableObject] as DurableObjectNamespace;
    const name =
      typeof idGetter === "function"
        ? await idGetter({
            ...args,
            request: args.request?.clone(),
          })
        : idGetter;
    const doID = namespace.idFromName(name);
    const stub = namespace.get(doID);

    const ret = await (stub as any)[method]({
      ...args,
      context: undefined,
    });

    if (ret instanceof Response) {
      return ret;
    }

    if (ret instanceof RpcStub) {
      throw new Error(
        "`RpcStub`s cannot be used as loader or action data, wrap your return data in the `data` function to avoid this error.",
      );
    }

    // @ts-ignore
    return ret;
  };
}

function proxyFor(env: object): any {
  return new Proxy(
    {},
    {
      get(_, envProp: string) {
        if (!(envProp in env)) {
          throw new Error(`Property ${envProp} not found in env`);
        }

        return new Proxy(
          {},
          {
            get(_, namespaceProp: string) {
              return { durableObject: envProp, method: namespaceProp };
            },
          },
        );
      },
    },
  );
}
