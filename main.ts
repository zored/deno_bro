import { decode } from "https://deno.land/std@0.99.0/encoding/base64.ts";

type Handler = Response | ((s: Server) => Response | Promise<Response>);
type HandlersByMethodAndPath = Record<string, Record<string, Handler>>;

const notFound: Handler = (s) => s.response({ body: `not found`, status: 404 });

const handlers: HandlersByMethodAndPath = {
  GET: {
    "/": ((): Handler => {
      const deployedAt = new Date();
      let visits = 0;

      return (s) =>
        s.htmlResponse(`
        <h1>Bro Deno</h1>
        <p>
          This code is hosted by <a href="https://github.com/zored/deno_bro">GitHub repository</a>.
        </p>
        <code><pre>
          Deployed at: ${deployedAt}
          Visits since deploy: ${visits++}
        </pre></code>
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
};

addEventListener("fetch", async (event: FetchEvent) => {
  const s = new Server(event.request);
  const responseOrRetriever = handlers?.[event.request.method]?.[s.getPath()] ??
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
  constructor(
    public req: Request,
    private toStringDecoder = new TextDecoder(),
  ) {
  }

  async getRequestTextBody(): Promise<string> {
    return this.toString(await this.req.text());
  }

  async htmlResponse(body: string) {
    return this.response({
      body: `<html><body>${body}</body></html>`,
      mime: "text/html",
    });
  }

  async textResponse(body: string) {
    return this.response({ body });
  }

  response({ body = "" as BodyInit, mime = "text/plain", status = 200 }) {
    return new Response(body, { status, headers: { "content-type": mime } });
  }

  getPath() {
    return (new URL(this.req.url)).pathname;
  }

  private toString(v: BufferSource): string {
    return this.toStringDecoder.decode(v);
  }
}
