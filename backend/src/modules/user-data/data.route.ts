import { Router } from "express";
import { DataController } from "./data.controller";
import { ipRateLimiter } from "../../db/redis";

const dataRouter = Router();

dataRouter.get("/resumes", DataController.getData);
dataRouter.post("/resumes", DataController.saveData);
dataRouter.patch("/resumes/:id", DataController.updateData);
dataRouter.get("/getip", DataController.getIp);
dataRouter.get("/invokeai", DataController.getData);
dataRouter.post("/savedetails", DataController.saveData);
dataRouter.patch("/updatedetails/:id", DataController.updateData);

dataRouter.post("/generate", ipRateLimiter, DataController.generate);
dataRouter.get("/generation/:id", DataController.getGenerationStatus);
dataRouter.get("/:id/pdf", DataController.getPdf);

export { dataRouter };