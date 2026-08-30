import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "resume-builder",
  isDev: process.env.NODE_ENV !== "production" && process.env.INNGEST_DEV === "1",
});
