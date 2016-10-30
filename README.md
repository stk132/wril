# wril

wril(won't read it later)

search speakerdeck slide url from your pocket(read it later service) account.
and download slide as pdf.

## install

``` shell
npm install
```

set your pocket consumer_key, access_token to environment variable like below.

```
export POCKET_CONSUMER_KEY=xxxx
export POCKET_ACCESS_TOKEN=xxxx
```

## usage

```
Usage: main [options]

Options:

  -h, --help                output usage information
  -V, --version             output the version number
  -d, --download-dir <n>    pdf download directory
  -c, --download-count <n>  pdf download count
  -s, --entry-state <n>     pocket entry state
```

## example

download 10 「unread」 slide pdf to "/tmp/pdf_dl" directory

``` shell
node dist/main.js -d /tmp/pdf_dl -c 10 -s unread
```
