import { Inngest } from "inngest";
import { DataService } from "../modules/user data/data.service";
import { resumeSystemPrompt } from "./system-prompt";

export const inngest = new Inngest({ id: "resume-builder" });
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
                            event.data.message ?? "create a tex code for this resume",
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

        await step.run("save-resume-tex-file", () =>
            DataService.saveTexFile(event.data.userId, generatedTex)
        );

        return { generatedTex };
    }
);

export const functions = [
    getCode
];