import { request } from './../core/requestExt';
import * as url from 'url';
import * as events from 'events';

let totalPage = 0;
let spiderPage = 3;
let ips =[];
let EventEmitter = new events();

function main() {

  
  let curPage = 1;
  EventEmitter.on('parseEnd', list => {
    console.log(list)
    if (spiderPage > curPage) {
      getHtml(curPage++);
    } else {
      EventEmitter.removeAllListeners('parseEnd');
    }
  });
  getHtml(curPage);
  // getHtml(1).then(ips => {
  //   if (spiderPage > 0) {
  //     let promiList = [];
  //     for (let i = 2; i<=spiderPage;i++) {
  //       let promise = getHtml(i);
  //       promiList.push(promise)
  //     }

  //     // Promise.all(promiList).then(res => console.log(res));
  //   } else {
  //     console.log(ips);
  //   }
  // });
}


function getHtml(curPage) {
  let url = getPageUrl(curPage);
  console.log('开始解析页面:' + curPage);
  console.log(url)
  request({
    url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3'
    }
  }).then(html => {
    console.log(1)
    if (!totalPage) {
      getPageSize(html);
      if (totalPage < spiderPage) {
        spiderPage = totalPage;
      }
    }
    
    let list = parseTable(html);
    console.log(111)
    EventEmitter.emit('parseEnd', list);
  }, err => console.log(err));
}

function getPageSize (html) {
  let ul = html.match(/<div id=\"listnav\"[^>]*>[\s\S]*?<\/div>/ig);
  let lis = ul[0].match(/<li[^>]*>[\s\S]*?<\/li>/ig);
  if (lis.length > 2) {
    totalPage = lis[lis.length-2].match(/[\d]+/)[0];
  } else {
    throw 'pageSize解析错误';
  }
}


function parseTable(html) {
  let proxyList = [];
  let tableStr = html.match(/<table[^>]*>[\s\S]*?<\/table>/ig);
  console.log(html)
  let rows = tableStr[0].match(/<tr[^>]*>[\s\S]*?<\/tr>/ig);
  rows.shift();
  for (let i =0;i<rows.length;i++) {
    let json = paserItem(rows[i]);
    proxyList.push(json);
  }

  return proxyList;
}

function paserItem(tr) {
  let tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/ig);
  let host = tds[0].match(/<td[^>]*>([\s\S]*?)<\/td>/)[1];
  let port = tds[1].match(/<td[^>]*>([\s\S]*?)<\/td>/)[1];
  let protocol = tds[3].match(/<td[^>]*>([\s\S]*?)<\/td>/)[1];
  return {
    host,
    port,
    protocol
  };
}

function getPageUrl(page) {
  return`https://www.kuaidaili.com/free/inha/${page}/`;
}

//运行
main();