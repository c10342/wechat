module.exports = {
    "button": [
        {
            "type": "click",
            "name": "今日歌曲",
            "key": "click"
        },
        {
            "name": "菜单",
            "sub_button": [
                {
                    "type": "view",
                    "name": "搜索",
                    "url": "http://c10342.mynatapp.cc/search"
                }, {
                    "name": "发送位置",
                    "type": "location_select",
                    "key": "发送位置"
                }
            ]
        },
        {
            "name": "扫码",
            "sub_button": [
                {
                    "type": "scancode_waitmsg",
                    "name": "扫码带提示",
                    "key": "扫码带提示",
                },
                {
                    "type": "scancode_push",
                    "name": "扫码推事件",
                    "key": "扫码推事件",
                },
                {
                    "type": "pic_sysphoto",
                    "name": "系统拍照发图",
                    "key": "系统拍照发图"
                },
                {
                    "type": "pic_photo_or_album",
                    "name": "拍照或者相册发图",
                    "key": "拍照或者相册发图"
                },
                {
                    "type": "pic_weixin",
                    "name": "微信相册发图",
                    "key": "微信相册发图"
                }
            ]
        }
    ]
}