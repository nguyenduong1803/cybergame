import mysql from "mysql2";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

export const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Không thể kết nối đến cơ sở dữ liệu:", err);
    return;
  }
  console.log("Đã kết nối đến cơ sở dữ liệu MySQL");
});



const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function updateRoomStatus() {
  pool.getConnection(async(err, connection)=>{
    try {
      return new Promise((resolve, reject) => {
        connection.query(`
          UPDATE room r
          INNER JOIN room_order_detail rod ON r.id = rod.room_id
          SET r.status = 'ACTIVE'
          WHERE rod.start_time <= NOW()
          AND rod.end_time > NOW() 
          AND r.status = 'INACTIVE'
        `,(err,result)=>{
          if(err){
            connection.rollback();
          }
        });
      console.log('Room status updated successfully');
      connection.release();
      });

    } catch (error) { 
      console.error('Error updating room status:', error);
    } 
  })
 
}

cron.schedule('* * * * *', updateRoomStatus);