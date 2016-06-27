'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify'); //用于压缩JS

var sass = require('gulp-sass'); //处理sass
var prefixer = require('gulp-autoprefixer'); //css兼容性前缀
var csso = require('gulp-csso'); //压缩css
var sourcemaps = require('gulp-sourcemaps');

var minifyHTML = require('gulp-minify-html'); //压缩html代码
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector'); //添加MD5后缀

var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

var watch = require('gulp-watch');
var browserSync = require("browser-sync");
var reload = browserSync.reload;

var runSequence = require('run-sequence');
var del = require('del');

var configPath = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/'
    },
    src: {
        html: 'src/**/**/*.html',
        js: 'src/js/**/**/*.js',
        style: 'src/scss/**/*.*',
        img: 'src/img/**/*.*'
    },
    watch: {
        html: 'src/**/**/*.html',
        js: 'src/js/**/**/*.js',
        style: 'src/scss/**/*.*',
        img: 'src/img/**/*.*'
    },
    release: {
        src: {
            html: 'build/**/**/*.html',
            js: 'build/js/**/**/*.js',
            style: 'build/css/**/*.css'
        },
        rev: 'rev/**/*.json',
        dst: {
            html: 'release/',
            js: 'release/js/',
            style: 'release/css/'
        }
    },
	notwatch: {
		html: '',
        js: '',  //!src/js/libs/*.js, !src/js/plugins/*.js
        style: '',
        img: ''
	}
};

/***************** webserver *****************/
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9999,
    logPrefix: "oujizeng"
};
gulp.task('webserver', function () {
    browserSync.init(config);
});

/**************** build start ******************/

gulp.task('html:build', function () {
    gulp.src(configPath.src.html) 
        /*.pipe(minifyHTML({
            empty:true,
            spare:true
        }))
		.on('error', function(err) {
            console.log(err);
        })
        */
        .pipe(gulp.dest(configPath.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    var uglify_config = {
        mangle: {except: ['$', 'define', 'require', 'module', 'exports']},
        compress: false
    };
    gulp.src([configPath.src.js])
        .pipe(sourcemaps.init()) 
        .pipe(uglify(uglify_config))
		.on('error', function(err) {
           console.log(err);
        })
        .pipe(sourcemaps.write('./')) 
        .pipe(gulp.dest(configPath.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(configPath.src.style) 
        .pipe(sourcemaps.init())
        .pipe(sass({
            includepaths: ['src/scss/'],
            outputStyle: 'compressed',
            //sourceMap: true,
            errLogToConsole: true
        }))
        // 一定要加error，防止直接gulp watch中段不往下执行
        .on('error', sass.logError)
        .pipe(prefixer())
        .pipe(csso())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(configPath.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(configPath.src.img) 
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
		.on('error', function(err) {
           console.log(err);
        })
        .pipe(gulp.dest(configPath.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'image:build'
]);

/**************** build end ******************/

gulp.task('watch', function(){
    watch([configPath.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([configPath.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([configPath.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([configPath.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
});


gulp.task('default', ['watch', 'build', 'webserver']);


/**************** release start ******************/

gulp.task('clean', function () {
    del(['rev', 'release']);
});

gulp.task('cssmd5', function () {
    return gulp.src(configPath.release.src.style)
        .pipe(rev())
        .pipe(gulp.dest(configPath.release.dst.style))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
});

gulp.task('jsmd5', function () {
    return gulp.src([configPath.release.src.js, '!build/js/libs/*.js'])
        .pipe(rev())
        .pipe(gulp.dest(configPath.release.dst.js))
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});

gulp.task('rev', function () {
    return gulp.src([configPath.release.rev, configPath.release.src.html])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(minifyHTML({
            empty:true,
            spare:true
        }))
        .pipe(gulp.dest(configPath.release.dst.html));
});

gulp.task('release', function(done) {
    runSequence(
        ['clean'],
        ['cssmd5', 'jsmd5'],
        ['rev'],
    done);
});

/**************** release end ******************/
