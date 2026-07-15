import app from "./app";
import { playwrightBrowserService } from "./services/browser/playwright-browser.service";
import prisma from "./config/prisma";

const port = Number(process.env.PORT ?? 5000);

const server = app.listen(port, () => {
  console.log(
    `Server is running on http://localhost:${port}`,
  );
});

async function shutdown(
  signal: string,
): Promise<void> {
  console.log(`[Server] Received ${signal}`);

  server.close(async () => {
    try {
      await playwrightBrowserService.close();
      await prisma.$disconnect();

      console.log("[Server] Shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error(
        "[Server] Shutdown failed",
        error,
      );

      process.exit(1);
    }
  });
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});