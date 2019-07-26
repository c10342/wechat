const upload = require('./upload')
const nanoid = require('nanoid')
const Theater = require('../../model/Theaters')
const connect = require('../../db')
connect()

const up = async () => {
    const data = await Theater.find(
        {
            $or: [
                { 'posterKey': '' },
                { 'posterKey': null },
                { 'posterKey': { $exists: false } }
            ]
        }
    )

    for (let i = 0; i < data.length; i++) {
        const movie = data[i];
        const url = movie.image
        const key = `${nanoid(10)}.jpg`
        await upload(url, key)

        movie.posterKey = key

        await movie.save()
    }
}

up()