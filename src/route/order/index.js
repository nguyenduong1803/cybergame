import orderRoute from "./order.route";
import orderProductRoute from "./order-product-detail";
import orderRoomRoute from "./order-room-detail";

const orderRoutes = {
  prefix: "/",
  routes: [
    {
      path: "order",
      route: orderRoute,
    },
    {
      path: "order/room",
      route: orderRoomRoute,
    },
    {
      path: "order/product",
      route: orderProductRoute,
    },
  ],
};

export default orderRoutes;
