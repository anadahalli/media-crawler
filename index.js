#!/usr/bin/env node

"use strict";

// content-type formats to extract
var formats = ["video/mp4", "audio/mpeg", "audio/mp3"];

var request = require("request");
var cheerio = require("cheerio");
var phantom = require("phantom");

// check command line args for URL
var url = process.argv[2];
if (!url) {
  console.error("Usage: node index.js <URL>");
  process.exit(1);
}

console.log(url, "\n");

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
        // check content-type of URLs
        console.log("Audio/Video URLs...")
        urls.forEach(function(url, index, array) {
          request({url: url, method: "HEAD"}, function(error, response, body) {
            if (formats.indexOf(response.headers["content-type"]) >= 0) {
              console.log(url);
            }
          });
        });
        page.close();
        ph.exit();
      });
    });
  });
});
