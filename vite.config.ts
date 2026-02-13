import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

function levelsApi(): Plugin {
  return {
    name: "levels-api",
    configureServer(server) {
      const levelsDir = path.resolve("public/levels");

      // POST /api/levels/:filename — write JSON to public/levels/
      server.middlewares.use((req, res, next) => {
        if (req.method === "POST" && req.url?.startsWith("/api/levels/")) {
          const filename = decodeURIComponent(req.url.slice("/api/levels/".length));
          if (!filename.endsWith(".json")) {
            res.statusCode = 400;
            res.end("Filename must end with .json");
            return;
          }
          let body = "";
          req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
          req.on("end", () => {
            try {
              JSON.parse(body); // validate
              fs.mkdirSync(levelsDir, { recursive: true });
              fs.writeFileSync(path.join(levelsDir, filename), body, "utf-8");

              // Update index.json
              const indexPath = path.join(levelsDir, "index.json");
              let index: string[] = [];
              try { index = JSON.parse(fs.readFileSync(indexPath, "utf-8")); } catch {}
              if (!index.includes(filename)) {
                index.push(filename);
                fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
              }

              res.statusCode = 200;
              res.end("OK");
            } catch {
              res.statusCode = 400;
              res.end("Invalid JSON");
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), levelsApi()],
  optimizeDeps: {
    exclude: ["@dimforge/rapier2d"],
  },
});
