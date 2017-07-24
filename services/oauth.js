/*
* OAuth2orize token exchanges are defined here.
* In this case, you are using the Password Exchange Flow
* and the Refresh Token Exchange Flow
*/

// load modules
const Promise = require('bluebird')
const oauth2orize = require('oauth2orize-koa')
const Client = Promise.promisifyAll(require('../model/Model').Client)
const User = Promise.promisifyAll(require('../model/Model').User)
const jwt = Promise.promisifyAll(require('jsonwebtoken'))
const crypto = require('crypto')
const fs = require('fs')
const passport = require('koa-passport')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const utility = require('../services/utility')
const config = require('../config')

/*
*   Config OAuth2orize
*/
// create OAuth 2.0 server
const server = oauth2orize.createServer()

// Password exchange flow
server.exchange(oauth2orize.exchange.password(async (client, username, password, scope) => {
  // generate refresh token
  const refreshToken = await utility.uid(256)
  // encrypt the refresh token
  const refreshTokenHash = await crypto.createHash('sha1').update(refreshToken).digest('hex')
  if (!refreshTokenHash) {return false}
  // Find user by email
  const user = await User.findOneAsync({username: username})
  if (!user) {return false}
  // password check
  const passwordCompareResult = await bcrypt.compareAsync(password, user.password)
  if (!passwordCompareResult) {return false}
  // format the jwt data
  const payload = {
    name: user.username,
    userId: user.id,
    sub: user.username,
    aud: 'todo-list',
    issuer: 'todo-list',
    role: user.role,
    clientId: client.clientId
  }
  // create jwt
  const token = await jwt.signAsync(payload, config.secret, {expiresIn: '1h'})
  if (!token) {return false} 
  
  // send jwt
  return token
}))

// token endpoint
exports.token = [
  passport.authenticate(['clientBasic', 'clientPassword'], { session: false }),
  server.token(),
  server.errorHandler()
]

exports.server = server