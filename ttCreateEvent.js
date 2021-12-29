const puppeteer = require('puppeteer')

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  })
}
const randomTime = 200 + parseInt(100 * Math.random(), 10)

const url = 'https://ad.oceanengine.com/event_manager/?aadvid=1660109837990925'
const cookies = require('./ttCookie')

const clickButtonTextByXpath = async (text, page) => {
  const [button] = await page.$x(`//button[contains(., "${text}")]`)
  if (button) {
    await button.click()
  }
}

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const browserContext = await browser.createIncognitoBrowserContext()
  const page = await browserContext.newPage()
  await page.setViewport({ width: 1100, height: 1080 })
  await page.setCookie(...cookies)
  await page.goto(url, { waitUntil: 'networkidle2' })
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(btn => ['进入事件管理'].includes(btn.innerText))
    const checkBox = document.querySelector('.byted-checkbox-icon')
    if (button) {
      checkBox.click()
      button.click()
    }
  })
  console.log('---0---')
  await sleep(2000)
  await clickButtonTextByXpath('下一步', page)

  console.log('---1---')
  await sleep(2000)
  await clickButtonTextByXpath('下一步', page)

  console.log('---2---')
  await sleep(2000)
  await clickButtonTextByXpath('下一步', page)

  console.log('---3---')
  await sleep(2000)
  await clickButtonTextByXpath('开始探索', page)

  console.log('---4---')
  await sleep(2000)
  await clickButtonTextByXpath('添加资产', page)


  console.log('---5---')
  await sleep(2000)
  await page.evaluate(() => {
    const div = [...document.querySelectorAll('div')].find(element => element.innerText === '自研落地页')
    if (div) {
      div.click()
    }
  })

  console.log('---6---')
  await sleep(2000)
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(element => element.innerText === '下一步')
    if (button) {
      button.click()
    }
  })

  console.log('---7---')
  await sleep(2000)
  await page.type('input[placeholder="填写落地页站点名称"]', '技术部专用（勿动）', { delay: randomTime })
  await sleep(100000)
  // await page.close()
  // await browser.close()
}

bootstrap()