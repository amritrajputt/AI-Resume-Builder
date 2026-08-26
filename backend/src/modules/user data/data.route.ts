import Router from "express";
import { DataController } from "./data.controller";

const dataRouter = Router();

dataRouter.post("/savedetails", DataController.saveData);
dataRouter.patch("/updatedetails/:id", DataController.updateData);

export { dataRouter };