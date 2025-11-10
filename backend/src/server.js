import app from "./app.js";
import dotenv from "dotenv";
import { createSshTunnel, closeSshTunnel } from "./db/sshTunnel.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Start SSH tunnel (with retry + auto-reconnect)
    await createSshTunnel({ maxRetries: 5, retryDelay: 5000 });

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Clean up on exit signals
    const shutdown = async () => {
      console.log("\nShutting down...");
      await closeSshTunnel();
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown); // Ctrl+C
    process.on("SIGTERM", shutdown); // `kill` command or Docker stop
  } catch (err) {
    console.error("Failed to start SSH tunnel:", err);
    process.exit(1);
  }
})();
