/*
包含n个操作数据库集合数据的Model模块
1. 连接数据库
  1.1. 引入mongoose
  1.2. 连接指定数据库(URL只有数据库是变化的)
  1.3. 获取连接对象
  1.4. 绑定连接完成的监听(用来提示连接成功)
2. 定义出对应特定集合的Model并向外暴露
  2.1. 字义Schema(描述文档结构)
  2.2. 定义Model(与集合对应, 可以操作集合)
  2.3. 向外暴露Model
 */

/*1. 连接数据库*/
// 1.1. 引入mongoose
const mongoose = require('mongoose')
const formidable = require('formidable');
// 1.2. 连接指定数据库(URL只有数据库是变化的)
mongoose.connect('mongodb://localhost:27017/family-db')
// 1.3. 获取连接对象
const conn = mongoose.connection
// 1.4. 绑定连接完成的监听(用来提示连接成功)
conn.on('connected', () => {
  console.log('db connect success!') 
})

/*2. 定义出对应特定集合的Model并向外暴露*/
// 2.1. 字义Schema(描述文档结构)
const userSchema = mongoose.Schema({
  father_id: {type: String},
  family_id: {type: String},
  familyName: {type: String}, // 名字
  name: {type: String}, // 名字
  generations: {type: String}, // 名字
  familySize: {type: String}, 
  img: {type: String},
  isGone: {type: Boolean}, // 名字
  isMarry: {type: Boolean}, // 名字
  isBoy: {type: Boolean}, // 名字
  phoneNum: {type: String}, // 电话
  birthday: {type: String}, // 出生日期
  death: {type: String}, // 出生日期
  profession: {type: String}, // 职业
  address: {type: String}, // 家庭住址
  wife:{type:Object},
  information: {type: String}, // 个人或职位简介
  
})
// 2.2. 定义Model(与集合对应, 可以操作集合)
const UserModel = mongoose.model('person', userSchema) // 集合为: users
// 2.3. 向外暴露Model
// function testSave() {
//   // 创建UserModel的实例
//   const userModel = new UserModel({
//     name:"尔曲",
//     isGone: true
//   })
//   // 调用save()保存
//   userModel.save(function (error, user) {
//     console.log('save()', error, user)
//   })
// }
// testSave()
exports.UserModel = UserModel


// 定义family集合的文档结构
const familySchema = mongoose.Schema({
  img: {type: String,required: true}, 
  name: {type: String, required: true},
  information:{type: String, required: true}, // from和to组成的字符串
  family:{type: Array, required: true}, 
})
// 定义能操family集合数据的Model
const familyModel = mongoose.model('family', familySchema) // 集合为: chats
// 向外暴露Model
exports.familyModel = familyModel

// 定义chats集合的文档结构
const chatSchema = mongoose.Schema({
  from_: {type: String, required: true}, // 发送用户的id
  to: {type: String, required: true}, // 接收用户的id
  chat_id: {type: String, required: true}, // from和to组成的字符串
  content: {type: String, required: true}, // 内容
  type: {type: String, required: true},
  isRead:{type: Boolean, required: true},
  time:{type: Number, required: true},
  create_time:{type: String} // 创建时间
})
// 定义能操作chats集合数据的Model
const ChatModel = mongoose.model('chat', chatSchema) // 集合为: chats
// 向外暴露Model
exports.ChatModel = ChatModel

// module.exports = xxx
// exports.xxx = value
// exports.yyy = value