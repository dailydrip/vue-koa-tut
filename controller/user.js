// import core modules
const Promise = require('bluebird')

// import models
const User = Promise.promisifyAll(require('../model/Model').User)
const Task = Promise.promisifyAll(require('../model/Model').Task)


// get user by username
exports.getUser = async ctx => {
  // grab user from database by username
  const user = await User.findOneAsync({username: ctx.params.username})
  if (!user) {throw new Error('User not found.')}
  // send proper user info in response
  ctx.body = {username: user.username, tasks: user.tasks}
}

// create new user
exports.createUser = async ctx => {
  // format needed data
  const username = ctx.request.body.username
  const password = ctx.request.body.password
  // create user  
  const user = await User.createAsync({username, password})
  if (!user) {throw new Error('Error while creating user.')}
  // send response
  ctx.status = 200
  ctx.body = "success"
}

// delete user by username
exports.deleteUser = async ctx => {
  // get username
  const username = ctx.request.body.username
  // delete user by username
  const deletedUser = await User.findOneAndRemoveAsync({username})
  if (!deletedUser) {throw new Error('Failed to delete user.')}
  // send response if all goes well
  ctx.status = 200
  ctx.body = "success"
}

