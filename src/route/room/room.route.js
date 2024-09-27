import express from "express";
import * as roomController from "../../controllers/room.controller";

const router = express.Router();
router.post("/add", roomController.create);
router.put("/update/:id", roomController.update);
router.delete("/remove/:id", roomController.deleteRecord);
router.get("/searchById/:id", roomController.getById);
router.get("", roomController.getAll);

export default router;
