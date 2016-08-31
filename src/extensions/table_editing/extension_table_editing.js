(function() {

  // Keep the old composer.observe function.
  var oldObserverFunction = wysihtml.views.Composer.prototype.observe;

  var extendedObserverFunction = function() {
    oldObserverFunction.call(this);
    // Bind the table user interaction tracking
    if (this.config.handleTables) {
      // If handleTables option is true, table handling functions are bound
      initTableHandling.call(this);
    }
  };

  // Table management.
  // If present enableObjectResizing and enableInlineTableEditing command
  // should be called with false to prevent native table handlers.
  var initTableHandling = function() {
    var hideHandlers = function() {
          this.win.removeEventListener('load', hideHandlers);
          this.doc.execCommand('enableObjectResizing', false, 'false');
          this.doc.execCommand('enableInlineTableEditing', false, 'false');
        }.bind(this),
        iframeInitiator = (function() {
          hideHandlers.call(this);
          this.actions.removeListeners(this.sandbox.getIframe(), ['focus', 'mouseup', 'mouseover'], iframeInitiator);
        }).bind(this);

    if (
      this.doc.execCommand &&
      wysihtml.browser.supportsCommand(this.doc, 'enableObjectResizing') &&
      wysihtml.browser.supportsCommand(this.doc, 'enableInlineTableEditing')
    ) {
      if (this.sandbox.getIframe) {
        this.actions.addListeners(this.sandbox.getIframe(), ['focus', 'mouseup', 'mouseover'], iframeInitiator);
      } else {
        this.win.addEventListener('load', hideHandlers);
      }
    }
    this.tableSelection = wysihtml.quirks.tableCellsSelection(this.element, this.parent);
  };

  // Cell selections handling
  var tableCellsSelection = function(editable, editor) {

    var init = function() {
      editable.addEventListener('mousedown', handleMouseDown);
      return select;
    };

    var handleMouseDown = function(event) {
      var target = wysihtml.dom.getParentElement(event.target, {query: 'td, th'}, false, editable);
      if (target) {
        handleSelectionMousedown(target);
      }
    };

    var handleSelectionMousedown = function(target) {
      select.start = target;
      select.end = target;
      select.cells = [target];
      select.table = dom.getParentElement(select.start, {query: 'table'}, false, editable);

      if (select.table) {
        removeCellSelections();
        dom.addClass(target, selectionClass);
        editable.addEventListener('mousemove', handleMouseMove);
        editable.addEventListener('mouseup', handleMouseUp);
        editor.fire('tableselectstart').fire('tableselectstart:composer');
      }
    };

    // remove all selection classes
    var removeCellSelections = function() {
      if (editable) {
        var selectedCells = editable.querySelectorAll('.' + selectionClass);
        if (selectedCells.length > 0) {
          for (var i = 0; i < selectedCells.length; i++) {
            dom.removeClass(selectedCells[i], selectionClass);
          }
        }
      }
    };

    var addSelections = function(cells) {
      for (var i = 0; i < cells.length; i++) {
        dom.addClass(cells[i], selectionClass);
      }
    };

    var handleMouseMove = function(event) {
      var curTable = null,
        cell = dom.getParentElement(event.target, {query: 'td, th'}, false, editable),
        oldEnd;

      if (cell && select.table && select.start) {
        curTable =  dom.getParentElement(cell, {query: 'table'}, false, editable);
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
            editor.fire('tableselectchange').fire('tableselectchange:composer');
          }
        }
      }
    };

    var handleMouseUp = function(event) {
      editable.removeEventListener('mousemove', handleMouseMove);
      editable.removeEventListener('mouseup', handleMouseUp);
      editor.fire('tableselect').fire('tableselect:composer');
      setTimeout(function() {
        bindSideclick();
      }, 0);
    };

    var sideClickHandler = function(event) {
      editable.ownerDocument.removeEventListener('click', sideClickHandler);
      if (dom.getParentElement(event.target, {query: 'table'}, false, editable) != select.table) {
        removeCellSelections();
        select.table = null;
        select.start = null;
        select.end = null;
        editor.fire('tableunselect').fire('tableunselect:composer');
      }
    };

    var bindSideclick = function() {
      editable.ownerDocument.addEventListener('click', sideClickHandler);
    };

    var selectCells = function(start, end) {
      select.start = start;
      select.end = end;
      select.table = dom.getParentElement(select.start, {query: 'table'}, false, editable);
      selectedCells = dom.table.getCellsBetween(select.start, select.end);
      addSelections(selectedCells);
      bindSideclick();
      editor.fire('tableselect').fire('tableselect:composer');
    };

    var dom = wysihtml.dom,
        select = {
          table: null,
          start: null,
          end: null,
          cells: null,
          select: selectCells
        },
        selectionClass = 'wysiwyg-tmp-selected-cell';

    return init();
  };

  // Bind to wysihtml
  wysihtml.Editor.prototype.defaults.handleTables = true;
  wysihtml.quirks.tableCellsSelection = tableCellsSelection;
  wysihtml.views.Composer.prototype.observe = extendedObserverFunction;

})();
