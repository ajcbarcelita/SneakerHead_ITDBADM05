// sshTunnel.js
import { Client } from "ssh2";
import net from "net";
import dotenv from "dotenv";

dotenv.config();

let sshClient = null;
let server = null;
let reconnecting = false;

/**
 * Creates an SSH tunnel from local machine to remote DB server.
 * Supports retry on startup and auto-reconnect on drops.
 */
export async function createSshTunnel({
  maxRetries = 5,
  retryDelay = 5000, // ms
} = {}) {
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      await _connectTunnel();
      console.log("✅ SSH tunnel established successfully.");
      return { sshClient, server };
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed:`, err.message || err);
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000}s...`);
        await new Promise((res) => setTimeout(res, retryDelay));
      } else {
        throw new Error("SSH tunnel failed after maximum retries.");
      }
    }
  }
}

/**
 * Internal function: sets up the SSH client and local port forwarding
 */
function _connectTunnel() {
  return new Promise((resolve, reject) => {
    sshClient = new Client();

    const sshConfig = {
      host: process.env.SSH_HOST,
      port: parseInt(process.env.SSH_PORT) || 21006,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASSWORD,
      keepaliveInterval: 15000,
      readyTimeout: 20000,
    };

    sshClient.on("ready", () => {
      console.log("✅ SSH connection established.");

      const localPort = parseInt(process.env.SSH_LOCAL_PORT) || 3307;
      const remoteHost = process.env.SSH_REMOTE_HOST || "127.0.0.1";
      const remotePort = parseInt(process.env.SSH_REMOTE_PORT) || 3306;

      // Clean up existing server if any
      if (server) server.close();

      server = net.createServer((localSocket) => {
        sshClient.forwardOut("127.0.0.1", localPort, remoteHost, remotePort, (err, stream) => {
          if (err) {
            console.error("❌ SSH port forwarding error:", err.message || err);
            localSocket.end();
            return;
          }
          localSocket.pipe(stream).pipe(localSocket);
        });
      });

      server.listen(localPort, "127.0.0.1", () => {
        console.log(`🚀 Tunnel ready → localhost:${localPort} → remote:${remotePort}`);
        resolve();
      });
    });

    sshClient.on("close", () => {
      console.warn("⚠️ SSH connection closed.");
      if (!reconnecting) _reconnectTunnel();
    });

    sshClient.on("end", () => {
      console.warn("⚠️ SSH connection ended.");
      if (!reconnecting) _reconnectTunnel();
    });

    sshClient.on("error", (err) => {
      reject(err);
    });

    sshClient.connect(sshConfig);
  });
}

/**
 * Attempt to reconnect after a drop
 */
function _reconnectTunnel() {
  reconnecting = true;
  console.log("🔄 Attempting to reconnect SSH tunnel in 5s...");
  setTimeout(async () => {
    try {
      await _connectTunnel();
      console.log("✅ SSH tunnel reconnected.");
    } catch (err) {
      console.error("❌ Failed to reconnect SSH tunnel:", err.message || err);
    } finally {
      reconnecting = false;
    }
  }, 5000);
}

/**
 * Cleanly close the tunnel
 */
export async function closeSshTunnel() {
  if (server) {
    server.close(() => console.log("🛑 Local TCP server closed."));
  }
  if (sshClient) {
    sshClient.end();
    console.log("🛑 SSH client disconnected.");
  }
}
