const puppeteer = require("puppeteer");
const download = require("progress-download"); //require("download");
const fs = require("fs");
const path = require("path");
const { DownloaderHelper } = require('node-downloader-helper');


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
    console.log("\nretrying", nthTry, "time");
    // wait for delayTime amount of time before calling this method again
    await waitFor(delayTime);
   console.log(e);
    return retryPromiseWithDelay(promise, nthTry - 1, delayTime);
  }
} 

 
/////////////////////////////////////////////////////////////////////////////////////
const scrape = async (link, file) => {
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
      fs.appendFile(file, item + "\n", (err) => {});
    }
  });
  let value = Object.keys(list).length;
  console.log(value);

  browser.close();
};

let options = {
  retry: { maxRetries: 10, delay: 5000 },
  override: true,
  removeOnFail: true,
  progressThrottle: 1000,
  forceResume: true,
  headers: {
    Referer: "https://confidintialWebsite/",
  },
};
async function downloadThis(url) {
  console.log("Started\t" + decodeURI(path.basename(url)) + "\n");
  const d1 = new DownloaderHelper(
    url,
    path.join("./Sneaky/"),
    options
  );
  d1.__isResumable =  true;
  d1.on('progress.throttled',(messege) => console.log('File : \t'+decodeURI(messege.name)+
    '\nProgress : \t'+(messege.progress).toFixed(2)+' %'));
    
    
  await d1.start().then(() => {
    console.log("Download Completed: " + url);
  });
}

let failDownload = 0;
/* 

 */
const sneaky = async () => {
  array = fs.readFileSync("confidintialWebsite.txt").toString().split("\n");

  for (let i = 0; i < array.length - 1; i++) {
    await downloadThis(array[i]).catch(
      (err) => {
        console.log("FAILED\t" + failDownload++);
      }
    );
  }
};

Promise.all([sneaky()])
  .then(() => {
    console.log("All files finished");
  })
  .catch((err) => {
    console.log("error in promise all");
  });
