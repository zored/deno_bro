import { decode } from "https://deno.land/std@0.99.0/encoding/base64.ts";

const notFound = "/404";
const handlers: Record<string, Record<string, (e: FetchEvent) => Response>> = {
  GET: {
    "/": (() => {
      const deployedAt = new Date();
      let visits = 0;

      return () =>
        new Response(
          `<html><body><h1>Bro Deno</h1>This code is hosted by <a href="https://github.com/zored/deno_bro">GitHub repository</a>.</body><br/><br/><code>Deployed at: ${deployedAt}\nVisits since deploy: ${visits++}</code></html>`,
          {
            status: 200,
            headers: { "content-type": "text/html" },
          },
        );
    })(),
    "/favicon.ico": () =>
      new Response(
        decode(
          "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAMFBMVEU0OkArMjhobHEoPUPFEBIuO0L+AAC2FBZ2JyuNICOfGx7xAwTjCAlCNTvVDA1aLzQ3COjMAAAAVUlEQVQI12NgwAaCDSA0888GCItjn0szWGBJTVoGSCjWs8TleQCQYV95evdxkFT8Kpe0PLDi5WfKd4LUsN5zS1sKFolt8bwAZrCaGqNYJAgFDEpQAAAzmxafI4vZWwAAAABJRU5ErkJggg==",
        ),
        {
          status: 200,
          headers: { "content-type": "image/x-icon" },
        },
      ),
    [notFound]: (e: FetchEvent) =>
      new Response(`${e.request.method} ${e.request.url}\n404 not found`, {
        status: 404,
        headers: { "content-type": "text/plain" },
      }),
  },
};

addEventListener("fetch", (event: FetchEvent) => {
  const getResponse = handlers?.[event.request.method]?.[event.request.url] ??
    handlers.GET[notFound];
  event.respondWith(getResponse(e));
});
