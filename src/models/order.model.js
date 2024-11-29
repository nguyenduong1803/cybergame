import BaseModel from "./base.model";

class OrderModel extends BaseModel {
  constructor() {
    super({
      table: "orders",
      fillable: ["id", "user_id", "total_money", "status", "description", "payment_method"],
    });
  }

  getRoomOrderDetail(orderId) {
    return new Promise((resolve, reject) => {
      const queryRoom = `SELECT * FROM cybergame.room_order_detail right join room on room.id = room_order_detail.room_id where room_order_detail.order_id = ${orderId}`;
      this.connection.query(queryRoom, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
    });
  }

  getRoomOrderDetailByUserId(userId) {
    const queryRoom = `SELECT * FROM cybergame.room_order_detail right join orders on orders.id = room_order_detail.order_id left join room on room.id = room_order_detail.room_id where orders.user_id = ${userId}`;
    this.connection.query(queryRoom, (error, result) => {
      if (error) {
        reject(error);
      } else if (result && result?.length !== 0) {
        resolve(result);
      }
      resolve();
    });
  }

  getProductOrderDetailByUserId(userId) {
    const queryRoom = `SELECT * FROM cybergame.order_detail left join orders on orders.id = order_detail.order_id left join product on order_detail.product_id = product.id where orders.user_id = ${userId}`;
    this.connection.query(queryRoom, (error, result) => {
      if (error) {
        reject(error);
      } else if (result && result?.length !== 0) {
        resolve(result);
      }
      resolve();
    });
  }

  getProductOrderDetail(orderId) {
    return new Promise((resolve, reject) => {
      const queryProduct = `SELECT * FROM cybergame.order_detail right join product on product.id = order_detail.product_id where order_detail.order_id = ${orderId}`;
      this.connection.query(queryProduct, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
    });
  }
  statisticProduct(orderId) {
    return new Promise((resolve, reject) => {
      const queryProduct = `SELECT p.id, p.product_name, p.price, SUM(id.quantity) AS sold_quantity,
       p.price * SUM(id.quantity) AS total_price
FROM order_detail id
JOIN product p ON id.product_id = p.id
GROUP BY p.id, p.product_name, p.price
ORDER BY sold_quantity DESC
LIMIT 5;`;
      this.connection.query(queryProduct, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
    });
  }
  statisticRoom(orderId) {
    return new Promise((resolve, reject) => {
      const queryProduct = `
      SELECT p.id, p.room_name, p.price, COUNT(id.room_id) AS sold_quantity,
       SUM(p.price) AS total_price
FROM room_order_detail id
JOIN room p ON id.room_id = p.id
GROUP BY p.id, p.room_name, p.price
ORDER BY sold_quantity DESC
LIMIT 5;`;
      this.connection.query(queryProduct, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result?.length !== 0) {
          resolve(result);
        }
        resolve();
      });
    });
  }

  statisticTotalPrice(startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
      let queryProduct = `
        SELECT SUM(total_money) AS total_revenue
        FROM orders
      `;
      
      let params = [];

      // Chỉ thêm điều kiện WHERE khi có startDate và endDate
      if (startDate && endDate) {
        queryProduct += ` WHERE created_at BETWEEN ? AND ?`;
        // Chuyển đổi endDate để bao gồm cả ngày kết thúc
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        
        params = [new Date(startDate), endDateTime];
      }

      this.connection.query(queryProduct, params, (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.length !== 0) {
          resolve(result[0]); // Trả về trực tiếp object chứa total_revenue
        } else {
          resolve({ total_revenue: 0 }); // Trả về 0 nếu không có dữ liệu
        }
      });
    });
  }
}

export default new OrderModel();
