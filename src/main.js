require("babel-polyfill");
const client  = require('cheerio-httpcli');
const request = require('request');
const fs = require('fs');
const axios = require('axios');

axios.post('https://getpocket.com/v3/get', {
  "consumer_key": process.env.POCKET_CONSUMER_KEY,
  "access_token": process.env.POCKET_ACCESS_TOKEN,
  "state": "unread",
  "count": "10",
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
      console.log('error occured');
      console.log(err);
      continue;
    }


    const pdf_link = result.$('a#share_pdf').attr('href');
    if (!pdf_link) continue;
    const pdf_title = result.$('title').text().split(' ')[0];
    console.log(`download ${pdf_title}`);
    request.get(pdf_link)
    .on('response', (res) => {
      console.log(res);
    })
    .pipe(fs.createWriteStream(`${process.env.HOME}/speakerdeck_pdf/${title}.pdf`));
  }

})
.catch((error) => {
  console.log(error);
});
