import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import roomModel from "../models/room.model";

export const getAll = async (req, res) => {
  try {
    const { query } = req;

    const { isPagination, ...pagination } = await getPagination(
      roomModel,
      query
    );

    const product = await roomModel.read(query, isPagination);

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
    const body = req.body;
    // const { error } = AuthValidator.validatorRegister(req.body);
    // if (error) {
    //   return responseError(res, error);
    // }
    // status: 0: trống - 1: đang sử dụng
    const result = await roomModel.create({ ...body, status: "Trống" });

    const response = {
      data: result,
      message: "Tạo mới thành công",
    };
    responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedCategory = await roomModel.update("id", id, body);
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
    const category = await roomModel.findOne({ id });

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
    const category = await roomModel.delete(id);
    const data = {
      message: "Xóa dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getAllRoomCountDesktop = async (req, res) => {
  try {
    console.log(1);

    const query = `SELECT room.id, room.room_name, room.capacity, COUNT(desktop.room_id) AS desktop_count
    FROM cybergame.room
    JOIN cybergame.desktop ON room.id = desktop.room_id
    GROUP BY room.id, room.room_name, room.capacity;`;

    const [result] = await roomModel.connection.promise().query(query);

    const data = {
      message: "Xóa dữ liệu thành công",
      data: result,
    };
    return responseSuccess(res, data);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};
