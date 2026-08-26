import Router from "express";
import { DataController } from "./data.controller";
import { requireAuth } from "../../common/middleware.ts/auth.middleware";

const dataRouter = Router();

dataRouter.get("/invokeai", requireAuth, DataController.getData);
dataRouter.post("/savedetails", requireAuth, DataController.saveData);
dataRouter.patch("/updatedetails/:id", requireAuth, DataController.updateData);
dataRouter.post("/generate", requireAuth, DataController.generate);
dataRouter.get("/generation/:id", requireAuth, DataController.getGenerationStatus);
dataRouter.get("/:id/pdf", requireAuth, DataController.getPdf);

export { dataRouter };