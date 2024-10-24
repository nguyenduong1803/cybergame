import productRoutes from "./product";
import usersRoutes from "./user";
import categoryRoutes from "./category";
import cartRoutes from "./cart";
import roomRoutes from "./room";
import orderRoutes from "./order";
import desktopRoutes from "./desktop";

export const routes = [
  { ...productRoutes },
  { ...usersRoutes },
  { ...categoryRoutes },
  { ...cartRoutes },
  { ...roomRoutes },
  { ...orderRoutes },
  { ...desktopRoutes },
];
