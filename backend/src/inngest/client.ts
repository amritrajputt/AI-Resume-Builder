import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "resume-builder",
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
