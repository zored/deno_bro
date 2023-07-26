import { decode } from "https://deno.land/std@0.99.0/encoding/base64.ts";

type Handler = Response | ((s: Server) => Response | Promise<Response>);
type HandlersByHostByMethodAndPath = Record<
  string,
  Record<string, Record<string, Handler>>
>;

const notFound: Handler = (s) => s.response({ body: `not found`, status: 404 });

const anyMethod = "*";
const handlers: HandlersByHostByMethodAndPath = {
  "bon.deno.dev": {
    GET: {
      "/": (s) =>
        s.htmlResponse(
          `<h1>Bondeno</h1><a href="https://en.wikipedia.org/wiki/Bondeno" target="_blank">Bondeno</a> is a French comune.`,
        ),
    },
  },
  "zored.deno.dev": {
    GET: {
      "/": (s) =>
        s.htmlResponse(
          `<h1><a href="https://github.com/zored">Zored</a> Deno</h1>.`,
        ),
    },
  },
  "bro.deno.dev": {
    [anyMethod]: {
      "/debug": (s) => s.jsonDebugRequest(),
    },
    GET: {
      "/": ((): Handler => {
        const deployedAt = new Date();
        let visits = 0;

        // weekend logic
        const weekendDate = new Date(2023, 5, 26);
        const names = ["weekend", "day", "night", "sleep"];
        const dayName = () =>
          names[
            Math.floor(
              ((new Date()).getTime() - weekendDate.getTime()) / 1000 / 60 /
                60 / 24,
            ) % 4
          ];

        return (s) =>
          s.isJsonRequest()
            ? s.jsonResponse({ deployedAt, visits })
            : s.htmlResponse(`
        <h1>Bro Deno</h1>
        <p>
          This code is hosted by <a href="https://github.com/zored/deno_bro" target="_blank">GitHub repository</a>.
        </p>
        <code><pre>
          Deployed at: ${deployedAt}
          Visits since deploy: ${visits++}
        </pre></code>
        
        <p>${dayName()}</p>
      `);
      })(),
      "/favicon.ico": (s) =>
        s.response({
          body: decode(
            "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAMFBMVEU0OkArMjhobHEoPUPFEBIuO0L+AAC2FBZ2JyuNICOfGx7xAwTjCAlCNTvVDA1aLzQ3COjMAAAAVUlEQVQI12NgwAaCDSA0888GCItjn0szWGBJTVoGSCjWs8TleQCQYV95evdxkFT8Kpe0PLDi5WfKd4LUsN5zS1sKFolt8bwAZrCaGqNYJAgFDEpQAAAzmxafI4vZWwAAAABJRU5ErkJggg==",
          ),
          mime: "image/x-icon",
        }),
    },
    POST: {
      "/upper": async (s) =>
        s.textResponse((await s.getRequestTextBody()).toUpperCase()),
    },
  },
};

addEventListener("fetch", async (event: FetchEvent) => {
  const s = new Server(event.request);
  const responseOrRetriever =
    handlers?.[s.getHost()]?.[event.request.method]?.[s.getPath()] ??
      handlers?.[s.getHost()]?.[anyMethod]?.[s.getPath()];
  notFound;
  const responseOrLazy = responseOrRetriever instanceof Response
    ? responseOrRetriever
    : responseOrRetriever(s);
  const response = responseOrLazy instanceof Promise
    ? await responseOrLazy
    : responseOrLazy;
  event.respondWith(response);
});

class Server {
  private static readonly jsonMime = "application/json";
  constructor(
    public req: Request,
    private url = new URL(req.url),
  ) {
  }

  async getRequestTextBody(): Promise<string> {
    return await this.req.text();
  }

  async htmlResponse(body: string) {
    return this.response({
      body: `<html><body>${body}</body></html>`,
      mime: "text/html",
    });
  }

  async jsonDebugRequest() {
    const o = {
      headers: {} as Record<string, string>,
      body: await this.getRequestTextBody(),
      url: this.req.url,
      method: this.req.method,
    };
    this.req.headers.forEach((v, k) => o.headers[k] = v);
    return this.jsonResponse(o);
  }

  async jsonResponse(o: object) {
    return this.response({
      body: JSON.stringify(o),
      mime: Server.jsonMime,
    });
  }

  async textResponse(body: string) {
    return this.response({ body });
  }

  response({ body = "" as BodyInit, mime = "text/plain", status = 200 }) {
    if (status !== 200) {
      console.info({ status, server: this });
    }
    return new Response(body, { status, headers: { "content-type": mime } });
  }

  getHost() {
    return this.url.host;
  }

  getPath() {
    return this.url.pathname;
  }

  isJsonRequest(): boolean {
    const contentType = this.req.headers.get("content-type") || "";
    return contentType.includes(Server.jsonMime);
  }
}
