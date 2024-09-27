import BaseModel from "./base.model";

class RoomModel extends BaseModel {
  constructor() {
    super({
      table: "room",
      fillable: [
        "id",
        "room_name",
        "status",
        "position",
        "image_url",
        "capacity",
        "description",
      ],
    });
  }
}

export default new RoomModel();
