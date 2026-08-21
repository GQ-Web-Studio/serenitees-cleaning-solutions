import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const port = Number.parseInt(process.env.SERENITEES_PORT ?? "5500", 10);

const cleanRoutes = new Map([
  ["/", "index.html"],
  ["/about", "html/about.html"],
  ["/residential-cleaning", "html/residential-cleaning.html"],
  ["/commercial-cleaning", "html/commercial-cleaning.html"],
  ["/contact", "html/contact.html"],
  ["/request-a-quote", "html/request-a-quote.html"],
  ["/privacy-policy", "html/privacy-policy.html"]
]);

const legacyRoutes = new Map([
  ["/index.html", "/"],
  ...Array.from(cleanRoutes.keys())
    .filter((route) => route !== "/")
    .flatMap((route) => [
      [`${route}.html`, route],
      [`/html${route}.html`, route]
    ])
]);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".glb", "model/gltf-binary"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".xml", "application/xml; charset=utf-8"]
]);

function safeProjectPath(filePath) {
  const resolvedPath = normalize(join(projectRoot, filePath));
  const pathFromRoot = relative(projectRoot, resolvedPath);

  if (pathFromRoot.startsWith("..") || pathFromRoot.includes(":")) {
    return null;
  }

  return resolvedPath;
}

async function sendFile(response, filePath, statusCode = 200, method = "GET") {
  const absolutePath = safeProjectPath(filePath);

  if (!absolutePath || !(await stat(absolutePath)).isFile()) {
    return false;
  }

  const body = method === "HEAD" ? null : await readFile(absolutePath);
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": contentTypes.get(extname(absolutePath).toLowerCase()) ?? "application/octet-stream"
  });
  response.end(body);
  return true;
}

const server = createServer(async (request, response) => {
  try {
    const method = request.method ?? "GET";

    if (method !== "GET" && method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end();
      return;
    }

    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`);
    const requestedPathname = decodeURIComponent(requestUrl.pathname);
    const pathname = requestedPathname.replace(/\/+$/, "") || "/";
    const legacyRoute = legacyRoutes.get(pathname);

    if (legacyRoute) {
      response.writeHead(301, { Location: `${legacyRoute}${requestUrl.search}` });
      response.end();
      return;
    }

    if (requestedPathname !== pathname) {
      response.writeHead(301, { Location: `${pathname}${requestUrl.search}` });
      response.end();
      return;
    }

    const routeFile = cleanRoutes.get(pathname);

    if (routeFile && await sendFile(response, routeFile, 200, method)) {
      return;
    }

    const requestedFile = pathname.replace(/^\/+/, "");
    if (requestedFile && extname(requestedFile) && await sendFile(response, requestedFile, 200, method)) {
      return;
    }

    await sendFile(response, "404.html", 404, method);
  } catch (error) {
    if (!response.headersSent) {
      try {
        await sendFile(response, "404.html", 404, request.method ?? "GET");
        return;
      } catch {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      }
    }

    response.end("Unable to load the page.");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the current preview server, then run this command again.`);
    process.exitCode = 1;
    return;
  }

  throw error;
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serenitees preview: http://127.0.0.1:${port}`);
});
