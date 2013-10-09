module("wysihtml5.dom.table", {
  setup: function() {
      var row, cell;
      
      this.wrapper = document.createElement("div");
      this.wrapper.innerHTML = '<table id="my-table">\
          <tr>\
              <td></td><td></td><td></td><td></td>\
          </tr>\
          <tr>\
              <td></td><td></td><td></td><td></td>\
          </tr>\
          <tr>\
              <td></td><td></td><td></td><td></td>\
          </tr>\
          <tr>\
              <td></td><td></td><td></td><td></td>\
          </tr>\
      </table>';
      document.body.appendChild(this.wrapper);
      this.table = document.getElementById('my-table');
  },
  
  teardown: function() {
    this.wrapper.parentNode.removeChild(this.wrapper);
  },
  
  getTable: function() {
      return this.table;
  } 
});

test("getCellsBetween", function() {
    var cells = this.getTable().querySelectorAll('td'),
        cellFirst = cells[0],
        cellLast = cells[cells.length - 1],
        secondCell = cells[1],
        beforeLastCell = cells[cells.length - 2],
        secondRowFirstCell = cells[4],
        between = wysihtml5.dom.table.getCellsBetween(cellFirst, cellLast);
        
     equal(between.length, 4*4, "All 16 cells are in list of selection from first to last cell");
     equal(between[0], cellFirst, "First cell of selection in list and first");
     equal(between[between.length - 1], cellLast, "Last cell of selection in list and last");
     
     var inList1 = false;
     var inList2 = false;
     var inList3 = false;
     for (var i = 0, imax = between.length; i < imax; i++) {
         if (between[i] == secondRowFirstCell) {
             inList1 = true;
         }
         if (between[i] == cellFirst) {
             inList2 = true;
         }
         if (between[i] == cellLast) {
             inList3 = true;
         } 
     }
     ok(inList1 && inList2 && inList3, "First, last and second row first cell are in list");
     
     between = wysihtml5.dom.table.getCellsBetween(secondCell, beforeLastCell);
     equal(between.length, 2*4, "List is 8 cells long if selections is moved from second cell to before last (first and last column not selected)");
     
     var notInList = true;
     for (var i = 0, imax = between.length; i < imax; i++) {
         if (between[i] == secondRowFirstCell || between[i] == cellFirst || between[i] == cellLast) {
             notInList = false;
         } 
     }
     ok(notInList, "First, last and second row first cell are not in list anymore");
     
     between = wysihtml5.dom.table.getCellsBetween(secondCell, secondCell);
     equal(between.length, 1, "List collapses to one cell if start and end cell are the same");
     equal(between[0], secondCell, "The element in list is correct");
});

test("addCells (above/below)", function() {
    var cells = this.getTable().querySelectorAll('td'),
        rows = this.getTable().querySelectorAll('tr'),
        cellFirst = cells[0],
        cellLast = cells[cells.length - 1],
        startRowsNr = rows.length;
        
    wysihtml5.dom.table.addCells(cellLast,"below");
    equal(this.getTable().querySelectorAll('tr').length, startRowsNr + 1, "One row added successfully to table location below");
    
    var newrows = this.getTable().querySelectorAll('tr'),
        bottomSecondRowCells = newrows[newrows.length - 2].querySelectorAll('td'),
        lasCellOfBSrow = bottomSecondRowCells[bottomSecondRowCells.length - 1];
        
    equal(lasCellOfBSrow, cellLast, "Row added correctly below cell and original DOM object is intact");
    
    wysihtml5.dom.table.addCells(cellLast,"below");
    equal(this.getTable().querySelectorAll('tr').length, startRowsNr + 2, "One row added successfully to table location belown (last to second row)");
    equal(this.getTable().querySelectorAll('td')[15], cellLast, "Row added correctly below cell and original DOM object is intact");
    
    wysihtml5.dom.table.addCells(cellFirst,"above");
    equal(this.getTable().querySelectorAll('tr').length, startRowsNr + 3, "One row added successfully to table location above");
    equal(this.getTable().querySelectorAll('td')[4], cellFirst, "Row added correctly above cell and original DOM object is intact");
    
    wysihtml5.dom.table.addCells(cellFirst,"above");
    equal(this.getTable().querySelectorAll('tr').length, startRowsNr + 4, "One row added successfully to table location above (on second row)");
    equal(this.getTable().querySelectorAll('td')[8], cellFirst, "Row added correctly above cell and original DOM object is intact");
});

test("addCells (before/after)", function() {
    var cells = this.getTable().querySelectorAll('td'),
        nr_rows = this.getTable().querySelectorAll('tr').length,
        cellFirst = cells[0],
        cellLast = cells[cells.length - 1];
        
    wysihtml5.dom.table.addCells(cellFirst, "before");
    equal(this.getTable().querySelectorAll('td').length, cells.length +  (1 * nr_rows), "One column added successfully to table location before");
    equal(this.getTable().querySelectorAll('td')[1], cellFirst, "Row added correctly before cell and original DOM object is intact");
    
    wysihtml5.dom.table.addCells(cellFirst, "before");
    equal(this.getTable().querySelectorAll('td').length, cells.length +  (2 * nr_rows), "One column added successfully to table location before (on second column)");
    equal(this.getTable().querySelectorAll('td')[2], cellFirst, "Row added correctly before cell and original DOM object is intact");
    
    wysihtml5.dom.table.addCells(cellLast, "after");
    equal(this.getTable().querySelectorAll('td').length, cells.length +  (3 * nr_rows), "One column added successfully to table location after");
    equal(this.getTable().querySelectorAll('td')[this.getTable().querySelectorAll('td').length - 2], cellLast, "Row added correctly after cell and original DOM object is intact");
    
    wysihtml5.dom.table.addCells(cellLast, "after");
    equal(this.getTable().querySelectorAll('td').length, cells.length +  (4 * nr_rows), "One column added successfully to table location after (on last to second column)");
    equal(this.getTable().querySelectorAll('td')[this.getTable().querySelectorAll('td').length - 3], cellLast, "Row added correctly after cell and original DOM object is intact");
    
});

