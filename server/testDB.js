const { Sequelize } = require('sequelize');
const { QueryTypes } = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'postgres', {
    host: '0.0.0.0',
    dialect: 'postgres'
});


async function testabc() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    let sql =
        "SELECT * FROM testt";
    // "type: Sequelize.QueryTypes.SELECT" is used to return value only once
    let res = (
        await sequelize.query(sql, {
            type: Sequelize.QueryTypes.SELECT,
        })
    )[0];
    console.log(res)
}

testabc();
