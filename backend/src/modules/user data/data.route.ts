import Router from "express";
import { DataController } from "./data.controller";
import { requireAuth } from "../../common/middleware.ts/auth.middleware";

const dataRouter = Router();

dataRouter.post("/savedetails", requireAuth, DataController.saveData);
dataRouter.patch("/updatedetails/:id", requireAuth, DataController.updateData);

export { dataRouter };