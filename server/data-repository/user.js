const UserModel = require('../models/user')

module.exports = class User {

  static async findOne(fields = {}, sort = { magic_id: 1 }) {
    return UserModel.findOne(fields).sort(sort);
  }

  static async create(fields = {}) {
    const newUser = new UserModel(fields);
    return await newUser.save();
  }

  static async count() {
    return await UserModel.count();
  }

  static async updateOne(fieldFilter = {}, updates = {}) {
    return UserModel.UpdateOne(fieldFilter, updates);
  }
  
  static async findOneBySelection(fieldFilter = {}, sort={}, selectOption={}){
    return UserModel.FindOne(fieldFilter, sort).select(selectOption);
  }
}
