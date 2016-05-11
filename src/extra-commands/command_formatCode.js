/* Formats block for as a <pre><code class="classname"></code></pre> block
 * Useful in conjuction for sytax highlight utility: highlight.js
 *
 * Usage:
 *
 * editorInstance.composer.commands.exec("formatCode", "language-html");
*/
wysihtml.commands.formatCode = (function() {
  return {
    exec: function(composer, command, classname) {
      var pre = this.state(composer)[0],
          code, range, selectedNodes;

      if (pre) {
        // caret is already within a <pre><code>...</code></pre>
        composer.selection.executeAndRestore(function() {
          code = pre.querySelector("code");
          wysihtml.dom.replaceWithChildNodes(pre);
          if (code) {
            wysihtml.dom.replaceWithChildNodes(code);
          }
        });
      } else {
        // Wrap in <pre><code>...</code></pre>
        range = composer.selection.getRange();
        selectedNodes = range.extractContents();
        pre = composer.doc.createElement("pre");
        code = composer.doc.createElement("code");

        if (classname) {
          code.className = classname;
        }

        pre.appendChild(code);
        code.appendChild(selectedNodes);
        range.insertNode(pre);
        composer.selection.selectNode(pre);
      }
    },

    state: function(composer) {
      var selectedNode = composer.selection.getSelectedNode(), node;
      if (selectedNode && selectedNode.nodeName && selectedNode.nodeName == "PRE"&&
          selectedNode.firstChild && selectedNode.firstChild.nodeName && selectedNode.firstChild.nodeName == "CODE") {
        return [selectedNode];
      } else {
        node = wysihtml.dom.getParentElement(selectedNode, { query: "pre code" });
        return node ? [node.parentNode] : false;
      }
    }
  };
})();
