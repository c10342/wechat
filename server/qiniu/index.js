const upload = require('./upload')
const nanoid = require('nanoid')
const Theater = require('../../model/Theaters')
const Trailers = require('../../model/Trailers')
const connect = require('../../db')
connect()

const up = async (key,Modal) => {
    const data = await Modal.find(
        {
            $or: [
                { [key]: '' },
                { [key]: null },
                { [key]: { $exists: false } }
            ]
        }
    )

    for (let i = 0; i < data.length; i++) {
        const movie = data[i];
        let url = movie.image
        let fileName = '.jpg'
        if(key == 'coverKey'){
            url = movie.cover
        }else if(key == 'videoKey'){
            url = movie.link
            fileName = '.mp4'
        }
        
        const name = `${nanoid(10)}${fileName}`


        await upload(url, name)

        movie[key] = name

        await movie.save()
    }
}

up('coverKey',Trailers)
up('videoKey',Trailers)
up('posterKey',Trailers)