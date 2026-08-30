import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const COMPILE_TIMEOUT_MS = 25_000;

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

        try {
            await execFileAsync("docker", [
                "run",
                "--rm",
                "--network", "none",
                "--memory", "512m",
                "--cpus", "1",
                "--pids-limit", "128",
                "-v", `${mountPath}:/workspace:rw`,
                "-w", "/workspace",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "blang/latex:ubuntu",
                "pdflatex",
                "-interaction=nonstopmode",
                "-halt-on-error",
                "-no-shell-escape",
                "resume.tex",
            ], {
                maxBuffer: 1024 * 1024,
                signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS),
            });

            const pdfBuffer = await fs.readFile(pdfPath);
            return pdfBuffer.toString("base64");
        } catch (err: any) {
            if (err.name === "AbortError") {
                throw new Error("LaTeX compilation timed out after 25s");
            }
            let logContent = "";
            try {
                logContent = await fs.readFile(logPath, "utf8");
            } catch {
                // log may not exist if docker failed before running pdflatex
            }
            const errorLine = logContent.split("\n").find((l) => l.startsWith("!"));
            throw new Error(errorLine || err.message || "LaTeX compilation failed");
        } finally {
            await fs.rm(workdir, { recursive: true, force: true }).catch(() => undefined);
        }
    }
}