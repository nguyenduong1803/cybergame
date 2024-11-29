import express from "express";
import * as orderController from "../../controllers/order.controller";
import * as paymentController from "../../controllers/payment.controller";
import { getTimeLineOrderRoom } from "../../controllers/order-room-detail.controller";

const router = express.Router();
router.post("/add", orderController.create);
router.put("/update/:id", orderController.update);
router.delete("/remove/:id", orderController.deleteById);
router.get("/searchById/:id", orderController.findById);
router.get("", orderController.getAll);
router.get("/detail/:id", orderController.detailOrder);
router.get("/statistic-product", orderController.statisticProductOrder);
router.get("/statistic-room", orderController.statisticRoomOrder);
router.post("/statistic-revenue", orderController.statisticTotalPrice);

router.post("/add/payment", paymentController.createPayment);
router.get("/save-payment", paymentController.savePayment);

router.get("/get-one-order-by-user-id/:id", orderController.getUserOrders);

router.post("/get-order-room-timeline", getTimeLineOrderRoom);

export default router;
