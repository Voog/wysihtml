wysihtml5.commands.mergeTableCells = {
  exec: function(composer, command) {
    if (composer.tableSelection && composer.tableSelection.start && composer.tableSelection.end) {
        wysihtml5.dom.table.mergeCellsBetween(composer.tableSelection.start, composer.tableSelection.end);
    }
  },

  state: function(composer, command) {
    return false;
  }
};