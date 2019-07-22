/**
 * 验证服务器有效性
 * 
 * 微信服务器会发送2种请求:get和post
 *  get:验证服务器的有效性
 *  post:把用户发送给微信服务器的消息以post请求的方式转发给开发者的服务器
 * 
 */

const config = require('../config')

const { getUserDataAsync, parseXMLAsync, formatMessage } = require('../util/tool')

const sha1 = require('sha1')

const template = require('./template')

const reply = require('./reply')

module.exports = () => {
    return async (req, res) => {
        try {
            const { signature, echostr, timestamp, nonce } = req.query
            const { Token } = config
            // 1）将token、timestamp、nonce三个参数进行字典序排序
            const arrSort = [Token, timestamp, nonce].sort()
            // 2）将三个参数字符串拼接成一个字符串进行sha1加密
            const sortStr = arrSort.join('')
            const sha1Str = sha1(sortStr)

            // 验证服务器
            if (req.method === 'GET') {
                /** 
                 * {
                        signature: '0f8b94c319cde934f5d2f8fb17fa70dd6896fb2c',
                        echostr: '7612754320827538935',
                        timestamp: '1563712903',
                        nonce: '1450805367'
                    }
                */
                // console.log(req.query)
                // 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
                if (sha1Str === signature) {
                    // 原样返回echostr参数内容，则接入生效
                    res.send(echostr)
                } else {
                    res.end('error')
                }
            } else if (req.method === 'POST') {  //微信服务器转发消息
                // 说明消息不是来自于微信服务器
                if (sha1Str !== signature) {
                    res.end('error')
                    return
                }
                /** 
                 * {
                        signature: 'e0eb1c180002fa16770a23e0fafad11395bd665f',
                        timestamp: '1563720246',
                        nonce: '1225445571',
                        openid: 'ocFoo1ugyRQukaH_t9BxegHee2h0'
                    }
                */
                // console.log(req.query)

                // 接收请求体中的数据,流数据,不能使用body-parse解析
                const xmlData = await getUserDataAsync(req)
                /** 
                 *  < xml > 
                        <ToUserName><![CDATA[gh_206fde1d11b2]]></ToUserName>  //发送给谁id,即开发者id
                        <FromUserName><![CDATA[ocFoo1ugyRQukaH_t9BxegHee2h0]]></FromUserName> //谁发送的id,即发送者id
                        <CreateTime>1563721228</CreateTime>  //时间戳
                        <MsgType><![CDATA[text]]></MsgType> //消息类型
                        <Content><![CDATA[123]]></Content>  //消息内容
                        <MsgId>22387105812318015</MsgId>  //消息id,微信服务器会默认保存3天
                    </xml >
                */
                // console.log(xmlData)

                // 解析xml
                const jsData = await parseXMLAsync(xmlData)
                /** 
                 * { xml:
                    {   ToUserName: [ 'gh_206fde1d11b2' ],
                        FromUserName: [ 'ocFoo1ugyRQukaH_t9BxegHee2h0' ],
                        CreateTime: [ '1563722006' ],
                        MsgType: [ 'text' ],
                        Content: [ '4345' ],
                        MsgId: [ '22387116564782928' ] 
                    } 
                   }
                */
                // console.log(jsData)
                // 格式化数据
                const formatData = formatMessage(jsData)
                /** 
                 * { ToUserName: 'gh_206fde1d11b2',
                    FromUserName: 'ocFoo1ugyRQukaH_t9BxegHee2h0',
                    CreateTime: '1563722506',
                    MsgType: 'text',
                    Content: '你好',
                    MsgId: '22387123354887138' 
                }
                */
                // console.log(formatData)

                //简单的自动回复，回复文本内容
                /*
                一旦遇到以下情况，微信都会在公众号会话中，向用户下发系统提示“该公众号暂时无法提供服务，请稍后再试”：
                    1、开发者在5秒内未回复任何内容
                    2、开发者回复了异常数据，比如JSON数据、字符串、xml数据中有多余的空格*****等
                 */

                let opt = reply(formatData)
                res.send(template(opt))
            } else {
                res.end('error')
            }
        } catch (error) {
            console.log('error', error.toString())
            res.end(error.toString())
        }
    }
}