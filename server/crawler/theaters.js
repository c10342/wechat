const puppeteer = require('puppeteer');

const url = 'https://movie.douban.com/cinema/nowplaying/beijing/'

module.exports = async () => {
    // 打开浏览器
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // {waitUntil: 'networkidle2'} 网络空闲再打开
    await page.goto(url, { waitUntil: 'networkidle2' });

    const dimensions = await page.evaluate(() => {
        let result = []
        const $list = $('#nowplaying>.mod-bd>.lists>.list-item')

        for (let i = 0; i < $list.length; i++) {
            const liDom = $($list[i])
            //电影标题
            let title = $(liDom).data('title');
            //电影评分
            let rating = $(liDom).data('score');
            //电影片长
            let runtime = $(liDom).data('duration');
            //导演
            let directors = $(liDom).data('director');
            //主演
            let casts = $(liDom).data('actors');
            //豆瓣id
            let doubanId = $(liDom).data('subject');
            //电影的详情页网址
            let href = $(liDom).find('.poster>a').attr('href');
            //电影海报图
            let image = $(liDom).find('.poster>a>img').attr('src');

            result.push({
                title,
                rating,
                runtime,
                directors,
                casts,
                href,
                image,
                doubanId
              })
        }
        return result
    });

    console.log(dimensions)

    await browser.close();
}