wysihtml.commands.deleteTableCells = {
  exec: function(composer, command, value) {
    if (composer.tableSelection && composer.tableSelection.start && composer.tableSelection.end) {
      var tableSelect = wysihtml.dom.table.orderSelectionEnds(composer.tableSelection.start, composer.tableSelection.end),
          idx = wysihtml.dom.table.indexOf(tableSelect.start),
          selCell,
          table = composer.tableSelection.table;

      wysihtml.dom.table.removeCells(tableSelect.start, value);
      setTimeout(function() {
        // move selection to next or previous if not present
        selCell = wysihtml.dom.table.findCell(table, idx);

        if (!selCell) {
          if (value == 'row') {
            selCell = wysihtml.dom.table.findCell(table, {
              'row': idx.row - 1,
              'col': idx.col
            });
          }

          if (value == 'column') {
            selCell = wysihtml.dom.table.findCell(table, {
              'row': idx.row,
              'col': idx.col - 1
            });
          }
        }
        if (selCell) {
          composer.tableSelection.select(selCell, selCell);
        }
      }, 0);
    }
  },

  state: function(composer, command) {
    return false;
  }
};
