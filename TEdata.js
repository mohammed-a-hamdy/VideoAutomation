const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://google.com');
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();

const scrape = async () =>{
    const browser = await puppeteer.launch({headless: false}); //browser initiate
    const page = await browser.newPage();  // opening a new blank page
    await page.goto('https://my.te.eg/user/login', {waitUntil : 'domcontentloaded'}) // navigate to url and wait until page loads completely

    await page.waitForXPath('//*[@id="login-service-number-et"]');
    await page.waitForXPath('//*[@id="login-password-et"]');

    const inputNum = await page.$x('//*[@id="login-service-number-et"]');
    const passNum = await page.$x('//*[@id="login-password-et"]');
    
    
  //  await inputNum[0].type('         ');
   await inputNum[0].evaluate(el => el.value = 'email');
    
  //  await passNum[0].type('');

    // Working input value
    await passNum[0].evaluate(el => el.value = 'pass');

    //const buttonSubmit = await page.$x('//*[@id="login-login-btn"]');
    await page.click('[id="login-login-btn"]');
    await page.click('[id="login-login-btn"]');
    
    await page.waitForXPath('//*[@id="pr_id_7"]/div/div/div/div/div/app-gauge/div[2]/span[1]');
    const resultNum = await page.$x('//*[@id="pr_id_7"]/div/div/div/div/div/app-gauge/div[2]/span[1]');
    let value = await resultNum[0].evaluate(el => el.innerText);
 
    console.log(value);
    browser.close();
    // maybe i can maybe i can't of Converting circular structure to JSON
    
};
scrape();
setInterval(function() {
    scrape();
}, 60 * 1000); 

