/* crawl.js
* Extract all the URLs with the supported_formats from a given URL
*/

// supported formats
var supported_formats = ['mp3', 'wav', 'wma', 'wmv', 'avi', 'flv', 'mpg', 'mpeg',
                         'mp4', 'm4a', 'm4v', 'mov', 'ogg', 'webm', 'aif', 'aiff',
                         'amr', '3gp', '3ga', 'mts', 'ogv', 'aac', 'mkv',
                         'mxf', 'opus']

var url = require("url");
var async = require("async");
var request = require("request");
var cheerio = require("cheerio");
var phantom = require("phantom");

var regexp = new RegExp('.' + supported_formats.join('|.') + '$');

function crawl(link, callback) {
  var siteURL = url.parse(link);
  siteURL = siteURL.protocol + '//' + siteURL.host;
  // console.log(siteURL);
  phantom.create().then(function(ph) {
    ph.createPage().then(function(page) {
      page.open(link).then(function(status) {
        page.property("content").then(function(content) {
          // load DOM
          var $ = cheerio.load(content);
          // all the urls
          var links = [];
          // extract all anchor urls
          $("a[href]").each(function() {
            links.push($(this).attr("href"));
          });
          // extract all data-urls
          $("[data-url]").each(function() {
            links.push($(this).attr("data-url"));
          });
          // all the media URLs, video/audio
          var urls = [];
          // check supported formats
          links.forEach(function(link) {
            var data = url.parse(link);
            if (!data.host) {
              link = siteURL + data.path;
            }
            // supported format
            if (regexp.test(link)) {
              // check content-type header to confirm media
              // request({url: link, method: "HEAD"}, function(error, response, body) {
              //   var contentType = response.headers["content-type"];
              //   if (contentType.startsWith("video/") || contentType.startsWith("audio/")) {
                  urls.push(link);
              //   }
              // });
            }
          });
          page.close();
          ph.exit();
          // console.log(urls);
          callback(urls);
        });
      });
    });
  });
}

module.exports = crawl;

// crawl('https://www.voxer.com/v/192e3ae04c');
