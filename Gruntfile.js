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
  var packageJson = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: packageJson,
    concat: {
      options: {
        process: function(src, filepath) {
          return src.replace(/@VERSION/g, grunt.config.get('pkg.version'));
        }
      },
      dist: {
        src: base,
        dest: 'dist/<%= pkg.name %>.js',
          options: {
            banner: ";(function (factory) {\n" +
            "    'use strict';\n" +
            "    if (typeof define === 'function' && define.amd) {\n" +
            "        define('" + packageJson.name + "', [], factory);\n" +
            "    } else if(typeof exports == 'object') {\n" +
            "        module.exports = factory();\n" +
            "    } else {\n" +
            "        window." + packageJson.name + " = factory();\n" +
            "    }\n" +
            "}(function() {\n\n",
            footer: "\n    return " + packageJson.name + ";\n}));\n"
          }
      },
      extraCommands: {
        src: 'src/extra-commands/*.js',
        dest: 'dist/<%= pkg.name %>.all-commands.js',
          options: {
            banner:";(function (factory) {\n" +
              "    'use strict';\n" +
              "    if (typeof define === 'function' && define.amd) {\n" +
              "        define('" + packageJson.name + ".all-commands', ['" + packageJson.name + "'], factory);\n" +
              "    } else if(typeof exports == 'object') {\n" +
              "        factory(require('" + packageJson.name + "'));\n" +
              "    } else {\n" +
              "        factory(window." + packageJson.name + ");\n" +
              "    }\n" +
              "}(function(" + packageJson.name + ") {\n\n",
            footer: "\n}));\n"
          }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>) */\n',
        sourceMap: true
      },
      build: {
        files: {
          'dist/minified/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js',
          'dist/minified/<%= pkg.name %>.all-commands.min.js': 'dist/<%= pkg.name %>.all-commands.js'
        }
      }
    },
    open: {
      test: {
        path: 'test/index.html'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-open');
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
        options: {
          banner:";(function (factory) {\n" +
            "    'use strict';\n" +
            "    if (typeof define === 'function' && define.amd) {\n" +
            "        define('" + packageJson.name + "." + dir + "', ['" + packageJson.name + "'], factory);\n" +
            "    } else if(typeof exports == 'object') {\n" +
            "        factory(require('" + packageJson.name + "'));\n" +
            "    } else {\n" +
            "        factory(window." + packageJson.name + ");\n" +
            "    }\n" +
            "}(function(" + packageJson.name + ") {\n\n",
          footer: "\n}));\n"
        },
        src: grunt.file.isDir(d) ? [d + '/*.js'] : [d],
        dest: 'dist/wysihtml.' + dir + '.js'
      };
      
      uglify[dir] = {
        options: {
          sourceMap: true
        },
        files: {}
      };
      uglify[dir].files['dist/minified/wysihtml.' + dir + '.min.js'] = 'dist/wysihtml.' + dir + '.js';
      
    });
    grunt.config.set('concat', concat);
    grunt.task.run('concat');
    grunt.config.set('uglify', uglify);
    grunt.task.run('uglify');
  });

  grunt.registerTask('default', ['concat', 'uglify', 'build-modules']);
  grunt.registerTask('test', ['open:test']);
};
