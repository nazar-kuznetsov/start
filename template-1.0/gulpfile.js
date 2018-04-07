var gulp = require('gulp'),
    browserSync = require('browser-sync'), // Авто обновление страницы
    //express = require('express'),
    //devip = require('dev-ip'),
    imagemin = require('gulp-imagemin'), //  Сжатия картинок
    watch = require('gulp-watch'),
    pngquant = require('imagemin-pngquant'), // Сжатия картинок png
    uglify = require('gulp-uglify'), // Сжатия JavaScript
    clean = require('gulp-clean'), // Очистка дериктории dist
    cssmin = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'), // Переминование папок
    sass = require('gulp-sass'),
    //webpack = require("webpack"),
    gcmq = require('gulp-group-css-media-queries'), //Комбинует медиа запроссы
    notify = require("gulp-notify"), // выводит ошибки при сборке
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    csscomb = require('gulp-csscomb'),
    //babel = require('gulp-babel'),
    //eslint = require('gulp-eslint'),
    cleanCSS = require('gulp-clean-css'),
    prefixer = require('gulp-autoprefixer'), // Префиксы для браузеров
    reload = browserSync.reload;

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        libs: 'build/libs',
        core: 'build/core',
        fonts: 'build/fonts/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/custom.js',
        style: 'src/style/main.scss',
        libs: 'src/libs/**/*.*',
        core: 'src/core/**/*.*',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        libs: 'src/libs/**/*.*',
        style: 'src/style/**/*.scss',
        core: 'src/core/**/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};



var config = {
    server: {
        baseDir: "./build"
    },
    //tunnel: true,
    host: 'localhost',
    port: 3000,
    open: false,
    logPrefix: "Developer"
};

gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({
            stream: true
        })); //И перезагрузим наш сервер для обновлений
});

gulp.task('core:build', function () {
    gulp.src(path.src.core) //Выберем файлы по нужному пути
        .pipe(gulp.dest(path.build.core)) //Выплюнем их в папку build
        .pipe(reload({
            stream: true
        })); //И перезагрузим наш сервер для обновлений
});


gulp.task('js:build', function () {
    gulp.src([
        'src/libs/jquery/jquery.min.js', //============================== Jquery
        'src/libs/slick/slick.min.js', //================================ slick-slider
        //'src/libs/table-sorter/jquery.tablesorter.min.js', //========== table-sorter
        //'src/libs/wow-js/wow.min.js', //=============================== wow-js
        //'src/libs/form-styler/jquery.formstyler.min.js', //============ form-styler
        //'src/libs/izotop-js/isotope.pkgd.min.js', //=================== izotop massonry
        path.src.js, // в конце
    ])
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(concat('script.min.js'))
        //.pipe(rigger()) //Прогоним через rigger
        //.pipe(babel({
        //  presets: ['es2015']
        // }))
        .on('error', notify.onError())
        //.pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
        .pipe(reload({
            stream: true
        })); //И перезагрузим сервер
});



gulp.task('style:build', function () {
   return gulp.src(path.src.style) //Выберем наш main.scss
        //.pipe(sourcemaps.init())
        .pipe(sass()) //Скомпилируем
        .on('error', notify.onError())
        .pipe(prefixer(['last 15 versions']))
        .pipe(gcmq()) // груп media
        .pipe(csscomb('.csscomb.json'))
        //.pipe(cssmin()) //Сожмем
        //.pipe(sourcemaps.write())
        //.pipe(cleanCSS()) сжать
        .pipe(rename('style.css'))
        .pipe(gulp.dest(path.build.css)) //И в build
        .pipe(reload({
            stream: true
        }));
});


gulp.task('img:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({
            stream: true
        }));
});


gulp.task('fonts:build', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


gulp.task('libs:build', function () {
    gulp.src(path.src.libs)
        .pipe(gulp.dest(path.build.libs));
});


gulp.task('build', [
    'html:build',
    'js:build',
    //'libs:build',
    'fonts:build',
    'core:build',
    'style:build',
    'img:build'
]);


gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        setTimeout(() => {
            gulp.start('style:build');
        }, 500);
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.libs], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('img:build');
    });
    watch([path.watch.core], function (event, cb) {
        gulp.start('core:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('clean', function () {
    return gulp.src(path.clean, {
        read: false
    })
        .pipe(clean());
});


gulp.task('default', ['build', 'webserver', 'watch']);



