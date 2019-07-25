const puppeteer = require('puppeteer')

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto('https://mp.weixin.qq.com/', { waitUntil: 'networkidle2' })
    const imgSrc = await page.evaluate(() => {
      const img = document.querySelector('.banner .qrcode_panel dt img')
      return img.src
    })
    console.log('---->', imgSrc)
    await page.close()
    await browser.close()
  } catch (err) {
    await page.close()
    await browser.close()
    throw err
  }
}

bootstrap()
