const puppeteer = require('puppeteer')
const url = `https://book.douban.com/latest?icn=index-latestbook-all`

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    devtools: true,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle2' })

  await page.evaluate(() => {
    const $ = window.$
    const $fictionItems = $('.article .cover-col-4 li')

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
          id: i + 1,
          doubanId,
          name: bookName,
          link: bookUrl,
          rating: bookRating || 0,
          attrs: bookAttrs,
          detail: bookIntro,
          type: 'fiction'
        })
      })
    }

    console.log('---->', books)
  })
}

bootstrap()
