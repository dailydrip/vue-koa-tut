// import core modules
const Promise = require('bluebird')
const koa = require('koa')
const mongoose = Promise.promisifyAll(require('mongoose'))
const config = require('./config')

// import authentication modules
const passport = require('koa-passport')
const jwt = require('koa-jwt')
require('./services/clientAuth')
const authServer = require('./services/oauth').server

// import middleware config
const bodyParser = require('koa-bodyParser')
const convert = require('koa-convert')
const res = require('koa-res')
const router = require('koa-simple-router')
const cors = require('kcors')

// import models
const Client = require('./model/Model').Client

// import controllers
const task = require('./controller/task')
const user = require('./controller/user')

// initialize koa server
const app = new koa()

/*
  function that checks if a Client exists in the database for the dashboard
*/
const clientCheck = async () => {
  const client = await Client.findOneAsync({name: 'ToDo Dashboard'})
  if (!client) {
    console.log('no ToDo Dashboard client found, creating new one')
    const newClient = await Client.create({
      name: 'ToDo Dashboard',
      clientId: 'my-awesome-clientid',
      clientSecret: 'my-awesome-clientSecret',
      trustedClient: true
    })
    if(!newClient) {console.log('error creating dashboard client!')} else {console.log('new ToDo Dashboard Client created')}
  }
}
 
/*
  Mongoose Config
*/

mongoose.Promise = require('bluebird')
mongoose
.connect(config.mongoUrl)
.then(response => {
  console.log('connected to mongo :-)')
  clientCheck()
})
.catch((err) => {
  console.log("Error connecting to Mongo")
  console.log(err)
})

/*
  Server Config
*/
// error handling
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 500
      ctx.body = "There has been an error processing your request."
      ctx.app.emit('error', err, ctx)
    } 
    else if (err.status === 501) {
      console.log(err.message)
      ctx.body = err.message
      ctx.app.emit('error', err, ctx)
    } else {
      ctx.status = err.status || 500
      ctx.body = err.message
      ctx.app.emit('error', err, ctx)
    }
  }
})

// initialize passport
app.use(passport.initialize())

// format response as JSON
app.use(convert(res()))

// cors
app.use(convert(cors()))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}`)
})

// body parser
app.use(bodyParser())

// unprotected router
app.use(router(_ => {
  _.post('/token',
    passport.authenticate('clientPassword', { session: false }),
    authServer.token(),
    authServer.errorHandler())
}))

// // jwt config, any routes after this will require a JWT to be accessed
app.use(jwt({secret: config.secret}))

// protected router
app.use(router(_ => {
  // get user by username
  _.get('/user/:username', user.getUser),
  // create new user
  _.post('/user/new', user.createUser),
  // delete user by username
  _.delete('/user', user.deleteUser),
  // get user tasks
  _.get('/task/:username', task.getUserTasks),
  // create new task
  _.post('/task', task.createTask),
  // edit task
  _.put('/task', task.editTask),
  // delete task
  _.delete('/task', task.deleteTask)
}))

app.listen(3000)
