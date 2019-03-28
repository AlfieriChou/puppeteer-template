const puppeteer = require('puppeteer')
const url = `https://book.douban.com/latest?icn=index-latestbook-all`

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })

  await page.evaluate(() => {
    const $ = window.$
    const $fictionItems = $('.article .cover-col-4 li')
    const $anotherItems = $('.aside .cover-col-4 li')

    const books = []

    if ($fictionItems.length >= 1) {
      $fictionItems.each((i, item) => {
        let $book = $(item)
        let bookUrl = $book.find('.cover').attr('href')
        let bookName = $book.find('h2 a').text()
        let bookRating = Number($book.find('.rating .color-lightgray').text().trim())
        let bookAttrs = $book.find('.color-gray').text().trim()
        let bookIntro = $book.find('.detail').text().trim()
        let doubanId = bookUrl.split('/')[4]

        books.push({
          douban_id: doubanId,
          name: bookName,
          link: bookUrl,
          rating: bookRating || 0,
          attrs: bookAttrs,
          detail: bookIntro,
          type: 'fiction'
        })
      })
    }

    if ($anotherItems.length >= 1) {
      $anotherItems.each((i, item) => {
        let $book = $(item)
        let bookUrl = $book.find('.cover').attr('href')
        let bookName = $book.find('h2 a').text()
        let bookRating = Number($book.find('.rating .color-lightgray').text().trim())
        let bookAttrs = $book.find('.color-gray').text().trim()
        let bookIntro = $book.find('.detail-frame p:last').text().trim()
        let doubanId = bookUrl.split('/')[4]

        books.push({
          douban_id: doubanId,
          name: bookName,
          link: bookUrl,
          rating: bookRating || 0,
          attrs: bookAttrs,
          detail: bookIntro,
          type: 'nonfiction'
        })
      })
    }

    console.log('---->', books)
  })

  await page.close()
  await browser.close()
}

bootstrap()
