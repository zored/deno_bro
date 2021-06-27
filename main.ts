const index =
  `<html><body><h1>Bro Deno</h1>This code is hosted by <a href="https://github.com/zored/deno_bro">GitHub repository</a>.</body></html>`;
addEventListener("fetch", (event: FetchEvent) =>
  event.respondWith(
    new Response(index, {
      status: 200,
      headers: { "content-type": "text/html" },
    }),
  ));
