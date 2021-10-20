const {src, dest} = require('gulp');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass')(require("sass"));
const autoprefixer = require('gulp-autoprefixer');
const group_media = require('gulp-group-css-media-queries');
const clean_css = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify-es').default;
const image = require('gulp-image');
const plumber = require("gulp-plumber");
const panini = require("panini");

const srcFolder = "src/";
const distFolder ="dist/";

const path = {
    build: {
        html: distFolder,
        css: distFolder + "assets/css/",
        js: distFolder + "assets/js/",
        img: distFolder + "assets/img/",
        fonts: distFolder + "assets/fonts/",
    },
    src: {
        html: srcFolder + "*.html",
        css: srcFolder + "assets/scss/*.scss",
        js: srcFolder + "assets/js/*.js",
        img: srcFolder + "assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcFolder + "assets/fonts/*.ttf",
    },
    watch: {
        html: srcFolder + "**/*.html",
        css: srcFolder + "assets/scss/**/*.scss",
        js: srcFolder + "assets/js/**/*.js",
        img: srcFolder + "assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcFolder + "assets/fonts/*.ttf",
    },
    clean: "./" + distFolder
}


function browserSync() {
    browsersync.init({
        server: {
            baseDir: "./" + distFolder
        }
    })
}

function html() {
    panini.refresh();
    return src(path.src.html)
        .pipe(plumber())
        .pipe(panini({
            root: srcFolder,
            layouts: srcFolder + 'layouts/',
            partials: srcFolder + 'partials/',
            helpers: srcFolder + 'helpers/',
            data: srcFolder + 'data/'
        }))
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded"
            }).on('error', scss.logError)
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                overrideBrowserlist: ["last 2 versions"],
                cascade: true
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(image({
            pngquant: true,
            optipng: false,
            zopflipng: true,
            jpegRecompress: false,
            mozjpeg: true,
            gifsicle: true,
            svgo: true,
            concurrent: 10
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream())
}

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.fonts], fonts);
}

function clean() {
    return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.default = watch;