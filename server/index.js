require("dotenv").config();
const koa = require("koa");
// const mysql = require("koa-mysql");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const cors = require("@koa/cors");
const session = require("koa-session");
const { Sequelize, QueryTypes } = require('sequelize');
const { createHash, scryptSync, randomBytes, randomUUID } = require('crypto');

// Create sample app
var app = new koa();

// fulfill CORS, set credentials "true" to allow set cookie (also must fulfill before router created)
app.use(cors({ credentials: true }));

//setting session
//keys are used to encrypt cookie
app.keys = ["benson handsome as fuxk"];
app.use(session(app));

//to parsing POST body(must used before router)
app.use(koaBody());

//create router instance
var router = new Router();
app.use(router.routes());

//connect to postgres server
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
  host: 'cloudsql',
  dialect: 'postgres',
  port: '3306',
  omitNull: false
});

async function testSQLconnection() {
  try {
    await sequelize.authenticate();
    console.log("connect successful")
  } catch (error) {
    console.log(error);
  }
}
testSQLconnection();

function createPasswdHash(input) {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(input, salt, 64).toString('hex');
  return [createHash('sha256').update(hashedPassword).digest('hex'), salt];
}

function verifyHash(passwd, salt) {
  const hashedPassword = scryptSync(passwd, salt, 64).toString('hex');
  return createHash('sha256').update(hashedPassword).digest('hex');
}

//router instance
router
  .get("/api/helloWorld", async (ctx, next) => {
    ctx.status = 201;
    ctx.body = "hello world"
  })
  .post("/api/login", async (ctx, next) => {
    const { account } = ctx.request.body;
    const { password } = ctx.request.body;
    // query back the encrypted password & salt
    let sql = `select * from "userAccount" where account='${account}'`;
    let res = (
      await sequelize.query(sql, {
        type: Sequelize.QueryTypes.SELECT,
      })
    )[0];
    if (!res) {
      ctx.body = 0;
    } else {
      // verify whether the password are the same  by comparing password + salt to encrypted password
      if (verifyHash(password, res["salt"]) == res["passwd"]) {
        let sql2 = `insert into "loginLog" values('${res["UID"]}',to_timestamp(${Date.now()} / 1000.0));`
        await sequelize.query(sql2, {
          type: Sequelize.QueryTypes.INSERT,
        });
        ctx.body = 11;
        ctx.session.id = res["UID"];
        // wait the session unit to complete setting
        await next();
      } else {
        ctx.body = 10
      }
    }
  })
  .post("/api/signUp", async (ctx, next) => {
    const { account } = ctx.request.body;
    const { password } = ctx.request.body;
    const { name } = ctx.request.body;
    const { department } = ctx.request.body;
    const uuid = randomUUID();
    let hashVal = createPasswdHash(password)
    try {
      let sql =
        `insert into "userAccount" values('${uuid}','${account}','${hashVal[0]}','${hashVal[1]}');
      insert into "userInfo" values('${uuid}','${name}','${department}',1);`
      await sequelize.query(sql, {
        type: Sequelize.QueryTypes.INSERT,
      })
      ctx.body = 1
    } catch (e) {
      ctx.body = e
    }
  })
  .get("/api/getInfo", async (ctx, next) => {
    let uuid = ctx.session.id;
    if (uuid) {

      let sql = `select * from "userInfo" where "UID"='${uuid}';`;
      let res = (
        await sequelize.query(sql, {
          type: Sequelize.QueryTypes.SELECT,
        })
      )[0];
      ctx.body = {
        "uid": res["UID"],
        "name": res["name"],
        "department": res["department"],
        "authLvl": res["authLvl"]
      }
    } else {
      ctx.body = 0;
    }
  })
  .get("/api/logout", async (ctx, next) => {
    ctx.session.id = null;
    if (ctx.session.id) {
      ctx.body = 0;
    } else {
      ctx.body = 1;
    }
  })


// HTTP port
var port = process.env.PORT || 3000;

// Listen for connections
app.listen(port);

// Log port
console.log("Server listening on port " + port);
