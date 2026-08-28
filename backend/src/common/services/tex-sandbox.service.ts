import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const COMPILE_TIMEOUT_MS = 25_000;

export class TexSandboxService {
    static async compile(texFile: string): Promise<string> {
        const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-tex-"));
        const normalizedWorkdir = workdir.replace(/\\/g, "/");
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
                "-v", `${normalizedWorkdir}:/workspace:rw`,
                "-w", "/workspace",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "texlive/texlive:latest",
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