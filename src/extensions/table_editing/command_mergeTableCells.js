wysihtml.commands.mergeTableCells = {
  exec: function(composer, command) {
    if (composer.tableSelection && composer.tableSelection.start && composer.tableSelection.end) {
      if (this.state(composer, command)) {
        wysihtml.dom.table.unmergeCell(composer.tableSelection.start);
      } else {
        wysihtml.dom.table.mergeCellsBetween(composer.tableSelection.start, composer.tableSelection.end);
      }
    }
  },

  state: function(composer, command) {
    if (composer.tableSelection) {
      var start = composer.tableSelection.start,
          end = composer.tableSelection.end;
      if (start && end && start == end &&
        ((
          wysihtml.dom.getAttribute(start, 'colspan') &&
          parseInt(wysihtml.dom.getAttribute(start, 'colspan'), 10) > 1
        ) || (
          wysihtml.dom.getAttribute(start, 'rowspan') &&
          parseInt(wysihtml.dom.getAttribute(start, 'rowspan'), 10) > 1
        ))
      ) {
        return [start];
      }
    }
    return false;
  }
};
