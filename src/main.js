require("babel-polyfill");
const client  = require('cheerio-httpcli');
const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');
const axios = require('axios');
const program = require('commander');
const POCKET_GET_ENDPOINT = 'https://getpocket.com/v3/get';
const STATE_SET = new Set(['archive', 'unread', 'all']);
program
  .version('0.0.1')
  .option('-d, --download-dir <n>', 'pdf download directory')
  .option('-c, --download-count <n>', 'pdf download count')
  .option('-s, --entry-state <n>', 'pocket entry state')
  .parse(process.argv)

let pdf_dir = '/tmp';
let pdf_dl_cnt = '10';
let entry_state = 'unread';

if (program.downloadDir) {
  pdf_dir = program.downloadDir;
  if (!fs.existsSync(pdf_dir)) {
    mkdirp.sync(pdf_dir);
  } else if (!fs.statSync(pdf_dir).isDirectory()){
    console.error(`error : ${pdf_dir} is not directory`);
    process.exit(1);
  }
}

if (program.downloadCount) pdf_dl_cnt = program.downloadCount;

if (program.entryState) entry_state = program.entryState;
if (!STATE_SET.has(entry_state)) {
  console.error(`error: ${entry_state} is invalid state. please specify archive or unread or all.`);
  process.exit(1);
}


axios.post(POCKET_GET_ENDPOINT, {
  "consumer_key": process.env.POCKET_CONSUMER_KEY,
  "access_token": process.env.POCKET_ACCESS_TOKEN,
  "state": entry_state,
  "count": pdf_dl_cnt,
  "sort": "newest",
  "search": "speakerdeck"
})
.then(async (response) => {
  for (const elem of Object.keys(response.data.list)) {
    const speakerdeck_url = response.data.list[elem].given_url;
    console.log(`speakerdeck_url: ${speakerdeck_url}`)
    const url_ary = speakerdeck_url.split('/')
    const title = url_ary[url_ary.length - 1];
    let result = null;

    try {
      console.log('access start');
      result = await client.fetch(speakerdeck_url);
      console.log('access done');
    } catch (err) {
      console.error(`error occured at ${speakerdeck_url}`);
      console.error(err);
      console.log(`skip ${speakerdeck_url} due to error`);
      continue;
    }


    const pdf_link = result.$('a#share_pdf').attr('href');
    if (!pdf_link) continue;
    const pdf_title = result.$('title').text().split(' ')[0];
    console.log(`download ${pdf_title}`);
    request.get(pdf_link)
    .pipe(fs.createWriteStream(`${pdf_dir}/${title}.pdf`));
  }

})
.catch((error) => {
  console.error(error);
  process.exit(1);
});
