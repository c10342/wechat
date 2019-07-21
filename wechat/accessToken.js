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
const { get } = require('../util/http')
const { appID, appsecret } = require('../config')

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
            fs.writeFile('./access_token.txt', accessToken, err => {
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
            fs.readFile('./access_token.txt', (err, data) => {
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
}


async function test() {
    const wechat = new Wechat()
    const accessToken = await wechat.fetchAccessToken()
    console.log(accessToken)
}

test()