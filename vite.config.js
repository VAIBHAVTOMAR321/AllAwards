// vite.config.js
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  base: "",
  server: {
    proxy: {
      "/api": {
        target: "https://mahadevaaya.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(
            /^\/api/,
            "/wecdallaward/wecdallaward_backend/api",
          ),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyRequest) => {
            proxyRequest.setHeader("origin", "https://mahadevaaya.com");
            const requestPath = proxyRequest.path;
            if (/\/(refresh-token|logout)\//.test(requestPath)) {
              const cookieNames = (proxyRequest.getHeader("cookie") || "")
                .split(";")
                .map((cookie) => cookie.trim().split("=")[0])
                .filter(Boolean);
              console.info(
                `[Vite API proxy] ${requestPath} cookies: ${cookieNames.join(", ") || "none"}; X-CSRFToken: ${Boolean(proxyRequest.getHeader("x-csrftoken")) ? "present" : "missing"}`,
              );
            }
          });
          proxy.on("proxyRes", (proxyResponse) => {
            const setCookies = proxyResponse.headers["set-cookie"];
            if (!Array.isArray(setCookies)) {
              console.info(
                `[Vite API proxy] ${proxyResponse.statusCode} response has no Set-Cookie header`,
              );
              return;
            }

            const cookieNames = setCookies.map((cookie) =>
              cookie.slice(0, cookie.indexOf("=")),
            );
            console.info(
              `[Vite API proxy] ${proxyResponse.statusCode} Set-Cookie names: ${cookieNames.join(", ")}`,
            );
            proxyResponse.headers["set-cookie"] = setCookies.map((cookie) => {
              const withoutDomain = cookie.replace(/;\s*Domain=[^;]*/gi, "");
              const withLocalPath = /;\s*Path=/i.test(withoutDomain)
                ? withoutDomain.replace(/;\s*Path=[^;]*/i, "; Path=/")
                : `${withoutDomain}; Path=/`;
              return withLocalPath.replace(
                /;\s*SameSite=None/gi,
                "; SameSite=Lax",
              );
            });
          });
        },
      },
    },
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ],
});