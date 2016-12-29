module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jsdoc : {
			dist : {
				src: ['src/**/**/*.js', 'README.md'],
				options: {
					destination : 'doc',
					   encoding : 'utf8',
						recurse : true,
						template: 'node_modules/tui-jsdoc-template',
					  configure : 'jsdoc.conf',
					  tutorials : 'doc/tutorials'
				}
			}
		},
		copy: {
			dist: {
				files: [
					{
						expand: true,
						cwd: 'src/css/',
						src: ['*.css'],
						dest: 'dist/css/'
					},
					{
						expand: true,
						cwd: 'src/fonts/',
						src: ['*.*'],
						dest: 'dist/fonts/'
					},
					{
						expand: true,
						cwd: 'src/scripts/plugins/',
						src: ['*.js'],
						dest: 'dist/scripts/plugins/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: ['*.html'],
						dest: 'dist/'
					}
				]
			}
		},
		concat: {
			dist: {
				src: ['src/scripts/modules/*.js', 'src/scripts/*.js'],
				dest: 'dist/scripts/simple-wysiwyg-editor.js',
				options: {
					banner: ";(function(window,undefined){\n",
					footer: "\n}(window));\n"
				}
			}
		}
	});
	// Load the plugin &
	// Default task(s).
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	
	grunt.registerTask('default', ['copy', 'concat']);
	grunt.registerTask('docs', ['jsdoc']);
};