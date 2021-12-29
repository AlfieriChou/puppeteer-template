const puppeteer = require('puppeteer')

const sleep = async (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
const randomTime = 200 + parseInt(100 * Math.random(), 10)

const url = 'https://ad.oceanengine.com/event_manager/?aadvid=1660109838755853'
const cookies = require('./ttCookie')

const clickButtonTextByXpath = async (text, page) => {
  const [button] = await page.$x(`//button[contains(., "${text}")]`)
  if (button) {
    await button.click()
  }
}

const clickFloatComponent = async page => {
  await sleep(2000)
  await clickButtonTextByXpath('下一步', page)

  await sleep(2000)
  await clickButtonTextByXpath('下一步', page)

  await sleep(2000)
  await clickButtonTextByXpath('下一步', page)

  await sleep(2000)
  await clickButtonTextByXpath('开始探索', page)
}

const createAsset = async page => {
  await sleep(2000)
  await clickButtonTextByXpath('添加资产', page)

  await sleep(2000)
  await page.evaluate(() => {
    const div = [...document.querySelectorAll('div')].find(element => element.innerText === '自研落地页')
    if (div) {
      div.click()
    }
  })

  await sleep(2000)
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(element => element.innerText === '下一步')
    if (button) {
      button.click()
    }
  })

  await sleep(2000)
  await page.type('input[placeholder="填写落地页站点名称"]', '技术测试', { delay: randomTime })

  await sleep(2000)
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(element => element.innerText === '添加')
    if (button) {
      button.click()
    }
  })
}

const createEvent = async page => {
  await sleep(2000)
  await page.evaluate(() => {
    const span = [...document.querySelectorAll('span')].find(element => element.innerText === '表单提交')
    if (span) {
      span.click()
    }
  })

  await sleep(2000)
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(element => element.innerText === '下一步')
    if (button) {
      button.click()
    }
  })

  await sleep(2000)
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('b')].find(element => element.innerText === 'API回传')
    if (b) {
      b.click()
    }
  })

  await sleep(2000)
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(element => element.innerText === '添加')
    if (button) {
      button.click()
    }
  })
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

  await clickFloatComponent(page)

  await sleep(2000)
  const pInnerTextList = await page.evaluate(() => {
    return Promise.resolve([...document.querySelectorAll('p')].map(p => p.innerText))
  })

  if (pInnerTextList.includes('技术测试')) {
    await sleep(2000)
    await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find(element => element.innerText === '添加事件')
      if (button) {
        button.click()
      }
    })
    await createEvent(page)
    await page.close()
    await browser.close()
    return
  }

  await createAsset(page)

  await sleep(2000)
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(element => element.innerText === '立即添加事件')
    if (button) {
      button.click()
    }
  })

  await createEvent(page)

  await page.close()
  await browser.close()
}

bootstrap()
