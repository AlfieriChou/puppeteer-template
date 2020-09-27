const puppeteer = require('puppeteer')
const querystring = require('querystring')

const sleep = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const cookies = []

const pageUrl = "https://lad.hanjieyihao.com/202009199c65e53f76ad61ac36ab6cdca1aee750"
const convertId = 111828

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const browserContext = await browser.createIncognitoBrowserContext()
  const page = await browserContext.newPage()
  const adPage = await browserContext.newPage()
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36')
  await page.setJavaScriptEnabled(true)
  await page.setViewport({ width: 1100, height: 1080 })
  // await page.emulateTimezone('Asia/Shanghai')
  await page.setCookie(...cookies)
  await adPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36')
  await adPage.setJavaScriptEnabled(true)
  await adPage.setViewport({ width: 1100, height: 1080 })
  try {
    // page.on('console', msg => console.log(msg.text()))

    console.log('goto', `https://ad.e.kuaishou.com/tools/convert/detail/${convertId}?check=true&tab=page`)
    await page.goto(`https://ad.e.kuaishou.com/tools/convert/detail/${convertId}?check=true&tab=page`, {
      waitFor: () => {
        return document.body && document.body.innerText.includes('跟踪方式：JS布码')
      }
    })

    // const isActived = await page.evaluate(() => document.body && document.body.innerText.includes('已激活'))
    const isActived = await page.evaluate(() => document.body && document.body.innerText.includes('激活成功'))

    if (isActived) {
      console.log('isActived')
      return
    }

    await page.waitFor(() => {
      return document.body && document.body.innerText.includes('检测基础代码')
    }, { timeout: 6000 })
    await page.type('input[placeholder="请输入要检测的网址，强烈建议是HTTPS格式"]', pageUrl)
    await page.waitForSelector('.convert-detail .step-1 button')
    await page.click('.convert-detail .step-1 button')
    await page.waitFor(() => {
      return document.body && document.body.innerText.includes('知道了')
    }, { timeout: 20000 })
    await page.click('.ant-modal button')
    await page.bringToFront()
    await page.waitFor(() => {
      return document.body && document.body.innerText.includes('基础代码安装成功，请进行转化代码的检测')
    }, { timeout: 20000 })

    await sleep(2000)
    console.log('sleep 2s')
    const request = await page.waitForRequest(`https://ad.e.kuaishou.com/ads/js-convert-check/polling?kuaishou.ad.dsp_ph=${
      cookies.find(item => item.name === 'kuaishou.ad.dsp_ph').value
    }`, { timeout: 12000 })
    const { uniqueKey } = querystring.parse(request.postData())
    await adPage.goto(`${pageUrl}?uniqueKey=${uniqueKey}`, {
      waitFor: () => {
        // eslint-disable-next-line no-underscore-dangle
        return window._ks_trace
      }
    })
    await adPage.evaluate(cid => {
      // eslint-disable-next-line no-underscore-dangle
      window._ks_trace.push({ event: 'form', convertId: cid })
    }, convertId)
    await page.waitFor(() => {
      return document.body && document.body.innerText.includes('可成功上报转化')
    })
  } catch (err) {
    
  }
}

bootstrap()
