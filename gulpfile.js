const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const sync = require("browser-sync").create();

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'source' /*build*/
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

// const watcher = () => {
//   gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
//   gulp.watch("source/*.html").on("change", sync.reload);
// }

// New

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(
    buildcss,
    gulp.parallel(stylesCopy, fonts),
  ));
  gulp.watch("source/img/**/*.*", gulp.series(
    gulp.parallel(images, createWebp, sprite)
  ));
  gulp.watch("source/js/**/*.js", gulp.series(
    gulp.parallel(scripts, minjs),
    buildmapjs
  ));
  gulp.watch("source/*.html", gulp.series(
    gulp.parallel(html, favicon)
  ));
  gulp.watch("build/**/*.*").on("change", sync.reload);
}

// Собираем Build

// HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(replace("css/style.css", "css/style.min.css"))
    .pipe(htmlmin({
    collapseWhitespace: true,
  }))
  .pipe(gulp.dest("build"))
}

// Icon

const favicon = () => {
  return gulp.src(["source/*.ico"])
    .pipe(gulp.dest("build"))
}

// Copy

const stylesCopy = () => {
  return gulp.src(["source/css/*.css", "source/css/*.css.map"])
    .pipe(gulp.dest("build/css"))
}

const fonts = () => {
  return gulp.src("source/fonts/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts"))
}

const scripts = () => {
  return gulp.src("source/js/*.js")
    .pipe(gulp.dest("build/js"))
}

// Sctipts

const minjs = () => {
  return gulp.src("source/js/*.js")
    .pipe(uglify())
    .pipe(rename((path) => {
      path.dirname += "";
      path.basename += ".min";
      path.extname = ".js";
    }))
    .pipe(gulp.dest("build/js"));
}

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(imagemin([
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"))
}

// WebP

const createWebp = () => {
  return gulp.src("source/img/**/*.webp")
    .pipe(gulp.dest("build/img"))
}

// Sprite

const sprite = () => {
  return gulp.src("source/img/*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/"))
}

// Bild styles

const buildcss = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(replace("../../img/", "../img/"))
    .pipe(replace("../../fonts/", "../fonts/"))
    .pipe(postcss([
      autoprefixer(),
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

const buildcssmin = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(replace("../../img/", "../img/"))
    .pipe(replace("../../fonts/", "../fonts/"))
    .pipe(postcss([
      autoprefixer(),
      csso
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(sync.stream());
}

const buildmapjs = () => {
  return gulp.src("build/js/*.js")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

const clean = () => {
  return del("build");
}

const cleancss = () => {
  return del("source/css/*.{css,map}");
}

const build = gulp.series(
  clean,
  cleancss,
  buildcss,
  buildcssmin,
  gulp.parallel(
    html,
    favicon,
    stylesCopy,
    fonts,
    scripts,
    // minjs,
    images,
    createWebp,
    sprite),
  buildmapjs
);

exports.build = build;

exports.default = gulp.series(
  styles, server, watcher
);
