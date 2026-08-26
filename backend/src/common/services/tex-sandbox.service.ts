import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class TexSandboxService {
    static async compile(texFile: string): Promise<string> {
        const workdir = await fs.mkdtemp(path.join(os.tmpdir(), "resume-tex-"));
        const containerName = `resume-tex-${path.basename(workdir)}`;
        const texPath = path.join(workdir, "resume.tex");
        const pdfPath = path.join(workdir, "resume.pdf");

        await fs.writeFile(texPath, texFile, "utf8");

        try {
            await execFileAsync("docker", [
                "create",
                "--name", containerName,
                "--network", "none",
                "--memory", "512m",
                "--cpus", "1",
                "--pids-limit", "128",
                "--read-only",
                "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "texlive/texlive:latest",
                "pdflatex",
                "-interaction=nonstopmode",
                "-halt-on-error",
                "-no-shell-escape",
                "-output-directory=/tmp",
                "/tmp/resume.tex",
            ]);

            await execFileAsync("docker", ["cp", texPath, `${containerName}:/tmp/resume.tex`]);
            await execFileAsync("docker", ["start", "--attach", containerName], { maxBuffer: 1024 * 1024 });
            await execFileAsync("docker", ["cp", `${containerName}:/tmp/resume.pdf`, pdfPath]);

            return (await fs.readFile(pdfPath)).toString("base64");
        } finally {
            await execFileAsync("docker", ["rm", "-f", containerName]).catch(() => undefined);
            await fs.rm(workdir, { recursive: true, force: true });
        }
    }
}
