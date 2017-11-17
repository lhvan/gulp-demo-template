const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const browserify = require('gulp-browserify');
const merge = require('merge-stream');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const injectPartials = require('gulp-inject-partials');
const minify = require('gulp-minify');
const rename = require('gulp-rename');
const cssmin = require('gulp-cssmin');
const htmlmin = require('gulp-htmlmin');


const SOURCEPATHS = {
  sassSource: 'src/scss/*.scss',
  htmlSource: 'src/*.html',
  htmlPartialSource: 'src/partial/*.html',
  jsSource: 'src/js/**',
  imgSource: 'src/img/**'
}
const APPPATH = {
  root: 'app/',
  css: 'app/css',
  js: 'app/js',
  fonts: 'app/fonts',
  img: 'app/img'
}

gulp.task('clean-html', () => {
  return gulp.src(APPPATH.root + '/*.html', { read: false, force: true})
            .pipe(clean());
});

gulp.task('sass', () => {
  const bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');

  const sassFile = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error',sass.logError));

  return merge(bootstrapCSS, sassFile)
        .pipe(concat('app.css'))
        .pipe(gulp.dest(APPPATH.css));
});

gulp.task('clean-scripts', () => {
  return gulp.src(APPPATH.js + '/*.js', { read: false, force: true})
            .pipe(clean());
});

gulp.task('images', () => {
  return gulp.src(SOURCEPATHS.imgSource)
            .pipe(newer(APPPATH.img))
            .pipe(imagemin())
            .pipe(gulp.dest(APPPATH.img));
});

gulp.task('scripts',['clean-scripts'], () => {
  gulp.src(SOURCEPATHS.jsSource)
      .pipe(concat('main.js'))
      .pipe(browserify())
      .pipe(gulp.dest(APPPATH.js));
});

/** Production task **/
gulp.task('compress', () => {
  gulp.src(SOURCEPATHS.jsSource)
      .pipe(concat('main.js'))
      .pipe(browserify())
      .pipe(minify())
      .pipe(gulp.dest(APPPATH.js));
});

gulp.task('compresscss', () => {
  const bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.css');

  const sassFile = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error',sass.logError));

  return merge(bootstrapCSS, sassFile)
        .pipe(concat('app.css'))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(APPPATH.css));
});

gulp.task('minfyHtml', () => {
  return gulp.src(SOURCEPATHS.htmlSource)
            .pipe(injectPartials())
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest(APPPATH.root));
});
/** End of Production task **/

gulp.task('moveFonts', () => {
  gulp.src('./node_modules/bootstrap/dist/fonts/*.{eot,svg,woff,woff2}')
      .pipe(gulp.dest(APPPATH.fonts));
});

// gulp.task('copy',['clean-html'], () => {
//   gulp.src(SOURCEPATHS.htmlSource)
//       .pipe(gulp.dest(APPPATH.root));
// });

gulp.task('html', () => {
  return gulp.src(SOURCEPATHS.htmlSource)
            .pipe(injectPartials())
            .pipe(gulp.dest(APPPATH.root));
});


gulp.task('serve', ['sass'], () => {
  browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
    server: {
      baseDir : APPPATH.root
    }
  })
});

gulp.task('watch', ['serve', 'sass', 'scripts', 'clean-html', 'clean-scripts', 'moveFonts', 'images', 'html'], () => {
  gulp.watch([SOURCEPATHS.sassSource], ['sass']);
  // gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
  gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
  gulp.watch([SOURCEPATHS.imgSource], ['images']);
  gulp.watch([SOURCEPATHS.htmlSource, SOURCEPATHS.htmlPartialSource], ['html']);
});

gulp.task('default',['watch']);
gulp.task('production', ['minfyHtml', 'compresscss', 'compress']);
