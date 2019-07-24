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
    await page.evaluate(() => {
      const img = document.querySelector('.banner .qrcode_panel dt img')
      return img.src
    })
    const cookies = await page.cookies()
    console.log('------>', cookies)
    const userField = await page.$('input[name=account]')
    await userField.click()
    await userField.type('xxxxxxx')
    await userField.dispose()
    const passwordField = await page.$('input[name=password]')
    await passwordField.click()
    await passwordField.type('xxxx')
    await passwordField.dispose()
    await page.keyboard.press('Enter')
    await page.waitForNavigation({ waitUntil: 'load' })
  } catch (err) {
    throw err
  }
  await page.close()
  await browser.close()
}

bootstrap()
