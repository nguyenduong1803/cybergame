import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import cartModel from "../models/cart.model";
import orderModel from "../models/order.model";
import orderDetailModel from "../models/order-detail.model";
import orderRoomModel from "../models/order-room.model";
import { ORDER_STATUS, ORDER_TYPE } from "../config/constant";

export const getAll = async (req, res) => {
  try {
    const { query } = req;

    const { isPagination, ...pagination } = await getPagination(
      orderModel,
      query
    );

    const product = await orderModel.read(query, isPagination);

    const data = {
      message: "Lấy danh sách thành công.",
      data: product,
      pagination,
    };
    responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const create = async (req, res) => {
  try {
    const { carts, products, orderType, rooms, orders, ...remainBody } =
      req.body;

    const result = await orderModel.create({
      ...remainBody,
      status: ORDER_STATUS.CONFIRMED,
    });

    const order_id = result?.insertId;

    const productWithOrderId = [];
    const roomWithOrderId = [];

    if (products && products.length > 0) {
      products.forEach((product) => {
        productWithOrderId.push({
          ...product,
          order_id,
        });
      });
    }
    console.log("errr");

    if (rooms && rooms.length > 0) {
      rooms.map((room) => {
        roomWithOrderId.push({
          ...room,
          order_id,
        });
      });
    }
    console.log("🚀 ~ roomWithOrderId:", roomWithOrderId);
    await cartModel.deleteMultple("id", carts);

    await Promise.all([
      orderDetailModel.createMultiple(productWithOrderId),
      orderRoomModel.createMultiple(roomWithOrderId),
    ]);

    const response = {
      data: result,
      message: "Tạo mới hóa đơn thành công",
    };
    responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const [room, product, detail] = await Promise.all([
      orderModel.getRoomOrderDetail(id),
      orderModel.getProductOrderDetail(id),
      orderModel.findOne({ id }),
    ]);
    const data = {
      message: "Lấy danh sách thành công.",
      data: { room, product, detail },
    };
    responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};
// export const getDetailByUserId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const [room, product, detail] = await Promise.all([
//       orderModel.getRoomOrderDetailByUserId(id),
//       orderModel.getProductOrderDetailByUserId(id),
//       orderModel.findOne({ id }),
//     ]);
//     const data = {
//       message: "Lấy danh sách thành công.",
//       data: { room, product, detail },
//     };
//     responseSuccess(res, data);
//   } catch (error) {
//     return responseError(res, error);
//   }
// };

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedCategory = await orderModel.update("id", id, body);
    const response = {
      message: "Cập nhật dữ liệu thành công",
      data: updatedCategory,
    };
    return responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
};

export const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await orderModel.findOne({ id });

    if (!category) {
      return responseNotFound(res);
    }

    const data = {
      message: "Lấy dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await orderModel.delete(id);
    const data = {
      message: "Xóa dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticProductOrder = async (req, res) => {
  try {
    const response = await orderModel.statisticProduct();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticRoomOrder = async (req, res) => {
  try {
    const response = await orderModel.statisticRoom();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticTotalPrice = async (req, res) => {
  try {
    const response = await orderModel.statisticTotalPrice();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const detailOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const query = `
      SELECT 
        o.id AS order_id,
        o.created_at as order_date,
        o.status AS order_status,
        o.total_money AS total_amount,  -- total amount of the order
        o.status,  -- payment status of the order
        
        u.username,
        u.email,
        u.is_vip,
        u.vip_end_date,
        
        p.product_name,
        p.price AS unit_price,  -- unit price of the product
        od.quantity AS product_quantity,
        (od.quantity * p.price) AS product_total_price,
        c.category_name AS product_category,

        r.room_name,
        rod.start_time AS room_start_time,
        rod.end_time AS room_end_time,
        rod.total_time AS room_total_time,
        rod.total_price AS room_total_price  -- total price for the room

      FROM orders o
      JOIN \`user\` u ON o.user_id = u.id
      LEFT JOIN order_detail od ON o.id = od.order_id
      LEFT JOIN product p ON od.product_id = p.id
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN room_order_detail rod ON o.id = rod.order_id
      LEFT JOIN room r ON rod.room_id = r.id

      WHERE o.id = ?;
    `;

    const [rows] = await orderModel.connection
      .promise()
      .query(query, [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const response = {
      order_id: rows[0].order_id,
      order_date: rows[0].order_date,
      order_status: rows[0].order_status,
      total_amount: rows[0].total_amount,
      payment_status: rows[0].payment_status, // Add payment status
      user: {
        username: rows[0].username,
        email: rows[0].email,
        is_vip: rows[0].is_vip,
        vip_end_date: rows[0].vip_end_date,
      },
      products: rows
        .filter((row) => row.product_name)
        .map((row) => ({
          product_name: row.product_name,
          unit_price: row.unit_price, // Ensure unit price is included
          quantity: row.product_quantity,
          total_price: row.product_total_price,
          category: row.product_category,
        })),
      rooms: rows
        .filter((row) => row.room_name)
        .map((row) => ({
          room_name: row.room_name,
          start_time: row.room_start_time,
          end_time: row.room_end_time,
          total_time: row.room_total_time,
          total_price: row.room_total_price, // Ensure room total price is included
        })),
    };

    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred", error });
  }
};
