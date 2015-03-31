wysihtml5.quirks.tableCellsSelection = function(editable, editor) {

  var dom = wysihtml5.dom,
    select = {
      table: null,
      start: null,
      end: null,
      cells: null,
      select: selectCells
    },
    selection_class = "wysiwyg-tmp-selected-cell";

  function init () {
    editable.addEventListener("mousedown", handleMouseDown);
    return select;
  }

  var handleMouseDown = function(event) {
    var target = wysihtml5.dom.getParentElement(event.target, { query: "td, th" }, false, editable);
    if (target) {
      handleSelectionMousedown(target);
    }
  };

  function handleSelectionMousedown (target) {
    select.start = target;
    select.end = target;
    select.cells = [target];
    select.table = dom.getParentElement(select.start, { query: "table" }, false, editable);

    if (select.table) {
      removeCellSelections();
      dom.addClass(target, selection_class);
      editable.addEventListener("mousemove", handleMouseMove);
      editable.addEventListener("mouseup", handleMouseUp);
      editor.fire("tableselectstart").fire("tableselectstart:composer");
    }
  }

  // remove all selection classes
  function removeCellSelections () {
    if (editable) {
      var selectedCells = editable.querySelectorAll('.' + selection_class);
      if (selectedCells.length > 0) {
        for (var i = 0; i < selectedCells.length; i++) {
          dom.removeClass(selectedCells[i], selection_class);
        }
      }
    }
  }

  function addSelections (cells) {
    for (var i = 0; i < cells.length; i++) {
      dom.addClass(cells[i], selection_class);
    }
  }

  function handleMouseMove (event) {
    var curTable = null,
      cell = dom.getParentElement(event.target, { query: "td, th" }, false, editable),
      oldEnd;

    if (cell && select.table && select.start) {
      curTable =  dom.getParentElement(cell, { query: "table" }, false, editable);
      if (curTable && curTable === select.table) {
        removeCellSelections();
        oldEnd = select.end;
        select.end = cell;
        select.cells = dom.table.getCellsBetween(select.start, cell);
        if (select.cells.length > 1) {
          editor.composer.selection.deselect();
        }
        addSelections(select.cells);
        if (select.end !== oldEnd) {
          editor.fire("tableselectchange").fire("tableselectchange:composer");
        }
      }
    }
  }

  function handleMouseUp (event) {
    editable.removeEventListener("mousemove", handleMouseMove);
    editable.removeEventListener("mouseup", handleMouseUp);
    editor.fire("tableselect").fire("tableselect:composer");
    setTimeout(function() {
      bindSideclick();
    },0);
  }

  var sideClickHandler = function(event) {
    editable.ownerDocument.removeEventListener("click", sideClickHandler);
    if (dom.getParentElement(event.target, { query: "table" }, false, editable) != select.table) {
      removeCellSelections();
      select.table = null;
      select.start = null;
      select.end = null;
      editor.fire("tableunselect").fire("tableunselect:composer");
    }
  };

  function bindSideclick () {
    editable.ownerDocument.addEventListener("click", sideClickHandler);
  }

  function selectCells (start, end) {
    select.start = start;
    select.end = end;
    select.table = dom.getParentElement(select.start, { query: "table" }, false, editable);
    selectedCells = dom.table.getCellsBetween(select.start, select.end);
    addSelections(selectedCells);
    bindSideclick();
    editor.fire("tableselect").fire("tableselect:composer");
  }

  return init();

};
