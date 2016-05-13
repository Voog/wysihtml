# wysihtml

wysihtml is an extended and less strict approach on [xing/wysihtml5](https://github.com/xing/wysihtml5) open source rich text editor.
The code is library agnostic and has all dependencies bundled: No jQuery, Prototype or similar is required.
The currently bundled dependencies are rangy.js (including textrange and selectionsaverestore modules) and base.js.

This project is supported by [Voog](http://voog.com).

# Version 0.6.0 breaking changes

Version 0.6.0 notes for migration.

* Object namespace is now wysihtyml (was previously wysihtml5). This change includes all classnames and event names.
* The default toolbar is separated to independent module (wysihtml.toolbar.js) and must be added separately if used.
* Full command set for backwards compatibility is not bundled and separated to wysihtml.all-commands.js module. Most commands there directly map to formatBlock or formatInline commands and are thus optional and can be replaced with these internal commands.
* Table editing features are now as a separate module

## Demos
* Project page with simple demo: http://wysihtml.com
* Minimal demo: https://voog.github.com/wysihtml/examples/simple.html
* Advanced demo: https://voog.github.com/wysihtml/examples/advanced.html
* Editable GitHub page: https://voog.github.com/wysihtml
* Or try it on a working app: https://www.voog.com

## Features

* Auto linking of urls as-you-type.
* Generates valid and semantic HTML5 markup (no `<font>` tags).
* Can use class-names instead of inline styles.
* Unifies line-break handling across browsers (hitting enter will create `<br>` instead of `<p>` or `<div>`).
* Auto-parses content inserted via copy & paste (from Word, Powerpoint, PDF, other web pages, etc.).
* Converts invalid or unknown html tags into valid/similar tags.
* Source code view for users with HTML skills.
* Uses sandboxed iframes in order to prevent identity theft through XSS.
* Editor inherits styles and attributes (`placeholder`, `autofocus`, etc.) from original textarea (you only have to style one element).

**Extended features not present in xing/wysihtml5:**

* Can be used without iframe sandbox when initiated on `<div>` instead of `<textarea>`.
* Blocking of image drag drop in editable is removed.
* Table insertion management and cell merging commands.
* Improved parser with options to: unwrap tag instead of remove, keep defined styles, complex object type definitions for allowing elements.
* Ability to add uneditable area inside editor text flow (useful when building modules like video tools, advanced image editor etc).
* Improved formatblock handling.
* Ability for user to remove formating with only collapsed caret without having to select exactly whole text.
* Improved speed.
* Anchor creating and removing logic changed to more universal.
* Default build is without internal toolbar functions and build with `-toolbar` suffix contains default toolbar functions.

## Browser Support

The rich text editing interface is supported in IE9+, FF 29+, Safari 6+, Safari on iOS 6+, Opera 12+ and Chrome.
**Graceful Degradation:** Users with other browsers will see the textarea and are still able to write plain HTML by themselves.

## Development

wysihtml can be initialized and built using node package manager:

    npm install
    npm run build

This adds dependencies (first line) and builds both minified and development versions (second line).

## Contributors

See the [list of contributors here](https://github.com/Voog/wysihtml/graphs/contributors).
