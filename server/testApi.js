require("dotenv").config();
const koa = require("koa");
// const mysql = require("koa-mysql");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const cors = require("@koa/cors");
const session = require("koa-session");
const { Sequelize } = require('sequelize');
const { QueryTypes } = require('sequelize');


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

//connect to mySQL server
const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
    host: 'cloudsql',
    dialect: 'postgres',
    port: '3306'
});
async function testSQLconnection(){
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
    .get("/api/test", async (ctx, next) => {
        ctx.status = 201;
    })
    .get("/api/helloword", async (ctx, next) => {
        ctx.status = 201;
        ctx.body = "hello world123"
    })
    .post("/api/login", async (ctx, next) => {
        const { account } = ctx.request.body;
        const { password } = ctx.request.body;
        let sql =
            "SELECT * FROM `userAccount` WHERE `account` = '" + `${account}` + "'";
        // "type: Sequelize.QueryTypes.SELECT" is used to return value only once
        let res = (
            await sequelize.query(sql, {
                type: Sequelize.QueryTypes.SELECT,
            })
        )[0];
        if (res.length == 0) {
            ctx.body = 0;
        } else {
            if (verifyHash(password, res["salt"]) == res["pwd"]) {
                let sql2 =
                    "insert into `loginLog` values('" + `${res["UID"]}` + `',to_timestamp(${Date.now()} / 1000.0)`;
                // "type: Sequelize.QueryTypes.SELECT" is used to return value only once
                let res2 = (
                    await sequelize.query(sql, {
                        type: Sequelize.QueryTypes.INSERT,
                    })
                )[0];
                ctx.body = 11;
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
        let hashVal = createPasswdHash(password)
        try {
            let sql = "insert into userAccount(account,passwd,salt) values('" + `${account}` + "','" + `${hashVal[0]}` + "','" + `${hashVal[1]}` + "');"
            console.log(sql)
            let res = (
                await sequelize.query(sql, {
                    type: Sequelize.QueryTypes.INSERT,
                })
            )[0];
            let sql2 =
                "SELECT UID FROM `userAccount` WHERE `account` = '" + `${account}` + "'";
            console.log(sql2)
            let res2 = (
                await sequelize.query(sql, {
                    type: Sequelize.QueryTypes.SELECT,
                })
            )[0];
            let sql3 = "insert into userInfo values('" + `${res2["UID"]}` + "','" + `${name}` + "','" + `${department}` + "',1);"
            console.log(sql3)
            let res3 = (
                await sequelize.query(sql, {
                    type: Sequelize.QueryTypes.INSERT,
                })
            )[0];
            ctx.body = 1
        } catch (e) {
            ctx.body = e
        }

    })
    .post("/api/testBody", async (ctx, next) => {
        const { account } = ctx.request.body;
        const { password } = ctx.request.body;
        const { name } = ctx.request.body;
        const { department } = ctx.request.body;
        ctx.body = `${account} ${password} ${name} ${department}`
    })


// HTTP port
var port = process.env.PORT || 3000;

// Listen for connections
app.listen(port);

// Log port
console.log("Server listening on port " + port);
