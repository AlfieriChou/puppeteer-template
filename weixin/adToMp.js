const puppeteer = require('puppeteer')

const cookies = []
const wxAppId = ''

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const browserContext = await browser.createIncognitoBrowserContext()
  const page = await browserContext.newPage()
  try {
    await page.setViewport({ width: 1100, height: 1080 })
    await page.setCookie(...cookies)
    await page.goto(
      'https://a.weixin.qq.com/client',
      { waitUntil: 'networkidle2' }
    )
    await page.type('input[placeholder="输入广告主名称或原始id、appid、主体名称"]', wxAppId)
    await page.waitForTimeout(500)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(3000)
    await page.$$eval('a', async anchors => {
      await Promise.all(
        anchors.map(async anchor => {
          if (anchor.textContent == '广告投放') {
            await anchor.click()
          }
        })
      )
    })
    const accountCookies = await page.cookies()
    console.log('------>', accountCookies)
  } catch (err) {
    console.log('----->', err)
  } finally {
    await page.close()
    await browser.close()
  }
}

bootstrap()
