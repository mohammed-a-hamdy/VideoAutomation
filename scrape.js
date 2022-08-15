const puppeteer = require("puppeteer");
const download = require("progress-download"); //require("download");
const fs = require("fs");
const path = require("path");

// DESIGN PATTERN FOR RE-TRY WITH PROMISES
function waitFor(millSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, millSeconds);
  });
}

async function retryPromiseWithDelay(promise, nthTry, delayTime) {
  try {
    const res = await promise;
    return res;
  } catch (e) {
    if (nthTry === 1) {
      return Promise.reject(e);
    }
    console.log("retrying", nthTry, "time");
    // wait for delayTime amount of time before calling this method again
    await waitFor(delayTime);
    return retryPromiseWithDelay(promise, nthTry - 1, delayTime);
  }
}
/////////////////////////////////////////////////////////////////////////////////////
const scrape = async (link, file) => {
    console.log('Scraping\t '+link);
  const browser = await puppeteer.launch({ headless: true, devtools: true });
  const page = await browser.newPage();
  await page.goto(link, {
    waitUntil: "load",
    // Remove the timeout
    timeout: 0,
  });

  await page.waitForXPath('//*[@id="content"]/div[3]/div');

  let linkBuffer = [];
  const list = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".clip-link"), (element) =>
      element.getAttribute("href")
    )
  );
  // console.log(list);

  // remove elemnts = 360 res - save to file or download ?
  for (let index = 0; index < list.length; index++) {
    await page.goto(list[index], {
      waitUntil: "load",
      // Remove the timeout
      timeout: 0,
    });

    const videos = await page.evaluate(() =>
      Array.from(document.querySelectorAll("source"), (element) =>
        element.getAttribute("src")
      )
    );

    for (let index2 = 0; index2 < videos.length; index2++) {
      if (!videos[index2]) {
      } else if (videos[index2].includes("_720.mp4") || videos.length === 1) {
        linkBuffer = [...linkBuffer, videos[index2]];
      }
    }

    console.log("Scraped from \t" + link + "\t :" + linkBuffer.length);
  }

  linkBuffer.forEach((item) => {
    if (item) {
      fs.appendFile(file, item + "\n", (err) => {
        //console.log("error:" + err);
      });
    }
  });
  let value = Object.keys(list).length;
  console.log(value);

  browser.close();
};

Promise.allSettled([
 
scrape(
  "confidintialWebsite",'confidintialWebsite.txt')])
  .then(()=>console.log(`All Scraping Finished`)).finally(()=>console.log('All process finished'))
