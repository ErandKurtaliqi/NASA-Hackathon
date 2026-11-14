// Explicit loopback-only development access to authorized originals outside Git.
// Nothing is copied to public/, dist/, a bundle or a repository history.
import { createReadStream, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
function localStoryMedia(root = process.env.AURORALYS_LOCAL_STORY_AUDIO) {
  const allowed = /^\/audio\/(apollo-(?:11|15|16|17)|sojourner|opportunity|viking-1|ingenuity)\/chapter-([1-5])\/([1-9])\.mp3$/;
  function middleware(req, res, next) {
    if (!root) return next();
    const match = allowed.exec((req.url ?? "").split("?")[0]);
    if (!match) return next();
    if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress ?? "")) {
      res.writeHead(403);
      res.end();
      return;
    }
    // Reject DNS rebinding/cross-origin requests before Vite's own middleware.
    const host = req.headers.host ?? '';
    let sameOrigin = true;
    if (req.headers.origin) {
      try { sameOrigin = new URL(req.headers.origin).host === host; } catch { sameOrigin = false; }
    }
    if (!/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host) || !sameOrigin) {
      res.writeHead(403); res.end(); return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }
    try {
      const base = realpathSync(root), file = realpathSync(resolve(base, match[1], `chapter-${match[2]}`, `${match[3]}.mp3`));
      const local = relative(base, file);
      if (local.startsWith(`..${sep}`) || isAbsolute(local)) {
        res.writeHead(403);
        res.end();
        return;
      }
      const size = statSync(file).size;
      let start = 0, end = size - 1;
      if (req.headers.range) {
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
        if (!range || Number(range[1]) >= size || range[2] && Number(range[2]) < Number(range[1])) {
          res.writeHead(416, { "Content-Range": `bytes */${size}` });
          res.end();
          return;
        }
        start = Number(range[1]);
        end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      }
      res.writeHead(req.headers.range ? 206 : 200, { "Content-Type": "audio/mpeg", "Content-Length": end - start + 1, "Accept-Ranges": "bytes", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", ...req.headers.range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {} });
      if (req.method === "HEAD") res.end();
      else {
        const stream = createReadStream(file, { start, end });
        stream.on("error", () => res.destroy());
        res.on("close", () => stream.destroy());
        stream.pipe(res);
      }
    } catch {
      next();
    }
  }
  return { name: "authorized-local-story-media", configureServer(server) {
    console.info(`[local-story-media] External originals ${root ? 'enabled (loopback only)' : 'disabled; set AURORALYS_LOCAL_STORY_AUDIO to an external directory'}`);
    server.middlewares.use(middleware);
  } };
}
export {
  localStoryMedia
};
