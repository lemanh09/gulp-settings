const gulp = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const less = require('gulp-less');
const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, 'bundle.json');
console.log(`Reading bundle configuration from: ${bundlePath}`);

let bundles;
try {
  const bundleContent = fs.readFileSync(bundlePath, 'utf8');
  bundles = JSON.parse(bundleContent);
} catch (error) {
  console.error('Error reading or parsing bundle.json:', error);
  process.exit(1);
}

function generateTaskName(outputPath) {
  return outputPath.replace(/[\/\\]/g, '-').replace(/\.min\./, '-min-');
}

bundles.scripts.forEach(bundle => {
  const taskName = generateTaskName(bundle.output);
  gulp.task(taskName, function() {
    return gulp.src(bundle.input, { allowEmpty: true })
      .pipe(concat(path.basename(bundle.output))) // Chỉ lấy tên tệp đầu ra
      .pipe(minify())
      .pipe(gulp.dest(path.join(__dirname, path.dirname(bundle.output)))); // Sử dụng dirname để lấy thư mục đích
  });
});

bundles.styles.forEach(bundle => {
  const taskName = generateTaskName(bundle.output);
  gulp.task(taskName, function() {
    return gulp.src(bundle.input, { allowEmpty: true })
      .pipe(less())
      .pipe(cleanCSS())
      .pipe(concat(path.basename(bundle.output))) // Chỉ lấy tên tệp đầu ra
      .pipe(gulp.dest(path.join(__dirname, path.dirname(bundle.output)))); // Sử dụng dirname để lấy thư mục đích
  });
});

gulp.task('default', gulp.parallel(
  ...bundles.scripts.map(bundle => generateTaskName(bundle.output)),
  ...bundles.styles.map(bundle => generateTaskName(bundle.output))
));
