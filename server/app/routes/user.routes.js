const controller = require("../controllers/user.controller.js");
const client = require("../config/db.config.js")

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/users/blog-view", controller.blogView);



  return app;
};
