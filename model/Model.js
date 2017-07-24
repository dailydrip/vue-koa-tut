const mongoose = require('mongoose')
const Schema = mongoose.Schema
const relationship = require('mongoose-relationship')

// USER Model
const UserSchema = mongoose.Schema({
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true, bcrypt: true},
	tasks: [{type: Schema.ObjectId, ref: 'Task'}]
})

// TASK Model
const TaskSchema = mongoose.Schema({
	name: String,
	user: {type: Schema.ObjectId, ref: 'User', childPath: 'tasks'}
})

// CLIENT Model
let ClientSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  clientId: { type: String, required: true },
  clientSecret: { type: String, required: true },
  trustedClient: { type: Boolean, required: true }
})

// Plugins
UserSchema.plugin(require('mongoose-unique-validator'))
UserSchema.plugin(require('mongoose-bcrypt'))
TaskSchema.plugin(relationship, {relationshipPathName: 'user'})
ClientSchema.plugin(require('mongoose-unique-validator'))

// Exports
exports.Task = mongoose.model('Task', TaskSchema)
exports.User = mongoose.model('User', UserSchema)
exports.Client = mongoose.model('Client', ClientSchema)