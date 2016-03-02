/*
* @Author: baby
* @Date:   2016-03-02 08:41:53
* @Last Modified by:   baby
* @Last Modified time: 2016-03-02 08:41:53
*/

'use strict';

var gulp = require('gulp'); // 引入gulp

// 引入组件
var jshint = require('gulp-jshint'); // 检查js
var sass = require('gulp-sass'); // 编译sass
var coffee = require('gulp-coffee'); // 编译coffeescript
var concat = require('gulp-concat'); // 合并
var uglify = require('gulp-uglify'); // 压缩js
var imagemin = require('gulp-imagemin'); // 压缩图片
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename'); // 重命名
var del = require('del'); // 删除
var htmlmin = require('gulp-htmlmin'); // 压缩html
var plumber	 = require('gulp-plumber'); // 中端执行
var minifyCss = require('gulp-minify-css'); // 压缩css为一行
var rev = require('gulp-rev');	// 对文件名加MD5后缀
var revCollector = require('gulp-rev-collector'); // 路径替换
var gulpSequence = require('gulp-sequence');	// 顺序执行



var paths = {
  // scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
  js: ['src/js/*.js'],
  css: ['src/css/*.css'],
  sass: ['src/sass/*.scss'],
  images: ['src/images/**/*'],
  html: ['src/html/**/*']
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['dist']);
});

// 检查js脚本的任务
gulp.task('lint',function() {
	return gulp.src(paths.js)
	// .pipe(plumber())
	.pipe(jshint())
	.pipe(jshint.reporter('default'));
});

// 编译sass
gulp.task('sass', function() {
	var options = {
		outputStyle:"compact"
	};
	return gulp.src(paths.sass)
	// .pipe(plumber())
	.pipe(sass(options))
	.pipe(gulp.dest('src/css'));
});

// 合并压缩css
gulp.task('css', function() {
	return gulp.src(paths.css)
	.pipe(concat('all.min.css'))	// 压缩后的css文件名
	.pipe(minifyCss())				// 压缩处理成一行
	.pipe(rev())					// 文件名加MD5后缀
	.pipe(gulp.dest('dist/css'))	// 输出文件本地
	.pipe(rev.manifest())			// 生成一个rev-manifest.json
	.pipe(gulp.dest('dist/rev/css'));	// 将 rev-manifest.json 保存到 dist/rev 目录内
});

// 替换md5文件名
gulp.task('rev', function() {
  var options = {
    replaceReved: true,
    dirReplacements: {
        'css': 'dist/css',
        'js': 'dist/js',
    }
  };
	return gulp.src(['dist/rev/**/*.json','dist/old_html/**/index.html']) // 读取 rev-manifest.json 文件以及需要进行css名替换的文件
	.pipe(revCollector())								// 替换后的文件输出的目录
  .pipe(gulp.dest('dist/html/'));
});

// 合并，压缩js文件
gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.js)
  // .pipe(plumber())
  .pipe(sourcemaps.init())
      // .pipe(coffee())
      .pipe(uglify())
      // .pipe(rename('all.min.js'))
      .pipe(concat('all.min.js'))	// 压缩后的js文件名
      .pipe(rev())					// 文件名加MD5后缀
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist/js'))
      .pipe(rev.manifest())     // 生成一个rev-manifest.json
      .pipe(gulp.dest('dist/rev/js')); // 将 rev-manifest.json 保存到 dist/rev 目录内
  });

// 压缩图片
gulp.task('images', function() {
	return gulp.src(paths.images)
	// .pipe(plumber())
    // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('dist/images'));
});

// 压缩html
gulp.task('html', function () {
	var options = {
            removeComments: true,//清除HTML注释
            collapseWhitespace: true,//压缩HTML
            collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
            removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
            minifyJS: true,//压缩页面JS
            minifyCSS: true//压缩页面CSS
        };
        return gulp.src(paths.html)
        // .pipe(plumber())
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist/old_html'));
    });

// 当文件发生变化后会自动执行任务
gulp.task('watch', function() {
	gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.js, ['css']);
	gulp.watch(paths.images, ['images']);
});

// 定义默认任务,执行gulp会自动执行的任务
// gulp.task('default',
// 	[
// 	// 'watch',
// 	'lint',
// 	'scripts',
// 	'sass',
// 	'css',
// 	'images',
// 	'html',
// 	'rev'
// 	]);

gulp.task('default',gulpSequence('watch','lint','clean',['scripts','sass','images','html'],'css','rev'));


