var gulp = require('gulp');
var shell = require('gulp-shell')

gulp.task('default', function() {
    shell.task([
        'echo "Starting gulp default task"',
        'node-debug server.js'
    ]);
    console.log('hi');
});
