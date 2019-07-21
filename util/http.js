const axios = require('axios')

const get = (url,params={}) => {
    return new Promise((resolve,reject) => {
        axios.get(url,{params}).then(res=>{
            if(res.status == 200){
                resolve(res.data)
            }else{
                reject(res.data)
            }
        }).catch(err=>{
            reject(err.toString())
        })
    })
}

const post = (url,params={}) => {
    return new Promise((resolve,reject) => {
        axios.post(url,params).then(res=>{
            if(res.status == 200){
                resolve(res.data)
            }else{
                reject(res.data)
            }
        }).catch(err=>{
            reject(err.toString())
        })
    })
}

module.exports = {
    get,post
}