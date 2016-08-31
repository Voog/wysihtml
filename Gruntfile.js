module.exports = function(grunt) {

  'use strict';

  // List required source files that will be built into wysihtml.js
  var base = [
    'src/wysihtml.js',
    'src/polyfills.js',
    'lib/base/base.js',
    'lib/rangy/rangy-core.js',
    'lib/rangy/rangy-selectionsaverestore.js',
    'lib/rangy/rangy-textrange.js',
    'src/browser.js',
    'src/lang/*.js',
    'src/dom/*.js',
    'src/quirks/*js',
    'src/selection/selection.js',
    'src/commands.js',
    'src/core-commands/*.js',
    'src/undo_manager.js',
    'src/views/view.js',
    'src/views/composer.js',
    'src/views/composer.style.js',
    'src/views/composer.observe.js',
    'src/views/synchronizer.js',
    'src/views/sourceview.js',
    'src/views/textarea.js',
    'src/editor.js'
  ];

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        process: function(src, filepath) {
          return src.replace(/@VERSION/g, grunt.config.get('pkg.version'));
        }
      },
      dist: {
        src: base,
        dest: 'dist/<%= pkg.name %>.js'
      },
      extracommands: {
        src: 'src/extra-commands/*.js',
        dest: 'dist/<%= pkg.name %>.all-commands.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n',
        sourceMap: true
      },
      dist: {
        files: {
          'dist/minified/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js',
        }
      },
      extracommands: {
        files: {
          'dist/minified/<%= pkg.name %>.all-commands.min.js': 'dist/<%= pkg.name %>.all-commands.js'
        }
      }
    },
    open: {
      test: {
        path: 'test/index.html'
      }
    },
    watch: {
      scripts: {
        files: base,
        tasks: ['concat:dist', 'uglify:dist']
      },
      extracommands: {
        files: ['src/extra-commands/*.js'],
        tasks: ['concat:extracommands', 'uglify:extracommands']
      },
      extensions: {
        files: ['./src/extensions/*/*.js'],
        tasks: ['build-modules']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('build-modules', 'Builds all extension files', function() {
    var concat = {},
        uglify = {};

    grunt.file.expand('./src/extensions/*').forEach(function (d) {
      var dir = d.split('/').pop();

      if (!grunt.file.isDir(d)) {
        var fnameArr = dir.split('.');
        fnameArr.pop();
        dir = fnameArr.join('.');
      }

      concat[dir] = {
        src: grunt.file.isDir(d) ? [d + '/*.js'] : [d],
        dest: 'dist/wysihtml.' + dir + '.js'
      };

      uglify[dir] = {
        options: {
          sourceMap: true
        },
        files: {
          ['dist/minified/wysihtml.' + dir + '.min.js']: 'dist/wysihtml.' + dir + '.js'
        }
      };

    });
    grunt.config.set('concat', concat);
    grunt.task.run('concat');
    grunt.config.set('uglify', uglify);
    grunt.task.run('uglify');
  });

  grunt.registerTask('default', ['concat', 'uglify', 'build-modules']);
  grunt.registerTask('test', ['open:test']);
};
