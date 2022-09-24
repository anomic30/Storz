const UserModel = require('../models/user')

module.exports = class User {

  static async findOne(fields = {}, sort = { _id: 1 }) {
    return await UserModel.findOne(fields).sort(sort);
  }

  static async create(fields = {}) {
    const newUser = new UserModel(fields);
    return await newUser.save();
  }

  static async count() {
    return await UserModel.count();
  }
}