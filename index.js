const express = require('express')

const app = express()

const auth = require('./wechat/auth')

// 验证服务器
app.use(auth())

const port = 9000
const host = '127.0.0.1'
app.listen(port, host, () => {
    console.log(`服务器地址 : ${host}:${port}`)
})