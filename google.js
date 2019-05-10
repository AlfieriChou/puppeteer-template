const puppeteer = require('puppeteer')
const path = require('path')
const screenshot = path.resolve(__dirname, './img/google_nyan_cat_pullover.png')

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  await page.goto('https://www.google.com')
  await page.type('input.gLFyf.gsfi', 'nyan cat pullover')
  await page.keyboard.press('Enter')
  await page.waitForNavigation({ waitUntil: 'load' })
  await page.screenshot({ path: screenshot })
  console.log('See screenshot: ' + screenshot)
  await page.close()
  await browser.close()
}

bootstrap()
