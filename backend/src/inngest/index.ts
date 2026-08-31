import { TexSandboxService } from "../common/services/tex-sandbox.service";
import { DataService } from "../modules/user-data/data.service";
import { resumeSystemPrompt } from "./system-prompt";
import { inngest } from "./client";

export { inngest };
function sanitizeTex(rawTex: string): string {
    let tex = rawTex
        .replace(/^```(?:latex|tex)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    tex = tex.replace(/\\titleformat\{\\section\}\s*\{([^}]*)\}\s*\{\s*\}\s*\{\s*\}\s*\{\s*\}/g, "\\titleformat{\\section}{$1}{}{0pt}{}");
    tex = tex.replace(/\\titleformat\{\\section\}\s*\[([^\]]*)\]\s*\{([^}]*)\}\s*\{\s*\}\s*\{\s*\}/g, "\\titleformat{\\section}[$1]{$2}{}{0pt}{}");

    return tex;
}

const getCode = inngest.createFunction(
    { id: "get-code", triggers: { event: "app/texcode" }, retries: 5 },
    async ({ event, step }) => {
        await step.run("mark-generating", () => DataService.updateGenerationJob(event.data.jobId, "generating"));
        const resumeData = await step.run("get-resume-data", () =>
            DataService.getFormattedResumeForAI(event.data.userId, event.data.resumeId)
        ).catch(async (error) => {
            await DataService.updateGenerationJob(
                event.data.jobId,
                "failed",
                "Could not load resume data",
            );
            throw error;
        });

        const response = await step.ai.infer("call-openai", {
            model: step.ai.models.openai({
                model: "gpt-4o",
                apiKey: process.env.OPENAI_API_KEY,
            }),
            body: {
                messages: [
                    {
                        role: "system",
                        content: resumeSystemPrompt,
                    },
                    {
                        role: "user",
                        content: [
                            event.data.message,
                            ...resumeData,
                        ].join("\n\n"),
                    },
                ],
            },
        }).catch(async (error) => {
            await DataService.updateGenerationJob(
                event.data.jobId,
                "failed",
                "AI generation encountered an issue",
            );
            throw error;
        });

        const rawGeneratedTex = response.choices
            .map((choice) => choice.message?.content ?? "")
            .filter(Boolean)
            .join("\n");

        const generatedTex = sanitizeTex(rawGeneratedTex);

        const savedTexFile = await step.run("save-resume-tex-file", () =>
            DataService.saveTexFile(event.data.resumeId, event.data.userId, generatedTex)
        );

        if (savedTexFile) {
            await step.sendEvent("queue-tex-compilation", {
                name: "resume/compile.requested",
                data: {
                    jobId: event.data.jobId,
                    resumeId: event.data.resumeId,
                    userId: event.data.userId,
                    texFile: generatedTex,
                },
            });
        }

        return { generatedTex, status: savedTexFile ? "queued" : "resume-not-found" };
    }
);

export const compileResumeTex = inngest.createFunction(
    {
        id: "compile-resume-tex",
        triggers: { event: "resume/compile.requested" },
        concurrency: { limit: 5 },
        retries: 1,
    },
    async ({ event, step }) => {
        try {
            await step.run("mark-compiling", () => DataService.updateGenerationJob(event.data.jobId, "compiling"));
            const pdfBase64 = await step.run("compile-latex", () =>
                TexSandboxService.compile(sanitizeTex(event.data.texFile))
            );

            await step.run("save-resume-pdf-file", () =>
                DataService.savePdfFile(event.data.resumeId, event.data.userId, pdfBase64)
            );
            await step.run("mark-completed", () => DataService.updateGenerationJob(event.data.jobId, "completed"));

            return { resumeId: event.data.resumeId, status: "completed" };
        } catch (error) {
            await step.run("mark-failed", () => DataService.updateGenerationJob(
                event.data.jobId,
                "failed",
                "Compilation encountered an issue",
            ));
            throw error;
        }
    }
);

export const functions = [
    getCode,
    compileResumeTex,
];