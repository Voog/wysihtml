/* jshint node: true */

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/**\n' +
            ' * <%= pkg.name %>: v<%= pkg.version %>\n' +
            ' * <%= pkg.homepage %>\n' +
            ' */\n',
    // Task configuration.
    clean: [
      'dist/<%= pkg.name %>.js',
      'dist/<%= pkg.name %>.min.js',
      'dist/<%= pkg.name %>-wotools.js',
      'dist/<%= pkg.name %>-wotools.min.js'
    ],

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      Gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['test/*.js', 'test/**/*.js']
      },
      parser_rules: {
        src: ['test/*.js', 'test/**/*.js']
      },
      lib: {
        src: 'lib/base/base.js'
      },
      test: {
        src: ['test/*.js', 'test/**/*.js']
      }
    },

    concat: {
      options: {
        separator: '\n',
      },
      dist: {
        src: [
          'src/wysihtml5.js',
          'lib/rangy/rangy-core.js',
          'lib/base/base.js',
          'src/browser.js',
          'src/lang/array.js',
          'src/lang/dispatcher.js',
          'src/lang/object.js',
          'src/lang/string.js',
          'src/dom/auto_link.js',
          'src/dom/class.js',
          'src/dom/contains.js',
          'src/dom/convert_to_list.js',
          'src/dom/copy_attributes.js',
          'src/dom/copy_styles.js',
          'src/dom/delegate.js',
          'src/dom/get_as_dom.js',
          'src/dom/get_parent_element.js',
          'src/dom/get_style.js',
          'src/dom/has_element_with_tag_name.js',
          'src/dom/has_element_with_class_name.js',
          'src/dom/insert.js',
          'src/dom/insert_css.js',
          'src/dom/observe.js',
          'src/dom/parse.js',
          'src/dom/remove_empty_text_nodes.js',
          'src/dom/rename_element.js',
          'src/dom/replace_with_child_nodes.js',
          'src/dom/resolve_list.js',
          'src/dom/sandbox.js',
          'src/dom/contenteditable_area.js',
          'src/dom/set_attributes.js',
          'src/dom/set_styles.js',
          'src/dom/simulate_placeholder.js',
          'src/dom/text_content.js',
          'src/dom/get_attribute.js',
          'src/dom/table.js',
          'src/dom/query.js',
          'src/quirks/clean_pasted_html.js',
          'src/quirks/ensure_proper_clearing.js',
          'src/quirks/get_correct_inner_html.js',
          'src/quirks/redraw.js',
          'src/quirks/table_cells_selection.js',
          'src/quirks/style_parser.js',
          'src/selection/selection.js',
          'src/selection/html_applier.js',
          'src/commands.js',
          'src/commands/bold.js',
          'src/commands/createLink.js',
          'src/commands/removeLink.js',
          'src/commands/fontSize.js',
          'src/commands/fontSizeStyle.js',
          'src/commands/foreColor.js',
          'src/commands/foreColorStyle.js',
          'src/commands/bgColorStyle.js',
          'src/commands/formatBlock.js',
          'src/commands/formatInline.js',
          'src/commands/insertHTML.js',
          'src/commands/insertImage.js',
          'src/commands/insertLineBreak.js',
          'src/commands/insertOrderedList.js',
          'src/commands/insertUnorderedList.js',
          'src/commands/italic.js',
          'src/commands/justifyCenter.js',
          'src/commands/justifyLeft.js',
          'src/commands/justifyRight.js',
          'src/commands/justifyFull.js',
          'src/commands/redo.js',
          'src/commands/underline.js',
          'src/commands/undo.js',
          'src/commands/createTable.js',
          'src/commands/mergeTableCells.js',
          'src/commands/addTableCells.js',
          'src/commands/deleteTableCells.js',
          'src/undo_manager.js',
          'src/views/view.js',
          'src/views/composer.js',
          'src/views/composer.style.js',
          'src/views/composer.observe.js',
          'src/views/synchronizer.js',
          'src/views/textarea.js',
          'src/toolbar/dialog.js',
          'src/toolbar/speech.js',
          'src/toolbar/toolbar.js',
          'src/toolbar/dialog_createTable.js',
          'src/toolbar/dialog_foreColorStyle.js',
          'src/toolbar/dialog_fontSizeStyle.js',
          'src/editor.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      },
      wotools: {
        src: [
          'src/wysihtml5.js',
          'lib/rangy/rangy-core.js',
          'lib/base/base.js',
          'src/browser.js',
          'src/lang/array.js',
          'src/lang/dispatcher.js',
          'src/lang/object.js',
          'src/lang/string.js',
          'src/dom/auto_link.js',
          'src/dom/class.js',
          'src/dom/contains.js',
          'src/dom/convert_to_list.js',
          'src/dom/copy_attributes.js',
          'src/dom/copy_styles.js',
          'src/dom/delegate.js',
          'src/dom/get_as_dom.js',
          'src/dom/get_parent_element.js',
          'src/dom/get_style.js',
          'src/dom/has_element_with_tag_name.js',
          'src/dom/has_element_with_class_name.js',
          'src/dom/insert.js',
          'src/dom/insert_css.js',
          'src/dom/observe.js',
          'src/dom/parse.js',
          'src/dom/remove_empty_text_nodes.js',
          'src/dom/rename_element.js',
          'src/dom/replace_with_child_nodes.js',
          'src/dom/resolve_list.js',
          'src/dom/sandbox.js',
          'src/dom/contenteditable_area.js',
          'src/dom/set_attributes.js',
          'src/dom/set_styles.js',
          'src/dom/simulate_placeholder.js',
          'src/dom/text_content.js',
          'src/dom/get_attribute.js',
          'src/dom/table.js',
          'src/dom/query.js',
          'src/quirks/clean_pasted_html.js',
          'src/quirks/ensure_proper_clearing.js',
          'src/quirks/get_correct_inner_html.js',
          'src/quirks/redraw.js',
          'src/quirks/table_cells_selection.js',
          'src/quirks/style_parser.js',
          'src/selection/selection.js',
          'src/selection/html_applier.js',
          'src/commands.js',
          'src/commands/bold.js',
          'src/commands/createLink.js',
          'src/commands/removeLink.js',
          'src/commands/fontSize.js',
          'src/commands/fontSizeStyle.js',
          'src/commands/foreColor.js',
          'src/commands/foreColorStyle.js',
          'src/commands/bgColorStyle.js',
          'src/commands/formatBlock.js',
          'src/commands/formatInline.js',
          'src/commands/insertHTML.js',
          'src/commands/insertImage.js',
          'src/commands/insertLineBreak.js',
          'src/commands/insertOrderedList.js',
          'src/commands/insertUnorderedList.js',
          'src/commands/italic.js',
          'src/commands/justifyCenter.js',
          'src/commands/justifyLeft.js',
          'src/commands/justifyRight.js',
          'src/commands/justifyFull.js',
          'src/commands/redo.js',
          'src/commands/underline.js',
          'src/commands/undo.js',
          'src/commands/createTable.js',
          'src/commands/mergeTableCells.js',
          'src/commands/addTableCells.js',
          'src/commands/deleteTableCells.js',
          'src/undo_manager.js',
          'src/views/view.js',
          'src/views/composer.js',
          'src/views/composer.style.js',
          'src/views/composer.observe.js',
          'src/views/synchronizer.js',
          'src/views/textarea.js',
          'src/editor.js'
        ],
        dest: 'dist/<%= pkg.name %>-wotools.js'
      },
    },

    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        dest: 'dist/<%= pkg.name %>.min.js',
        src: 'dist/<%= pkg.name %>.js'
      },
      wotools: {
        dest: 'dist/<%= pkg.name %>-wotools.min.js',
        src: 'dist/<%= pkg.name %>-wotools.js'
      },
    },

    copy: {
      dist: {
        dest: 'dist/<%= pkg.name %>-v<%= pkg.version %>.js',
        src: 'dist/<%= pkg.name %>.js'
      },
      distMin: {
        dest: 'dist/<%= pkg.name %>-v<%= pkg.version %>.min.js',
        src: 'dist/<%= pkg.name %>.min.js'
      },
      wotools: {
        dest: 'dist/<%= pkg.name %>-v<%= pkg.version %>-wotools.js',
        src: 'dist/<%= pkg.name %>-wotools.js'
      },
      wotoolsMin: {
        dest: 'dist/<%= pkg.name %>-v<%= pkg.version %>-wotools.min.js',
        src: 'dist/<%= pkg.name %>-wotools.min.js'
      },
    }

  });


  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['test', 'build']);
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', ['clean', 'concat', 'uglify', 'copy']);
};
