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
        between = wysihtml5.dom.table.getCellsBetween(cellFirst, cellLast);
        
     equal(between.length, 4*4, "All 16 cells are in list");
     equal(between[0], cellFirst, "First cell of selection in list and first");
     equal(between[between.length - 1], cellLast, "Last cell of selection in list and last");
        
  
});