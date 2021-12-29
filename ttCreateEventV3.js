const puppeteer = require('puppeteer')

const url = 'https://ad.oceanengine.com/event_manager/?aadvid=1660109838755853'
const cookies = require('./ttCookie')

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

  const assetRet = await page.evaluate(async () => {
    const russellToken = document.cookie.split('; ').find(item => item.startsWith('russell_token')).split('=')[1]
    const ret = await fetch('https://ad.oceanengine.com/event_manager/api/assets/create?aadvid=1660109838755853', {
      method: 'post',
      headers: { "x-russell-token": russellToken },
      body: JSON.stringify({
        assets_type: 3,
        landing_page: { name: "技术测试-1", description: "" }
      })
    })
    return Promise.resolve(ret.json())
  })

  console.log('-----', assetRet)
  if (assetRet.code !== 0) {
    throw new Error(JSON.stringify(assetRet))
  }

  const eventRet = await page.evaluate(async (assetId) => {
    const russellToken = document.cookie.split('; ').find(item => item.startsWith('russell_token')).split('=')[1]
    const ret = await fetch('https://ad.oceanengine.com/event_manager/api/event/config/create?aadvid=1660109838755853', {
      method: 'post',
      headers: { "x-russell-token": russellToken },
      body: JSON.stringify({
        "assets_id": assetId,
        "event_enum": 2,
        "event_name": "表单提交",
        "event_type": "form",
        "statistical_method_type": 2,
        "track_types": [7],
        "discrimination_value": {
          "value_type": 0,
          "dimension": 0,
          "groups": []
        }
      })
    })
    return Promise.resolve(ret.json())
  }, assetRet.assets_id)

  console.log('-----', eventRet)
  if (eventRet.code !== 0) {
    throw new Error(JSON.stringify(eventRet))
  }

  // await page.close()
  // await browser.close()
}

bootstrap()
