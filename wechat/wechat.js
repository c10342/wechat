/**
 * 获取access_token ：

    特点：
      1. 唯一的
      2. 有效期为2小时，提前5分钟请求
      3. 接口权限 每天2000次

    请求地址：
      https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
    请求方式：
      GET

    设计思路：
      1. 首次本地没有，发送请求获取access_token，保存下来（本地文件）
      2. 第二次或以后：
        - 先去本地读取文件，判断它是否过期
          - 过期了
            - 重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
          - 没有过期
            - 直接使用

     整理思路：
       读取本地文件（readAccessToken）
          - 本地有文件
            - 判断它是否过期(isValidAccessToken)
              - 过期了
                - 重新请求获取access_token(getAccessToken)，保存下来覆盖之前的文件（保证文件是唯一的）(saveAccessToken)
              - 没有过期
                - 直接使用
          - 本地没有文件
            - 发送请求获取access_token(getAccessToken)，保存下来（本地文件）(saveAccessToken)，直接使用
 */

const fs = require('fs')
const { get, post } = require('../util/http')
const { appID, appsecret } = require('../config')
const menu = require('./menu')
const path = require('path')
const request = require('request-promise')


class Wechat {
    constructor() { }

    /**
     *获取access_token
     *
     * @returns
     * @memberof Wechat
     */
    async getAccessToken() {
        try {
            const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
            const result = await get(url)
            result.expires_in = Date.now() + (result.expires_in - 300) * 1000
            return result
        } catch (error) {
            return error.toString()
        }
    }

    /**
     *保存access_token
     *
     * @param {*} accessToken
     * @returns
     * @memberof Wechat
     */
    saveAccessToken(accessToken) {
        return new Promise((resolve, reject) => {
            accessToken = JSON.stringify(accessToken)
            fs.writeFile(path.resolve(__dirname, './access_token.txt'), accessToken, err => {
                if (!err) {
                    console.log('access_token保存成功')
                    resolve()
                } else {
                    console.log('access_token保存失败')
                    console.log(err)
                    reject()
                }
            })
        })
    }

    /**
     *读取access_token
     *
     * @returns
     * @memberof Wechat
     */
    readAccessToken() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, './access_token.txt'), (err, data) => {
                if (err) {
                    console.log('access_token读取失败')
                    console.log(err)
                    reject(err)
                    return
                }
                console.log('access_token读取成功')
                resolve(JSON.parse(data))
            })
        })
    }

    /**
     *判断access_token是否过期
     *
     * @param {*} data
     * @returns
     * @memberof Wechat
     */
    isValidAccessToken(data) {
        if (!data && !data.access_token && !data.expires_in) {
            //  过期
            return false
        }

        return data.expires_in > Date.now()
    }

    /**
     *获取没有过期的access_token
     *
     * @returns
     * @memberof Wechat
     */
    async fetchAccessToken() {
        try {
            let result = await this.readAccessToken()
            const isValid = this.isValidAccessToken(result)
            if (!isValid) { //access_token过期
                result = await this.getAccessToken()
                await this.saveAccessToken(result)
            }
            return result.access_token
        } catch (error) {
            //  本地没有文件
            const result = await this.getAccessToken()
            await this.saveAccessToken(result)
            return result.access_token
        }
    }

    /**
     *创建自定义菜单
     *
     * @param {*} menu
     * @returns
     * @memberof Wechat
     */
    async createMenu(menu) {
        try {
            const token = await this.fetchAccessToken()
            const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token}`
            const result = await post(url, menu)
            return result
        } catch (error) {
            console.log(error)
        }
        return false
    }

    /**
     *删除自定义菜单
     *
     * @returns
     * @memberof Wechat
     */
    async deleteMenu() {
        try {
            const token = await this.fetchAccessToken()
            const url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${token}`
            const result = await get(url)
            return result
        } catch (error) {
            console.log(error)
        }
        return false
    }



    /**
     *获取jsapi_ticket
     *
     * @returns
     * @memberof Wechat
     */
    async getTicket() {
        try {
            const token = await this.fetchAccessToken()
            const url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
            const result = await get(url)
            return {
                ticket: result.ticket,
                expires_in: Date.now() + (result.expires_in - 300) * 1000
            }
        } catch (error) {
            return error.toString()
        }
    }

    /**
     *保存jsapi_ticket
     *
     * @param {*} ticket
     * @returns
     * @memberof Wechat
     */
    saveTicket(ticket) {
        return new Promise((resolve, reject) => {
            ticket = JSON.stringify(ticket)
            fs.writeFile(path.resolve(__dirname, './ticket.txt'), ticket, err => {
                if (!err) {
                    console.log('ticket保存成功')
                    resolve()
                } else {
                    console.log('aticket保存失败')
                    console.log(err)
                    reject()
                }
            })
        })
    }

    /**
     *读取jsapi_ticket
     *
     * @returns
     * @memberof Wechat
     */
    readTicket() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve(__dirname, './ticket.txt'), (err, data) => {
                if (err) {
                    console.log('ticket读取失败')
                    console.log(err)
                    reject(err)
                    return
                }
                console.log('ticket读取成功')
                resolve(JSON.parse(data))
            })
        })
    }

    /**
     *判断jsapi_ticket是否有效
     *
     * @param {*} data
     * @returns
     * @memberof Wechat
     */
    isValidTicket(data) {
        if (!data && !data.ticket && !data.expires_in) {
            //  过期
            return false
        }

        return data.expires_in > Date.now()
    }

    /**
     *获取没有过期的jsapi_ticket
     *
     * @returns
     * @memberof Wechat
     */
    async fetchTicket() {
        try {
            let result = await this.readTicket()
            const isValid = this.isValidTicket(result)
            if (!isValid) { //access_token过期
                result = await this.getTicket()
                await this.saveTicket(result)
            }
            return result.ticket
        } catch (error) {
            //  本地没有文件
            const result = await this.getTicket()
            await this.saveTicket(result)
            return result.ticket
        }
    }

    /**
     *上传临时素材
     *
     * @param {*} fileName
     * @param {*} type
     * @returns
     * @memberof Wechat
     */
    uploadTemporaryMaterial(fileName, type) {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.fetchAccessToken()
                const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`
                const filePath = path.resolve(__dirname, '../media', fileName)
                // media必须是一个可读流
                const form = {
                    access_token: token,
                    type,
                    media: fs.createReadStream(filePath)
                }
                //以form表单的方式发送请求
                const data = await request({ method: 'POST', url, json: true, formData: form })
                if (data.media_id) {
                    resolve(data.media_id)
                } else {
                    reject(data.errmsg)
                }
            } catch (error) {
                reject(error.toString())
            }
        })
    }

    /**
     *获取临时素材
     *
     * @param {*} type
     * @param {*} mediaId
     * @param {*} fileName
     * @returns
     * @memberof Wechat
     */
    getTemporaryMaterial(type, mediaId, fileName) {
        return new Promise(async (resolve, reject) => {
            try {
                const filePath = path.resolve(__dirname, '../downLoad', fileName)
                const token = await this.fetchAccessToken()
                let url = `https://api.weixin.qq.com/cgi-bin/media/get?access_token=${token}&media_id=${mediaId}`

                const params = {
                    access_token: token,
                    media_id: mediaId
                }
                // 视频文件使用http
                if (type == 'video') {
                    url.replace('https://', 'http://')

                    const data = await get(url, params)
                    if (data.video_url) {
                        resolve(data.video_url)
                    } else {
                        reject(data.errmsg)
                    }
                } else {
                    // request(url)
                    // .pipe(fs.createWriteStream(filePath))
                    // .once('close', resolve)   //当文件读取完毕时，可读流会自动关闭，一旦关闭触发close事件，从而调用resolve方法通知外部文件读取完毕了
                    const response = await get(url, params, {}, { responseType: "stream" })
                    // const response = await axios({
                    //     url,
                    //     method: "GET",
                    //     data:params,
                    //     responseType: "stream",
                    // });
                    const writer = fs.createWriteStream(filePath)
                    response.pipe(writer)

                    writer.once('finish', resolve).once('error', reject)
                }
            } catch (error) {
                reject(error.toString())
            }
        })
    }

    /**
     *上传永久素材
     *
     * @param {*} type
     * @param {*} material
     * @param {*} body
     * @returns
     * @memberof Wechat
     */
    uploadPermanentMaterial(type, material, body) {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.fetchAccessToken()
                let opts = {
                    method: 'POST',
                    json: true
                }
                if (type == 'news') {
                    // 上传图文消息素材
                    opts.url = `https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=${token}`
                    opts.body = material
                } else if (type == 'pic') {
                    // 上传图文消息中的图片
                    opts.url = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${token}`
                    opts.formData = {
                        access_token: token,
                        media: fs.createReadStream(path.join(__dirname, '../media', material))
                    }
                } else {
                    // 其他素材
                    opts.url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token}&type=${type}`
                    opts.formData = {
                        access_token: token,
                        media: fs.createReadStream(path.join(__dirname, '../media', material)),
                        type
                    }

                    // 视频素材需要多提交一个表单
                    if (type == 'video') {
                        opts.body = body
                    }
                }

                const result = await request(opts)
                resolve(result)
            } catch (error) {
                reject(error.toString())
            }
        })
    }

    /**
     *获取永久素材
     *
     * @param {*} type
     * @param {*} mediaId
     * @param {*} fileName
     * @returns
     * @memberof Wechat
     */
    getPermanentMaterial(type, mediaId, fileName) {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.fetchAccessToken()
                const url = `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${token}`
                let opts = {
                    url,
                    method: 'POST',
                    json: true,
                    body: {
                        "media_id": mediaId
                    }
                }
                if (type == 'news' || type == 'video') {  
                    // 图文素材和视频返回结果
                    const result = await request(opts)
                    resolve(result)
                } else {
                    // 其他的返回文件
                    request(opts).pipe(fs.createReadStream(path.join(__dirname, '../downLoad', fileName))).once('close', resolve)
                }
            } catch (error) {
                reject(error.toString())
            }
        })
    }
}



(async () => {
    const wechat = new Wechat()
    // 先删除自定义菜单，后创建自定义菜单
    // const delRes = await wechat.deleteMenu()

    // console.log(delRes)

    // if(delRes){
    //     const addRes = await wechat.createMenu(menu)
    //     console.log(addRes)
    // }

    // const ticket = await wechat.fetchTicket()
    // console.log(ticket)

    try {
        const result = await wechat.uploadPermanentMaterial('image','2.jpg')
        console.log(result)
        // const result = await wechat.uploadTemporaryMaterial('2.jpg', 'image')
        // console.log(result)

        // await wechat.getTemporaryMaterial('image', result, '5.jpg')
    } catch (error) {
        console.log(error)
    }
})()

module.exports = Wechat
