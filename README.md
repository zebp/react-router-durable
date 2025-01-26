<h1 align="center">react-router-durable</h1>

<p align="center">
  A package for using Cloudflare's <a href="https://developers.cloudflare.com/durable-objects/">Durable Objects</a> as React Router <a href="https://reactrouter.com/start/framework/data-loading#server-data-loading">loaders</a> and <a href="https://reactrouter.com/start/framework/actions#server-actions">actions</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/react-router-durable">
    <img src="https://img.shields.io/npm/v/react-router-durable?style=for-the-badge" alt="downloads" height="24">
  </a>
  <a href="https://github.com/zebp/react-router-durable/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/zebp/react-router-durable/ci.yaml?branch=main&style=for-the-badge" alt="npm version" height="24">
  </a>
  <a href="https://github.com/zebp/react-router-durable">
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT license" height="24">
  </a>
</p>

## Example 

```tsx
// /app/durable-objects.ts
import type { LoaderFunctionArgs } from "react-router";
import { DurableObject } from "cloudflare:workers";

export class SampleDurableObject extends DurableObject {
  async sampleLoader({ request }: LoaderFunctionArgs) {
    return { url: request.url };
  }
}

// /app/routes/home.tsx
import { durableLoader } from "react-router-durable";
import { SampleDurableObject } from "../durable-objects";

// Makes a react-router loader that proxies the load to the SampleDurableObject
export const loader = durableLoader(
  SampleDurableObject,
  (env) => env.sample.sampleLoader,
  "sample" // the name of the DurableObject to use
);

export default function Home() {
  const { url } = useLoaderData<typeof loader>();

  return <h1>url: {url}</h1>;
}
```

## Installation

```
# NPM
$ npm install --save react-router-durable
# Yarn
$ yarn add react-router-durable
# PNPM
$ pnpm add react-router-durable
# Bun
$ bun add react-router-durable
```

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
