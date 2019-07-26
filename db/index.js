const mongoose = require('mongoose')

module.exports = ()=>{
    return new Promise((resolve,reject)=>{
        mongoose.connect('mongodb://localhost:27017/wechat',{useNewUrlParser:true})

        mongoose.connection.once('open',err=>{
            if(!err){
                console.log('数据库连接成功')
                resolve()
                return
            }
            console.log('数据库连接失败')
            reject()
        })
    })
}