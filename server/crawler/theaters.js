const puppeteer = require('puppeteer');

const connect = require('../../db')

const saveTheaters = require('../save/saveTheaters')

const url = 'https://movie.douban.com/cinema/nowplaying/beijing/'

const th = async () => {
    // 打开浏览器
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // {waitUntil: 'networkidle2'} 网络空闲再打开
    await page.goto(url, { waitUntil: 'networkidle2' });

    await timeout();

    const dimensions = await page.evaluate(() => {
        let result = []
        const $list = $('#nowplaying>.mod-bd>.lists>.list-item')

        for (let i = 0; i < 8; i++) {
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
    for (let i = 0; i < dimensions.length; i++) {
        //获取条目信息
        let item = dimensions[i];
        //获取电影详情页面的网址
        let url = item.href;
        
        //跳转到电影详情页
        await page.goto(url, {
          waitUntil: 'networkidle2'  //等待网络空闲时，在跳转加载页面
        });
      
        //爬取其他数据
        let itemResult = await page.evaluate(() => {
          let genre = [];
          //类型
          const $genre = $('[property="v:genre"]');
      
          for (let j = 0; j < $genre.length; j++) {
            genre.push($genre[j].innerText);
          }
          
          //简介
          const summary = $('[property="v:summary"]').html().replace(/\s+/g, '');
          
          //上映日期
          const releaseDate = $('[property="v:initialReleaseDate"]')[0].innerText;
          
          //给单个对象添加两个属性
          return {
            genre,
            summary,
            releaseDate
          }
          
        })
      
        // console.log(itemResult);
        //在最后给当前对象添加三个属性
        //在evaluate函数中没办法读取到服务器中的变量
        item.genre = itemResult.genre;
        item.summary = itemResult.summary;
        item.releaseDate = itemResult.releaseDate;
        
      }

      // console.log(dimensions)
      

    await browser.close();

    await connect()

    await saveTheaters(dimensions)
}

function timeout() {
  return new Promise(resolve => setTimeout(resolve, 2000))
}
th()
