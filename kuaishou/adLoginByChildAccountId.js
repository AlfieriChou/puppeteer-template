const puppeteer = require('puppeteer')

const cookies = []

const getAccounts = page => {
  return new Promise(async (resolve, reject) => {
    await page.on('response', async res => {
      const url = res.url()
      if (url === 'https://uc.e.kuaishou.com/rest/web/getAccountList') {
        if (res.status() === 200 && res.ok()) {
          const ret = JSON.parse(await res.text())
          if (ret.result !== 1) {
            reject('Error')
          }
          resolve(ret.accountList.ucAccountInfos)
        }
      }
    })
  })
}

const getCookies = page => {
  return new Promise(async (resolve, reject) => {
    await page.on('response', async res => {
      const url = res.url()
      if (url === 'https://ad.e.kuaishou.com/rest/dsp/hitLine/account') {
        if (res.status() === 200 && res.ok()) {
          const data = await page._client.send('Network.getAllCookies')
          resolve(data)
        }
      }
    })
  })
}

const bootstrap = async () => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1280, height: 800 })
    await page.setCookie(...cookies)
    await page.goto(
      'https://uc.e.kuaishou.com/?sid=kuaishou.ad.dsp&followUrl=https%3A%2F%2Fad.e.kuaishou.com%2Findex#/index',
      // { waitUntil: 'networkidle2' }
    )
    const accounts = await getAccounts(page)
    let index = 0
    while (index < accounts.length) {
      const { accountId } = accounts[index]
      await page.goto(
        'https://uc.e.kuaishou.com/?sid=kuaishou.ad.dsp&followUrl=https%3A%2F%2Fad.e.kuaishou.com%2Findex#/index',
        { waitUntil: 'networkidle2' }
      )
      await page.type(
        '#app > div > div.body-wrap > div > div.search > span > span > input',
        `${accountId}`
      )
      await page.$$eval(
        '#app > div > div.body-wrap > div > div.search > span > span > span > button',
        async anchors => {
          await anchors.reduce(async (promise, anchor) => {
            await promise
            if (anchor.textContent == '搜 索') {
              await anchor.click()
            }
          }, Promise.resolve())
        }
      )
      await page.$$eval(
        '#app > div > div.body-wrap > div > div.uc-table > div > div > div > div > div > div > table > tbody > tr > td:nth-child(4) > a',
        async anchors => {
          await anchors.reduce(async (promise, anchor) => {
            await promise
            if (anchor.textContent == '进入') {
              await anchor.click()
            }
          }, Promise.resolve())
        }
      )
      const cookies = await getCookies(page)
      console.log(`----${index}--->`, JSON.stringify(cookies))
      index += 1
    }
    await page.close()
    await browser.close()
  } catch (err) {
    await page.close()
    await browser.close()
    throw err
  }
}

bootstrap()
