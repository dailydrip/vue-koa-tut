const Promise = require('bluebird'),
			config = require('../config'),
			jwt = Promise.promisifyAll(require('jsonwebtoken')),
			User = require('../model/Model').User

exports.generateJwt = userId => {
 	const payload = {id: userId},
				opts = {expiresIn: '1h'}
 	return jwt.signAsync(payload, config.secret, opts)
}

/**
 * Return a random int, used by `utils.uid()`
 * Meant for internal use within this library only.
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/*
  * Return a random int, used by `utils.uid()`
  * Meant for external use for the rest of the app services
  *
  * @param {Number} min
  * @param {Number} max
  * @return {Number}
  * @api private
*/

exports.getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/*
*	Return a JWT with necessary ID information
*
* @param {String} userId
* @return {String}
*/
exports.generateJwt = (payloadInfo) => {
 	const payload = payloadInfo,
   opts = {expiresIn: '1h'}
 	return jwt.signAsync(payload, config.secret, opts)
}

/**
 * Return a unique identifier with the given `len`.
 *
 * utils.uid(10);
 * // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
exports.uid = (len) => {
  const buf = [],
        	chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        	charlen = chars.length

  for (var i = 0; i < len; ++i) {
    buf.push(chars[getRandomInt(0, charlen - 1)])
  }

  return buf.join('')
}