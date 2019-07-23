// 封装回复给用户的内容

module.exports = (message) => {
    let options = {
        toUserName: message.FromUserName,
        fromUserName: message.ToUserName,
        createTime: Date.now(),
        msgType : 'text'
    }

    let content = '你在说什么，我听不懂'
    // 用户发送的消息为文本类型
    if (message.MsgType == 'text') {
        if (message.Content == '1') {  //全匹配
            content = '大吉大利,今晚吃鸡'
        } else if (message.Content == '2') {
            content = '落地成盒'
        } else if (message.Content.match('爱')) {   //半匹配
            content = '我爱你~~~'
        }
    }else if(message.MsgType == 'image'){  //图片类型
        options.msgType = 'image'
        options.mediaId = message.MediaId
    }else if(message.MsgType == 'voice'){  //语音类型
        options.msgType = 'voice'
        options.mediaId = message.MediaId
        console.log(`语音消息:${message.Recognition}`)
    }else if(message.MsgType == 'video'){  //视频类型
        options.msgType = 'video'
        options.mediaId = message.MediaId
        options.title = '视频消息'
        options.description = '视频描述'
    }else if(message.MsgType == 'location'){  //视频类型
        content = `维度:${message.Location_X},经度:${message.Location_Y},缩放大小:${message.Scale},位置信息:${message.Label}`
    }else if(message.MsgType == 'event'){
        if(message.Event == 'CLICK'){
            content = `用户点击了${message.EventKey}`
        }
        if(message.Event == 'subscribe'){ // 用户订阅公众号
            content = '欢迎关注公众号'
            if(message.EventKey){ // 没有关注：扫描带参数二维码事件
                content = '用户扫描了带参数的二维码'
            }
        }else if(message.Event == 'unsubscribe'){  //用户取消订阅
            console.log('用户取消关注')
        }
    }else if(message.MsgType == 'SCAN'){  // 已经关注：扫描带参数二维码事件
        content = '用户已经关注了公众号，并且扫描了带参数的二维码'
    }else if(message.MsgType == 'LOCATION'){ //上报地理位置事件
        content = `维度:${message.Latitude},经度:${message.Longitude},精度:${message.Precision}`
    }

    options.content = content

    return options
}
