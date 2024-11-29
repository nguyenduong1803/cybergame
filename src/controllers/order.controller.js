import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import cartModel from "../models/cart.model";
import orderModel from "../models/order.model";
import orderDetailModel from "../models/order-detail.model";
import orderRoomModel from "../models/order-room.model";
import { ORDER_STATUS, ORDER_TYPE } from "../config/constant";
import { getBillNotify } from "../helpers/emailTemplate";
import { sendMail } from "../helpers/sendMail";

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
    console.log(req.body)
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
          product_id: parseInt(product.product_id),
          order_id,
        });
      });
      orderDetailModel.createMultiple(productWithOrderId)
    }

    if (rooms && rooms.length > 0) {
      rooms.map((room) => {
        roomWithOrderId.push({
          ...room,
          room_id: parseInt(room.room_id),
          order_id,
        });
      });
      orderRoomModel.createMultiple(roomWithOrderId)
    }

    if(carts && carts.length > 0) { 
      await cartModel.deleteMultple("id", carts);
    }

    const response = {
      data: result,
      message: "Tạo mới hóa đơn thành công",
    };
    responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
      console.log('req.body:', req.body)
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
    const {status} = body
    const updatedCategory = await orderModel.update("id", id, {status});
    const response = {
      message: "Cập nhật dữ liệu thành công",
      data: updatedCategory,
    };

    if(body.status ==="CANCELLED"){
      const resp = await sendMail(getBillNotify(body));
    }
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
    const body = req.body;
    const response = await orderModel.statisticTotalPrice(body?.startDate,body?.endDate);
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

// Hàm lấy hóa đơn của người dùng
export const getUserOrders = async (req, res) => {
  const userId = parseInt(req.params.id, 10); // Chuyển đổi sang số nguyên

  // Kiểm tra ID người dùng hợp lệ
  if (isNaN(userId)) {
    return res.status(400).json({ message: "ID người dùng không hợp lệ." });
  }

  // Truy vấn SQL để lấy thông tin đơn hàng và chi tiết phòng
  const query = `
    SELECT 
        o.id AS order_id,
        o.total_money,
        o.order_date,
        o.status AS order_status,
        od.id AS order_detail_id,
        od.product_id,
        od.quantity AS order_quantity,
        od.price AS order_detail_price,
        p.product_name AS product_name,
        p.image_url AS product_image,
        rod.id AS room_order_detail_id,
        rod.room_id,
        rod.start_time,
        rod.end_time,
        rod.total_time,
        rod.total_price AS room_order_total_price,
        r.id AS room_id,          -- Thêm ID phòng
        r.room_name,
        r.image_url AS room_image
    FROM 
        orders o
    LEFT JOIN 
        order_detail od ON o.id = od.order_id
    LEFT JOIN 
        product p ON od.product_id = p.id
    LEFT JOIN 
        room_order_detail rod ON o.id = rod.order_id
    LEFT JOIN 
        room r ON rod.room_id = r.id
    WHERE 
        o.user_id = ?; 
  `;

  try {
    const [results] = await orderModel.connection
      .promise()
      .execute(query, [userId]);

    // Kiểm tra xem có kết quả hay không
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hóa đơn nào cho người dùng này." });
    }

    // Xử lý kết quả trả về
    const orders = results.reduce((acc, row) => {
      const {
        order_id,
        total_money,
        order_date,
        order_status,
        order_detail_id,
        product_id,
        order_quantity,
        order_detail_price,
        product_name,
        product_image,
        room_order_detail_id,
        room_id,
        start_time,
        end_time,
        total_time,
        room_order_total_price,
        room_name,
        room_image,
      } = row;

      let order = acc.find((o) => o.id === order_id);

      // Nếu chưa có đơn hàng trong mảng accumulator, tạo mới
      if (!order) {
        order = {
          id: order_id,
          total_money,
          order_date,
          order_status,
          order_details: [],
          room_order_details: [],
        };
        acc.push(order);
      }

      // Thêm chi tiết đơn hàng nếu có
      if (order_detail_id) {
        order.order_details.push({
          id: order_detail_id,
          product_id,
          product_name,
          product_image,
          quantity: order_quantity,
          price: order_detail_price,
        });
      }

      // Thêm chi tiết phòng nếu có
      if (room_order_detail_id) {
        order.room_order_details.push({
          id: room_order_detail_id,
          room_id,
          room_name,
          room_image,
          start_time,
          end_time,
          total_time,
          total_price: room_order_total_price,
        });
      }

      return acc; // Trả về accumulator
    }, []);

    // Phản hồi thành công
    const data = {
      message: "Lấy dữ liệu thành công",
      data: orders,
    };
    return responseSuccess(res, data);
  } catch (error) {
    console.error("Lỗi khi lấy hóa đơn:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy hóa đơn." });
  }
};
