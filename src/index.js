require("dotenv").config();

const bodyParser = require("body-parser");
const express = require("express");
const authorsRoutes = require("./authorsRoutes");
const notesRoutes = require("./notesRoutes");

// TODO: XSS, CSRF measures.

// === SETUP === //
const { port = 3000 } = process.env;
const app = express();

// === API DOCS === //
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDoc = YAML.load(__dirname + "/swagger.yaml");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// === MIDDLEWARE === //
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (err, req, res, next) {
  res.status(400).send("Error", err);
});

// === ROUTES === //
app.use("/api/", authorsRoutes);
app.use("/api/", notesRoutes);

// === START SERVER === //
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}...`);

  // function logAllRoutes() {
  //   // log all routes
  //   var route, routes = [];
  //   app._router.stack.forEach(function(middleware){
  //     if(middleware.route){ // routes registered directly on the app
  //       routes.push(middleware.route);
  //     } else if(middleware.name === 'router'){ // router middleware
  //       middleware.handle.stack.forEach(function(handler){
  //         route = handler.route;
  //         route && routes.push(route);
  //       });
  //     }
  //   });
  //   console.log(routes);
  // }
});

module.exports = { app, server };
