const express = require('express')

const app = express()

const auth = require('./wechat/auth')

const Wechat = require('./wechat/wechat')

const sha1 = require('sha1')

const { url } = require('./config')

const connect = require('./db/index')

const Theaters = require('./model/Theaters')

const Trailers = require('./model/Trailers')

// 连接数据可
connect()

app.set('views', './views')

app.set('view engine', 'ejs')

const wechat = new Wechat()

app.get('/search', async (req, res) => {
    /*
    生成js-sdk使用的签名：
      1. 组合参与签名的四个参数：jsapi_ticket（临时票据）、noncestr（随机字符串）、timestamp（时间戳）、url（当前服务器地址）
      2. 将其进行字典序排序，以'&'拼接在一起
      3. 进行sha1加密，最终生成signature
   */
    //   获取随机字符串
    const noncestr = Math.random().toString(32).split('.')[1]
    // 获取ticket
    const jsapi_ticket = await wechat.fetchTicket()
    // 获取时间戳
    const timestamp = Date.now()

    // 1. 组合参与签名的四个参数：jsapi_ticket（临时票据）、noncestr（随机字符串）、timestamp（时间戳）、url（当前服务器地址）
    let arr = [
        `noncestr=${noncestr}`,
        `jsapi_ticket=${jsapi_ticket}`,
        `timestamp=${timestamp}`,
        `url=${url}/search`
    ]

    // 2. 将其进行字典序排序，以'&'拼接在一起
    const str = arr.sort().join('&')

    // 3. 进行sha1加密，最终生成signature
    const signature = sha1(str)

    res.render('search',{
        noncestr,
        timestamp,
        signature
    })
})

app.get('/detail/:id',async function(req,res){
    try {
        const {id} = req.params
        const data = await Theaters.findOne({doubanId:id},{_id: 0, __v: 0, createTime: 0, doubanId: 0})
        // console.log(data.genre)
        res.render('detail',{data})
    } catch (error) {
        res.end(error.toString())
    }
})

app.get('/movie',async function(req,res){
    try {
        const data = await Trailers.find({},{_id: 0, __v: 0, cover: 0, link: 0, image: 0})
        res.render('movie',{data})
    } catch (error) {
        res.end(error.toString())
    }
})

// 验证服务器
app.use(auth())

const port = 9000
const host = '127.0.0.1'
app.listen(port, host, () => {
    console.log(`服务器地址 : ${host}:${port}`)
})