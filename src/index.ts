import type { DurableObject } from "cloudflare:workers";
import type {
  ActionFunctionArgs,
  AppLoadContext,
  LoaderFunctionArgs,
} from "react-router";
import type {
  EnvGetter,
  NameGetter,
  RouteDurable,
  StubSelector,
} from "./types.js";
import { constructWrapper } from "./impl.js";

let envGetter: EnvGetter<any> = (context) => context?.cloudflare?.env;

/**
 * Since react-router doesn't have an opinion on where to embed the Cloudflare `Env`
 * object in the context, this function allows you to set a custom getter to extract
 * the `Env` object from the context if you don't store it in `context.cloudflare.env`.
 */
export function setEnvFromContextGetter<Context>(
  fn: (context: Context) => unknown,
) {
  envGetter = fn;
}

/**
 * Creates a React Router loader from a Durable Object object method.
 *
 * @param loaderSelector Provides a loader method on a Durable Object from the Env object.
 * @param name The name (or name function) of the Durable Object to execute.
 * @returns A React Router loader.
 */
export function durableLoader<
  LoaderDurableObject extends DurableObject<Env>,
  LoaderFn extends (...args: any[]) => unknown,
  Env extends {},
>(
  _: new (ctx: DurableObjectState, env: Env) => LoaderDurableObject,
  loaderSelector: (env: StubSelector<Env>) => LoaderFn,
  name: NameGetter<LoaderFunctionArgs>,
): (
  args: LoaderFunctionArgs<AppLoadContext>,
) => Promise<Awaited<ReturnType<LoaderFn>>> {
  return constructWrapper(loaderSelector, name, envGetter);
}

/**
 * Creates a React Router action from a Durable Object object method.
 *
 * @param actionSelector Provides a action method on a Durable Object from the Env object.
 * @param name The name (or name function) of the Durable Object to execute
 * @returns A React Router action.
 */
export function durableAction<
  ActionDurableObject extends DurableObject<Env>,
  ActionFn extends (...args: any[]) => unknown,
  Env extends {},
>(
  _: new (ctx: DurableObjectState, env: Env) => ActionDurableObject,
  actionSelector: (env: StubSelector<Env>) => ActionFn,
  name: NameGetter<ActionFunctionArgs>,
): (
  args: ActionFunctionArgs<AppLoadContext>,
) => Promise<Awaited<ReturnType<ActionFn>>> {
  return constructWrapper(actionSelector, name, envGetter);
}

type RouteInfo<Params extends {}> = { params: Params };

type InferParams<T> = T extends RouteInfo<infer Params> ? Params : never;

/**
 * Provides the route's Info type for a way to create type-safe Durable Object
 * loaders and actions.
 */
export function route<Info extends RouteInfo<{}>>(): RouteDurable<
  InferParams<Info>
> {
  return {
    loader: durableLoader,
    action: durableAction,
  };
}

/**
 * Clones the input object to remove `RpcStub` instances, this prevents
 * rendering issues when used in a route component since `RpcStub`s can't
 * be rendered.
 */
export function data<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
