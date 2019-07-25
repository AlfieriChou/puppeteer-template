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
    await page.goto('https://a.weixin.qq.com/', { waitUntil: 'networkidle2' })
    const qrcode = await page.evaluate(() => {
      const qrcode = document.querySelector('.login_wrapper #login_container iframe')
      return qrcode.src
    })
    console.log('---->', qrcode)
    await page.screenshot({ path: './img/image' + Date.now() + '.jpg', type: 'jpeg', clip: { x: 870, y: 140, width: 200, height: 200 } })
    await page.close()
    await browser.close()
  } catch (err) {
    await page.close()
    await browser.close()
    throw err
  }
}

bootstrap()
