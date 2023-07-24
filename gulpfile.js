const $ = require('gulp-load-plugins')({
    'pattern': '*',
    'postRequireTransforms': {
        sass: function(sass) {
            return sass(require('sass'));
        }
    },
    'scope': ['devDependencies'],
});

const isDev = process.argv[process.argv.length - 1] === 'dev';
const port = ($.yargs.argv.port) ? $.yargs.argv.port : 3000;
const proxy = ($.yargs.argv.proxy) ? $.yargs.argv.proxy : false;

let folderPath = (process.platform === 'darwin') ? __dirname.split('/') : __dirname.split('\\');
    folderPath = folderPath[folderPath.length-1].replace(/([A-Z:\\]*[_]+)/g, '');

    
$.gulp.task('browserSync', () => {
    const static = {
        baseDir: "./",
        serveStaticOptions: {
            extensions: ["html"]
        }
    }
    const dynamic = (typeof proxy === 'string' || proxy instanceof String) ? proxy : folderPath + '.test';
    const serverMode = proxy ? 'proxy' : 'server';
    
    return $.browserSync.init({
        [serverMode]: serverMode === 'proxy' ? dynamic : static,
        port: port,
        notify: false,
        open: false,
        logPrefix: "SimpleStarterPack",
    });
});


$.gulp.task('compileScss', () => {
    return $.gulp.src('src/scss/style.scss')
	.pipe($.plumber({
		errorHandler (err) {
			$.nodeNotifier.notify({
				title: `SCSS error in:`,
				message: `${err.file.replace(`${process.cwd()}/`, '')}:${err.line}:${err.column}`,
				sound: true,
            });
			this.emit('end');
		}
	}))
    .pipe($.if(isDev, $.sourcemaps.init()))
    .pipe($.sass({outputStyle: 'compressed'}))
    .pipe($.autoprefixer())
    .pipe($.if(isDev, $.sourcemaps.write()))
    .pipe($.gulp.dest('./dist/'))
    .pipe($.browserSync.stream({ match: '**/*.css' }))
});


$.gulp.task('compileTs', () => {
    return $.gulp.src('src/js/app.ts')
    .pipe($.plumber())
    .pipe($.webpackStream({
        mode: 'none',
        module: { rules: [{ test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/, }], },
        output: { filename: 'app.js', },
        resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'], },
    }, null, (err, stats) => {
        if (stats.compilation.errors.length >= 1) {
            const errorMessage = stats.compilation.errors[0].message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            const path = errorMessage.split('\n')[0].replace(/\[tsl\] ERROR in/, '').replace(`${process.cwd()}/`, '').replace('(', '').replace(',' ,':').replace(')', '');

            $.nodeNotifier.notify({
				title: `TS error in:`,
				message: `${path}`,
				sound: true
            });
        }
    }))
    .pipe($.uglify({
        mangle: true
    }))
    .pipe($.gulp.dest('./dist/'))
});


$.gulp.task('optimizeImages', () => {
    return $.gulp.src('src/images/**/*.{png,gif,jpg,webp,svg}')
    .pipe($.plumber())
    .pipe($.imagemin({
        verbose: true
    }))
    .pipe($.gulp.dest('./dist/images/'))
    .pipe($.browserSync.stream({match: '**/*.{png,gif,jpg,webp,svg}'}))
});


$.gulp.task('optimizeSVG', () => {
    return $.gulp.src('src/images/**/*.svg')
    .pipe($.plumber())
    .pipe($.svgmin())
    .pipe($.gulp.dest('./dist/images/'))
    .pipe($.browserSync.stream({match: '**/*.svg'}))
});


$.gulp.task(`cleanDistFolder`, function() {
    return $.del(`dist`, {force:true});
});


$.gulp.task('watch', $.gulp.parallel(['browserSync'], () => {
    $.gulp.watch(['**/*.php', '**/*.html'], {cwd:'./'}).on('change', $.browserSync.reload);
    $.gulp.watch('src/js/**/*.ts', {cwd: './'}, $.gulp.parallel(['compileTs'])).on('change', $.browserSync.reload);
    $.gulp.watch('src/scss/**/*.scss', {cwd: './'}, $.gulp.parallel(['compileScss']));
    $.gulp.watch('src/img/**/*.{png,gif,jpg,webp}', {cwd: './'}, $.gulp.parallel(['optimizeImages']));
    $.gulp.watch('src/img/**/*.svg', {cwd: './'}, $.gulp.parallel(['optimizeSVG']));
}));


$.gulp.task('dev', $.gulp.series('cleanDistFolder', 'compileScss', 'compileTs', $.gulp.parallel('optimizeImages', 'optimizeSVG'), 'watch'));
$.gulp.task('build', $.gulp.series('cleanDistFolder', 'compileScss', 'compileTs', $.gulp.parallel('optimizeImages', 'optimizeSVG')));


$.gulp.task('default', $.gulp.series(['build']));