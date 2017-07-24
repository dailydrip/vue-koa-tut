// import core modules
const Promise = require('bluebird')

// import models
const User = Promise.promisifyAll(require('../model/Model').User)
const Task = Promise.promisifyAll(require('../model/Model').Task)

// get all tasks for specific user
exports.getUserTasks = async ctx => {
  // grab username
  const username = ctx.params.username
  // find user by username
  const user = await User.findOneAsync({username})
  if (!user) {throw new Error('User not found')}
  // setup empty array then fill it with all the tasks from the User
  let x = []
  for (let id of user.tasks) {
    const newTask = await Task.findByIdAsync({id})
    if (!newTask) {throw new Error('Task not found.')}
    x.push(newTask)
  }
  // send array of tasks out to the user. 
  ctx.body = x
}

// create new task
exports.createTask = async ctx => {
  // get username and taskname info
  const username = ctx.request.body.username
  const taskname = ctx.request.body.taskname
  // find user by username to get the id
  const user = await User.findOneAsync({username})
  if (!user) {throw new Error('User not found')}
  // get userId
  const userId = user.id
  // create task
  const newTask = await Task.createAsync({name: taskname, user: userId})
  if (!newTask) {throw new Error('Task failed to create.')}
  // send success signal
  ctx.status = 200
  ctx.body = 'success'
}

// edit task
exports.editTask = async ctx => {
  // grab the username, old task name, and new taskname
  const username = ctx.request.body.username
  const taskname = ctx.request.body.taskname
  const newTaskName = ctx.request.body.newTaskName
  // Find the task and update it
  const editTask = await Task.findOneAndUpdateAsync({name: taskname}, {name: newTaskName})
  if (!editTask) {throw new Error('Failed to update task.')}
  // send success signal
  ctx.status = 200
  ctx.body = 'success'
}

// delete task
exports.deleteTask = async ctx => {
  // grab the username and taskname
  const username = ctx.request.body.username
  const taskname = ctx.request.body.taskname
  // get the user
  const user = await User.findOneAsync({username})
  if (!user) {throw new Error('User not found')}
  // get the task
  const task = await Task.findOneAsync({name: taskname})
  if (!task) {throw new Error('Task not found')}
  // delete Task and edit User in parallel operation
  const deadTask = Task.findOneAndRemoveAsync({name: taskname})
  const editUser = User.findOneAndUpdateAsync({username}, {$pull: {tasks: {$in: [task.id]}}})
  const [dt, eu] = await Promise.all([deadTask, editUser])
  if (!dt || !eu) {throw new Error('Agh! Failed to delete user.')}
  // // send success signal
  ctx.status = 200
  ctx.body = 'success'
}