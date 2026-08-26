import { TexSandboxService } from "../common/services/tex-sandbox.service";
import { DataService } from "../modules/user data/data.service";
import { resumeSystemPrompt } from "./system-prompt";
import { inngest } from "./client";

export { inngest };
const getCode = inngest.createFunction(
    { id: "get-code", triggers: { event: "app/texcode" }, retries: 5 },
    async ({ event, step }) => {
        const resumeData = await step.run("get-resume-data", () =>
            DataService.getData(event.data.userId)
        );

        const response = await step.ai.infer("call-openai", {
            model: step.ai.models.openai({ model: "gpt-4o" }),
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
        });

        const generatedTex = response.choices
            .map((choice) => choice.message?.content ?? "")
            .filter(Boolean)
            .join("\n");

        const savedTexFile = await step.run("save-resume-tex-file", () =>
            DataService.saveTexFile(event.data.resumeId, event.data.userId, generatedTex)
        );

        if (savedTexFile) {
            await step.sendEvent("queue-tex-compilation", {
                name: "resume/compile.requested",
                data: {
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
        concurrency: { limit: 6 },
        retries: 1,
    },
    async ({ event, step }) => {
        const pdfBase64 = await step.run("compile-latex", () =>
            TexSandboxService.compile(event.data.texFile)
        );

        await step.run("save-resume-pdf-file", () =>
            DataService.savePdfFile(event.data.resumeId, event.data.userId, pdfBase64)
        );

        return { resumeId: event.data.resumeId, status: "completed" };
    }
);

export const functions = [
    getCode,
    compileResumeTex,
];