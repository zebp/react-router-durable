import type {
  ActionFunctionArgs,
  AppLoadContext,
  LoaderFunctionArgs,
} from "react-router";
import type { DurableObject } from "cloudflare:workers";

type NonLoaders = keyof DurableObject;

export type StubSelector<Env extends {}> = {
  [K in keyof Env]: Env[K] extends DurableObjectNamespace<infer N>
    ? Omit<N, NonLoaders>
    : never;
};

export type StubGetter<Env extends {}, T> = (env: StubSelector<Env>) => T;
export type EnvGetter<Context> = (context: Context) => unknown;
export type NameGetter<Args> =
  | string
  | ((args: Args) => string | Promise<string>);

type WithParams<T extends {}, Params extends {}> = Omit<T, "params"> & {
  params: Params;
};

export interface RouteDurable<Params extends {}> {
  /**
   * Creates a React Router loader from a Durable Object object method.
   *
   * @param loaderSelector Provides a loader method on a Durable Object from the Env object.
   * @param name The name (or name function) of the Durable Object to execute.
   * @returns A React Router loader.
   */
  loader<
    LoaderDurableObject extends DurableObject<Env>,
    LoaderFn extends (...args: any[]) => unknown,
    Env extends {},
  >(
    _: new (ctx: DurableObjectState, env: Env) => LoaderDurableObject,
    loaderSelector: (env: StubSelector<Env>) => LoaderFn,
    name: NameGetter<WithParams<LoaderFunctionArgs, Params>>,
  ): (
    args: LoaderFunctionArgs<AppLoadContext>,
  ) => Promise<Awaited<ReturnType<LoaderFn>>>;

  /**
   * Creates a React Router action from a Durable Object object method.
   *
   * @param actionSelector Provides a action method on a Durable Object from the Env object.
   * @param name The name (or name function) of the Durable Object to execute
   * @returns A React Router action.
   */
  action<
    ActionDurableObject extends DurableObject<Env>,
    ActionFn extends (...args: any[]) => unknown,
    Env extends {},
  >(
    _: new (ctx: DurableObjectState, env: Env) => ActionDurableObject,
    actionSelector: (env: StubSelector<Env>) => ActionFn,
    name: NameGetter<WithParams<ActionFunctionArgs, Params>>,
  ): (
    args: ActionFunctionArgs<AppLoadContext>,
  ) => Promise<Awaited<ReturnType<ActionFn>>>;
}
