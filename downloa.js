/** Libs */
const fs = require("fs");
const path = require("path");
const { DownloaderHelper } = require("node-downloader-helper");
const colors = require("colors");

/** Intialization */
let options = {
  retry: { maxRetries: 100, delay: 5000 },
  override: true,
  forceResume: true,
  fileName: "",
  removeOnFail: true,
  progressThrottle: 500,
  headers: {
    Referer: "https://www.hitprn.com/",
  },
};
let failDownload = 0;
let fileList = "brazzextra.txt";

/** Download single url */
async function downloadThis(url) {
  console.log("This is\t" + decodeURI(path.basename(url)) + "\n");
  options.fileName = decodeURI(path.basename(url));
  const dl = new DownloaderHelper(url, path.join("./BZextra/"), options);
  dl.__isResumable = true;
  dl.on("progress.throttled", (messege) => {
    process.stdout.moveCursor(0, -2);
    process.stdout.write(
      "\nFile : \t" +
        decodeURI(messege.name).bgBlue +
        "\nProgress : \t" +
        messege.progress.toFixed(2).yellow +
        " %".yellow +
        "\tSpeed: " +
        (messege.speed * 0.00001).toFixed(2).bgRed +
        " Mbps/s".bgRed
    );

    process.stdout.clearScreenDown();
  })
    .on("download", (downloadInfo) =>
      console.log("Download Begins: ", {
        name: downloadInfo.fileName,
        total: (downloadInfo.totalSize * 0.000001).toFixed(2) + " Mb",
      })
    )
    .on("end", (downloadInfo) => {
      console.log(
        "\nDownload Completed: ",
        downloadInfo.fileName,
        "\n",
        (downloadInfo.onDiskSize * 0.000001).toFixed(2) + " Mb"
      );
    })
    .on("skip", (skipInfo) => {
      console.log(
        "Download skipped. File already exists, retrying: ",
        skipInfo
      );
    })
    .on("error", () => {
      console.log("Download failed, Attempting Retry");
    })
    .on("retry", (attempt, opts, err) => {
      console.log({
        RetryAttempt: `${attempt}/${opts.maxRetries}`,
        StartsOn: `${opts.delay / 1000} secs`,
        Reason: err ? err.message : "unknown",
      });
    });

  await dl
    .start()
    .then(() => {})
    .catch(() => {});
}

/** Download array */
const thread = async (array, arrayCopy) => {
  for (let i = 0; i < array.length - 1; i += 2) {
    await Promise.race([
      downloadThis(array[i])
        .then(() => {
          fs.writeFile(fileList, "", (err) => {});
          arrayCopy = arrayCopy.filter((word) => !word.includes(array[i]));
          arrayCopy.forEach((item) => {
            if (item) {
              fs.appendFile(fileList, item + "\n", (err) => {});
            }
          });
        })
        .catch((err) => {
          console.log("FAILED\t" + failDownload++);
        }),
      downloadThis(array[i + 1])
        .then(() => {
          fs.writeFile(fileList, "", (err) => {});
          arrayCopy = arrayCopy.filter((word) => !word.includes(array[i]));
          arrayCopy.forEach((item) => {
            if (item) {
              fs.appendFile(fileList, item + "\n", (err) => {});
            }
          });
          console.log(
            "List Remaining Size ".bgMagenta +
              arrayCopy.length.toFixed(0).bgMagenta +
              " Item".bgMagenta
          );
        })
        .catch((err) => {
          console.log("FAILED\t" + failDownload++);
        }),
    ])
      .then(() => {})
      .catch(() => {});
  }
};
/** return array givin path file in array */
const readAFileIntoArray = async (filename) => {
  let array = await fs.readFileSync(filename).toString().split("\n");
  return array;
};

/** Read file into array */
(async () => {
  let array = [];
  let arrayCopy = [];
  await readAFileIntoArray(fileList)
    .then((value) => {
      array = value;
      console.log("Reading Successfully".bgMagenta);
      var stats = fs.statSync(fileList);
      console.log(
        "File Size ".bgMagenta +
          (stats.size * 0.000977).toFixed(2).bgMagenta +
          " KB".bgMagenta
      );
      console.log(
        "List Size ".bgMagenta +
          array.length.toFixed(0).bgMagenta +
          " Item".bgMagenta
      );

      arrayCopy = array;
    })
    .catch(() => {
      console.log("File Not Found".bgRed);
    });

  await thread(array, arrayCopy);
})();
