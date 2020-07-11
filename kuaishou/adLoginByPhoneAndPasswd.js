const puppeteer = require('puppeteer')

const bootstrap = async ({ phone, password }) => {
  const browser = await puppeteer.launch({
    timeout: 10000,
    devtools: true,
    args: ['--no-sandbox']
  })
  const page = await browser.newPage()
  try {
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto('https://ad.e.kuaishou.com/welcome?redirectUrl=https%3A%2F%2Fad.e.kuaishou.com%2Findex', { waitUntil: 'networkidle2' })
    await page.type(
      '#app > div.app > div > div > div.body > div.body-area1 > div > div.right > div > div > form > div.phone > input[type=text]:nth-child(1)',
      phone
    )
    await page.type(
      '#app > div.app > div > div > div.body > div.body-area1 > div > div.right > div > div > form > div.password > input[type=password]:nth-child(1)',
      password
    )
    await page.keyboard.press('Enter')
    await page.on('response', async res => {
      const url = res.url()
      if (url === 'https://uc.e.kuaishou.com/rest/web/getAccountList') {
        if (res.status() === 200 && res.ok()) {
          const data = await page._client.send('Network.getAllCookies')
          console.log('------->', data, await res.text())
          await page.close()
          await browser.close()
        }
      }
    })
  } catch (err) {
    await page.close()
    await browser.close()
    throw err
  }
}

bootstrap({
  phone: 'xxxxx',
  password: 'xxxxx'
})
