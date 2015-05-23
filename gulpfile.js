var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');

gulp.task('default', ['test']);
gulp.task("minify", function(){
    return gulp.src(["lwte.js"])
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./'));
});
gulp.task("test", ['minify'], function(){
    return gulp.src('test/test.js')
        .pipe(mocha({reporter: 'nyan'}));
});
