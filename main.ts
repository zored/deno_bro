let visits = 0;
const deployedAt = new Date();

const index = () =>
  `<html><body><h1>Bro Deno</h1>This code is hosted by <a href="https://github.com/zored/deno_bro">GitHub repository</a>.</body><br/><br/><code>Deployed at: ${deployedAt}\nVisits since deploy: ${visits++}</code></html>`;

addEventListener("fetch", (event: FetchEvent) =>
  event.respondWith(
    new Response(index(), {
      status: 200,
      headers: { "content-type": "text/html" },
    }),
  ));


