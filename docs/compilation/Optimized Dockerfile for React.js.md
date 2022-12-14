---
title: "Optimized Dockerfile for React.js"

tags:
    - Docker
    - React.js
---

# Optimized Dockerfile for React.js

## TL;DR
- Go to [Dockerfile for React.js](#dockerfile-for-reactjs) section

<br/>    


## What is React.js?

React.js is [a JavaScript library for building user interfaces](https://reactjs.org/docs/getting-started.html). 
****
<br/>   

## Dockerfile for React.js

```Dockerfile
FROM node:16-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN apk add --no-cache libc6-compat && \
    npm ci


FROM node:16-alpine AS builder

WORKDIR /app
COPY . ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build


FROM node:16-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
CMD ./node_modules/.bin/serve -s build

EXPOSE 3000
```

Here I've written a `Dockerfile` with following standards:

- Used **`alpine` image** to reduce the final image size. (Further comparison will be added via link after my Optimized Dockerizing Project.)
- **Combined RUN commands with `&&` operator** to avoid creating an additional layer in the image.
  - Though it reduces a bit of image size but this makes it hard to trace when error occurs. As it'll specify that exact layer, not the specific command inside the layer.
  - To resolve this, constructed multi-stage build.
- **Multi-stage build** to make it more maintainable and fast.
  - [You can selectively copy artifacts from one stage to another, leaving behind everything you don’t want in the final image](https://docs.docker.com/build/building/multi-stage/#use-multi-stage-builds).
  - To reduce complexity.
  - **`deps`** : As Docker's build cache will be 
  - **`builder`** : dd
  - **`runner`** : dd


<br/>   

## Why do we need `libc6-compat`?

```Dockerfile
RUN apk add --no-cache libc6-compat
```

According to [https://github.com/nodejs/docker-node#nodealpine](https://github.com/nodejs/docker-node#nodealpine), it says when using `node:alpine` image, there might be a **common issue** with missing shared library required for use of `process.dlopen`. To resolve this, [adding the libc6-compat package in your Dockerfile is recommended](https://github.com/nodejs/docker-node#nodealpine).

<br/>   

## Does React.js need Node.js Environment Variable?

```Dockerfile
ENV NODE_ENV=production
```

Obviously, React.js is a front-end framework and if you just use React.js on client-side only, you don't need Node.js to run the code.

But usually React.js javascript code is bundled with **webpack**(which requires Node.js environment) so in this case, yes you need Node.js.

And if you've created your React Application via `CRA(create-react-app)` command, you're internally using **webpack**.

You can check this by just running `eject` command as follows:

```bash
$ npx create-react-app app
$ cd app
$ npm run eject
```

And you can easily find `webpack` configurations.

<br/>   


|**Any addtional suggestions are always welcome!**|
|:---:|

<br/>   
