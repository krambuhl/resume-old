const fs = require('fs');
const path = require('path');

const handlebars = require('handlebars');
const wax = require('handlebars-wax');
const minify = require('html-minifier').minify;

const postcss = require('postcss');
const cssnext = require('postcss-cssnext');
const nested = require('postcss-nested');
const easyImport = require('postcss-easy-import');


const source = (...args) => path.resolve(__dirname, '..', 'source', ...args);
const dest = (...args) => path.resolve(__dirname, '..', 'dist', ...args);

 
const hbs = wax(handlebars)
	.partials(source('elements/**/*.hbs'), {
		parsePartialName: (options, file) => 
			path.basename(file.path).replace('.hbs', '')
	})
	.data(source('data.js'));

const template = fs.readFileSync(source('index.hbs')).toString();
const css = fs.readFileSync(source('styles.css')).toString();


const plugins = [
	require('postcss-easy-import'),
  cssnext({ warnForDuplicates: false }),
  nested,
	require('cssnano')
];

postcss(plugins)
  .process(css)
  .then((res) => {
		const fn = hbs.compile(template);
  	const output = fn({ css: res.css });

  	console.log(output, minify(output));

    fs.writeFileSync(dest('index.html'), `<!DOCTYPE html>${minify(output)}`);
  })
  .catch((err) => {
    throw new Error(err);
  });