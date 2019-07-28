/** 
 * 封装回复用户消息模板
 * https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140543
*/

module.exports = options => {
    let replyMsg = `<xml>
                <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
                <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName><CreateTime>${options.createTime}</CreateTime>
                <MsgType><![CDATA[${options.msgType}]]></MsgType>`

    const msgType = options.msgType
    if (msgType == 'text') { //文本消息
        replyMsg += `<Content><![CDATA[${options.content}]]></Content>`
    } else if (msgType == 'image') {  //图片消息
        replyMsg += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`
    } else if (msgType == 'voice') {  //语音消息
        replyMsg += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`
    } else if (msgType == 'video') {  //视频消息
        replyMsg += `<Video><MediaId><![CDATA[${options.mediaId}]]></MediaId><Title><![CDATA[${options.title}]]></Title><Description><![CDATA[${options.description}]]></Description></Video>`
    } else if (msgType == 'music') {  //音乐消息
        replyMsg += `<Music><Title><![CDATA[${options.title}]]></Title><Description><![CDATA[${options.description}]]></Description><MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl><HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl><ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId></Music>`
    } else if (msgType == 'news') { //图文消息
        replyMsg += `<ArticleCount>${options.content.length}</ArticleCount><Articles>`

        options.content.forEach(item => {
            // console.log(item)
            replyMsg += `<item><Title><![CDATA[${item.title}]]></Title><Description><![CDATA[${item.description}]]></Description><PicUrl><![CDATA[${item.picUrl}]]></PicUrl><Url><![CDATA[${item.url}]]></Url></item>`
        })
        replyMsg += `</Articles>`
    }

    replyMsg += `</xml>`

    return replyMsg
}