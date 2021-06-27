const index =
  `<html><body><h1>Bro Deno</h1>This code is hosted by [GitHub repository](https://github.com/zored/deno_pro).</body></html>`;
addEventListener("fetch", (event: FetchEvent) =>
  event.respondWith(
    new Response(index, {
      status: 200,
      headers: { "content-type": "text/html" },
    }),
  ));
