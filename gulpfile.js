"use strict";

const { gulp, src, dest, watch, series } = require("gulp");

let sass = require("gulp-sass");
let clean = require("gulp-clean-css");
let sourcemaps = require("gulp-sourcemaps");
let rename = require("gulp-rename");
let babel = require("gulp-babel");
let concat = require("gulp-concat");
let terser = require("gulp-terser");
let concatCss = require("gulp-concat-css");
let smushit = require('gulp-smushit');
let svgo = require('gulp-svgo');


function buildSass(cb) {
  return src("static/src/scss/app.scss")
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest("static/dist/css/"))
    .pipe(clean({ compatibility: "ie8" }))
    .pipe(sourcemaps.write("/"))
    .pipe(dest("static/dist/css/"));
  cb();
}
function buildVendorSass(cb) {
  return src("static/plugins/css/*.css")
    .pipe(sourcemaps.init())
    .pipe(concatCss("vendor.css"))
    .pipe(rename({ extname: ".min.css" }))
    .pipe(dest("static/dist/css/"))
    .pipe(clean({ compatibility: "ie8" }))
    .pipe(sourcemaps.write("/"))
    .pipe(dest("static/dist/css/"));
  cb();
}
function buildScripts(cb) {
  return src("static/src/js/app.js")
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"]
      })
    )
    .pipe(concat("app.bundle.js"))
    .pipe(terser())
    .pipe(dest("static/dist/js/"))
    .pipe(sourcemaps.write("/"))
    .pipe(dest("static/dist/js/"));
  cb();
}
function buildVendorScripts(done) {
  return src(
    [
      "node_modules/jquery/dist/jquery.js",
      "node_modules/jquery-validation/dist/jquery.validate.js",
      "node_modules/gumshoejs/dist/gumshoe.polyfills.js",
      "node_modules/gsap/src/uncompressed/TweenMax.js",
      "node_modules/smooth-scroll/dist/smooth-scroll.polyfills.js",
      "node_modules/slick-carousel/slick/slick.js",
    ],
    {
      base: "node_modules/"
    }
  )
    .pipe(concat("vendor.bundle.js"))
    .pipe(terser())
    .pipe(dest("static/dist/"));
  done();
}
function themeScripts(done) {
  return src(
    [
      "static/plugins/js/bootstrap.min.js",
      "static/plugins/js/ct-paper.js",
      // "static/plugins/js/smartbanner.js/dist/smartbanner.js",
    ],
    {
      base: 'static/'
    }
  )
    .pipe(concat("theme.bundle.js"))
    .pipe(terser())
    .pipe(dest("static/dist/"));
  done();
}

// img compression tasks

function smush(done) {
  return src('static/src/images/*.{jpg,png}')
    .pipe(smushit())
    .pipe(dest('static/dist/images'));
  done();
}
function smushSvg(done) {
  return src('static/src/images/*')
    .pipe(svgo())
    .pipe(dest('static/dist/images'));
  done()
}


function build(cb) {
  watch(
    ["static/src/scss/**/*.scss", "static/src/js/custom.js"],
    series(buildSass, buildScripts)
  );
  cb();
}
function buildVendorFiles(cb) {
  series(buildVendorSass, buildVendorScripts);
  cb();
}
function smushAssets(cb) {
  series(smush, smushSvg);
  cb();
}
exports.build = build;
exports.buildVendorFiles = buildVendorFiles;
exports.smushAssets = smushAssets;


exports.buildScripts = buildScripts;
exports.buildVendorScripts = buildVendorScripts;
exports.buildSass = buildSass;
exports.buildVendorSass = buildVendorSass;
exports.smush = smush;
exports.smushSvg = smushSvg;