// aggregate_runner.js
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runMetrics() {
  const scriptPath = path.join(__dirname, "aggregate_metrics.py");
  console.log(`[${new Date().toISOString()}] Ejecutando aggregate_metrics.py...`);

  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error:", error.message);
      return;
    }
    if (stderr) console.error("⚠️ stderr:", stderr);
    if (stdout) console.log(stdout);
  });
}

runMetrics();
setInterval(runMetrics, 60 * 1000);
