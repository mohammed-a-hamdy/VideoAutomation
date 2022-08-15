const fs = require("fs");
const path = require("path");
const util = require("util");

let i = 1;
let fail = 0;
let successs = 0;
let folderOffiles = "C:/Users/Mohammed/NodeJs/Sneaky/"; // path to folder here

fs.readdir(folderOffiles, (err, files) => {
  files.forEach((file) => {
    try {
      let name = decodeURI(file);
      fs.rename(
        folderOffiles + file,

        folderOffiles + name + ".mp4",
        (err) => {
          if (err) throw err;
          successs++;
        }
      );
    } catch (e) {
      fail++;
    }
  });
  console.log("\nFailed :\t " + fail);
  console.log("\nSuccess :\t " + successs);
});
