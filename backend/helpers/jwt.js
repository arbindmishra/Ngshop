//USED FOR PROTECTING THE API
//MAKES THE SERVER PROTECTED
//NO ONE CAN USE THE API WITHOUT THE TOKEN
//DOWNGRADE TO npm i express-jwt@6.0.0 FOR WORKING
require("dotenv/config");
const expressJwt = require("express-jwt");
const api = process.env.API_URL;
function authJwt() {
  const secret = process.env.secret;
  return expressJwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] }, //FOR IMAGES OF PRODUCTS
      { url: /\/api\/v1\/products(.*)/, methods: ["GET", "OPTIONS"] }, //WE USE REGEX TO HAVE LESS CODE
      //   { url: ${api}products, methods: ["GET", "OPTIONS"] },
      //USERS CAN SEE PRODUCTS WITHOUT LOGING IN
      { url: /\/api\/v1\/categories(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/orders(.*)/, methods: ["POST", "OPTIONS"] },
      `${api}/users/login`, //EXCLUDES LOGIN FROM API PROTECTION AS WE NEED TO LOGIN TO GET A JWT TOKEN
      `${api}/users/register`,
      // { url: /(.*)/ },
    ],
  });
}

//USED TO CHECK ADMIN PREVILAGE
async function isRevoked(req, payload, done) {
  if (!payload.isAdmin) {
    done(null, true);
  }

  done();
}

module.exports = authJwt;
