"use strict";

const Express = require("express");

const app = Express();

app.use(Express.static("public"));

app.listen(3000);