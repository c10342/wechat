const xml2js = require('xml2js')

/**
 *获取用户发送的消息
 *
 * @param {*} req
 * @returns
 */
function getUserDataAsync(req){
    return new Promise((resolve,reject)=>{
        let xmlData = ''
        req.on('data',data=>{
            xmlData += data.toString()
        }).on('end',()=>{
            resolve(xmlData)
        })
    })
}

/**
 *解析xml
 *
 * @param {*} xmlData
 * @returns
 */
function parseXMLAsync(xmlData){
    return new Promise((resolve,reject)=>{
        xml2js.parseString(xmlData,{trim:true},(err,data)=>{
            if(err){
                reject(err.toString())
                return
            }else{
                resolve(data)
            }
        })
    })
}

function formatMessage(jsData){
    let message = {}

    jsData = jsData.xml

    if(typeof jsData == 'object'){
        for (const key in jsData) {
            if (jsData.hasOwnProperty(key)) {
                const element = jsData[key];
                // 过滤空数据
                if(Array.isArray(element) && element.length>0){
                    message[key] = element[0]
                }
            }
        }
    }

    return message
}
module.exports = {
    getUserDataAsync,
    parseXMLAsync,
    formatMessage
}