const { createHash,scryptSync, randomBytes,randomUUID } = require('crypto');

// function createPasswdHash(input) {
//     const salt = randomBytes(16).toString('hex');
//     const hashedPassword = scryptSync(input, salt, 64).toString('hex');
//     return [createHash('sha256').update(hashedPassword).digest('hex'), salt];
// }

// function verifyHash(passwd, salt) {
//     const hashedPassword = scryptSync(passwd, salt, 64).toString('hex');
//     return createHash('sha256').update(hashedPassword).digest('hex');
// }

// const passwd = "benson"
// console.log("your passwd is",passwd)
// let hashVal = createPasswdHash(passwd)
// console.log("your encryped passwd is",hashVal[0])
// console.log("your salt is ", hashVal[1])
// let verifyVal = verifyHash(passwd,hashVal[1])
// console.log("try to login with passwd \"benson\", salt:" + hashVal[1])
// if(verifyVal== hashVal[0]){
//     console.log("login success")
// }else{
//     console.log("failed")
// }


console.log(randomUUID());