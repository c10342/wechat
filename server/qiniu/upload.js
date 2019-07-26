const qiniu = require('qiniu')

// https://portal.qiniu.com/user/key
const accessKey = 'YBEYWaqwXhGNpNIuEOsuSyLtQ0i0b34gobjSYsKL';
const secretKey = '3BCpdcLZZ3wXw-l5psmu-D8RHjnmmlJnciUTeVuK';

// 定义鉴权对象  https://developer.qiniu.com/kodo/sdk/1289/nodejs#5
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 定义配置对象  https://developer.qiniu.com/kodo/sdk/1289/nodejs#7
const config = new qiniu.conf.Config();
// 存储区域  https://developer.qiniu.com/kodo/manual/1671/region-endpoint
config.zone = qiniu.zone.Zone_z2;
// bucketManager对象上就有所有的方法  https://developer.qiniu.com/kodo/sdk/1289/nodejs#7
const bucketManager = new qiniu.rs.BucketManager(mac, config);

var bucket = "wechat";
module.exports = (resUrl, key) => {
    /*
    resUrl  网络资源的地址
    bucket  存储空间的名称 students
    key     重命名网络资源的名称
   */
    return new Promise((resolve, reject) => {
        bucketManager.fetch(resUrl, bucket, key, function (err, respBody, respInfo) {
            if (err) {
                console.log(err);
                reject()
            } else {
                if (respInfo.statusCode == 200) {
                    console.log('上传成功')
                    resolve()
                } else {
                    console.log('上传失败')
                    reject()
                }
            }
        });
    })
}