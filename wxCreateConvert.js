const puppeteer = require('puppeteer')
const { cookies, FEEDBACK_URL, wechatAccountId } = require('./config')

const logger = console
const randomTime = 200 + parseInt(100 * Math.random(), 10)
const defaultConvertName = '技术测试2'

const clickConfirmSpan = async page => {
  await page.evaluate(() => {
    const spanElement = [...document.querySelectorAll('button span')]
      .find(item => item.textContent === '确认')
    if (spanElement) {
      spanElement.click()
    }
  })
}

const createConvert = async (convertName, page) => {
  await page.evaluate(() => {
    const spanElement = [...document.querySelectorAll('.adui-button-content span')]
      .find(item => item.textContent === '绑定推广对象')
    if (spanElement) {
      spanElement.click()
    }
  })
  await page.waitForTimeout(1000)
  await page.type('input[placeholder="输入名称"]', convertName, { delay: randomTime })
  await page.type('input[placeholder="请输入Feedback URL"]', FEEDBACK_URL, { delay: randomTime })
  await page.waitForTimeout(1000)
  await clickConfirmSpan(page)
  await page.waitForTimeout(1000)
  await clickConfirmSpan(page)
}

const clickSwitch = async (convertName, page) => {
  await page.evaluate((spanName) => {
    const spans = $(`.adui-table-tables  div:contains(${spanName})`)
      .parent('.adui-table-tr')
      .find('.adui-switch-small')
    let index = 0
    while (index < spans.length) {
      spans[index].click()
      index += 1
    }
  }, convertName)
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
  try {
    await page.goto(`https://e.qq.com/agp/advertiser/jump_wechat?agency_uid=4011854&appid=${wechatAccountId}`)
    await page.waitForFunction(() => document.body && document.body.innerText.includes('工具箱'))
    await page.waitForTimeout(1000)
    const curUrl = await page.url()
    const token = new URL(curUrl).searchParams.get('token')
    logger.info('页面模拟服务.创建微信关注转化', wechatAccountId, token)
    await page.goto(`https://mp.weixin.qq.com/promotion/readtemplate?t=manager/toolbox&lang=zh_CN&token=${token}#`)
    await page.waitForFunction(() => document.body && document.body.innerText.includes('转化跟踪'))
    await page.waitForTimeout(1000)
    await page.goto(`https://mp.weixin.qq.com/promotion/frame?t=ad_system/common_frame&t1=manager/conversion_v3&token=${token}`)
    await page.waitForFunction(() => document.body && document.body.innerText.includes('如需获取点击数据，请绑定推广对象；如需接入转化跟踪能力，请根据指引回传转化数据'))
    await page.evaluate(() => {
      const convertDataDivElement = [...document.querySelectorAll('div')]
        .find(item => item.textContent === '获取转化数据')
      if (convertDataDivElement) {
        convertDataDivElement.click()
      }
    })
    const isCreateConvert = await page.evaluate((convertName) => {
      return document.body && document.body.innerText.includes(convertName)
    }, defaultConvertName)
    const ariaChecked = await page.evaluate((convertName) => {
      return $(`.adui-table-tables  div:contains(${convertName})`)
        .parent('.adui-table-tr')
        .find('.adui-switch-small')
        .attr('aria-checked')
    }, defaultConvertName)
    if (isCreateConvert && ariaChecked === 'false') {
      await clickSwitch(defaultConvertName, page)
      return
    }
    if (!isCreateConvert) {
      await createConvert(defaultConvertName, page)
    }
    await page.waitForTimeout(1000)
    await page.evaluate(() => {
      const spanElement = [...document.querySelectorAll('button span')]
        .find(item => item.textContent === '联调')
      if (spanElement) {
        spanElement.click()
      }
    })
    await page.waitForTimeout(1000)
    await clickConfirmSpan(page)
    await page.waitForTimeout(1000)
    await clickConfirmSpan(page)
    await page.waitForTimeout(2000)
    // 联调失败
    await page.evaluate(() => {
      const isFailed = document.body && document.body.innerText.includes('联调失败')
      if (!isFailed) {
        return
      }
      const spanElement = [
        ...document.querySelectorAll('button span')
      ].find(item => item.textContent === '确认')
      if (spanElement) {
        spanElement.click()
      }
    })
    await clickSwitch(defaultConvertName, page)
  } catch (err) {
    console.log('------', err)
  }
}

bootstrap()