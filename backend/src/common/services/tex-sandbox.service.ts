import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const COMPILE_TIMEOUT_MS = 30_000;

function formatDockerVolumePath(dir: string): string {
    const absolutePath = path.resolve(dir);
    if (process.platform === "win32") {
        const match = absolutePath.match(/^([A-Za-z]):[/\\](.*)$/);
        if (match && match[1] && match[2] !== undefined) {
            const driveLetter = match[1].toLowerCase();
            const relativePath = match[2].replace(/\\/g, "/");
            return `/${driveLetter}/${relativePath}`;
        }
    }
    return absolutePath.replace(/\\/g, "/");
}

export class TexSandboxService {
    static async compile(texFile: string): Promise<string> {
        const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-tex-"));
        const mountPath = formatDockerVolumePath(workdir);
        const texPath = path.join(workdir, "resume.tex");
        const pdfPath = path.join(workdir, "resume.pdf");
        const logPath = path.join(workdir, "resume.log");

        await fs.writeFile(texPath, texFile, "utf8");

        await fs.chmod(workdir, 0o755);
        await fs.chmod(texPath, 0o644);

        try {
            const dockerArgs = [
                "run",
                "--rm",
                "--network", "none",
                "--memory", "512m",
                "--cpus", "1",
                "--pids-limit", "128",
                "-v", `${mountPath}:/workspace:rw`,
                "-w", "/workspace",
                "blang/latex:ubuntu",
                "pdflatex",
                "-interaction=nonstopmode",
                "-no-shell-escape",
                "resume.tex",
            ];

            let pdflatexSucceeded = false;
            let lastError: any = null;

            try {
                const { stdout, stderr } = await execFileAsync("docker", dockerArgs, {
                    maxBuffer: 2 * 1024 * 1024,
                    signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS),
                });
                pdflatexSucceeded = true;
            } catch (err: any) {
                lastError = err;
                if (err.name === "AbortError") {
                    throw new Error("LaTeX compilation timed out after 30s");
                }
            }

            try {
                const pdfBuffer = await fs.readFile(pdfPath);
                if (pdfBuffer.length > 0) {
                    return pdfBuffer.toString("base64");
                }
            } catch {
            }

            let logContent = "";
            try {
                logContent = await fs.readFile(logPath, "utf8");
            } catch {
            }

            if (logContent) {
                const errorLines = logContent.split("\n").filter((l) => l.startsWith("!"));
                const firstError = errorLines[0];
                throw new Error(firstError || "LaTeX compilation failed — check logs");
            }

            throw new Error(lastError?.message || "LaTeX compilation failed — Docker error");
        } finally {
            await fs.rm(workdir, { recursive: true, force: true }).catch(() => undefined);
        }
    }
}