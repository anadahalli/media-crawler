// content-type formats to extract
var format_audio = "audio/*"
var format_video = "video/*"

var request = require("request");
var cheerio = require("cheerio");
var phantom = require("phantom");

function crawl(url, callback) {
  phantom.create().then(function(ph) {
    ph.createPage().then(function(page) {
      page.open(url).then(function(status) {
        // console.log(status);
        page.property("content").then(function(content) {
          // load DOM
          var $ = cheerio.load(content);
          // all the urls
          var urls = [];
          // extract all anchor urls
          $("a[href^='http']").each(function() {
            var url = $(this).attr("href");
            urls.push(url);
          });
          // extract all data-urls
          $("[data-url]").each(function() {
            var url = $(this).attr("data-url");
            urls.push(url);
          });
          page.close();
          ph.exit();
          return urls;
        });
      });
    });
  });
}

module.exports = crawl;
