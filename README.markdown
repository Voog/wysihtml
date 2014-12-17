# wysihtml

wysihtml is an extended and less strict approach on [xing/wysihtml5](https://github.com/xing/wysihtml5) open source rich text editor based on HTML5 technology.
The code is completely library agnostic: No jQuery, Prototype or similar is required.

This project is supported by the [Voog](https://voog.com).

## Features

* Auto linking of urls as-you-type
* Generates valid and semantic HTML5 markup (no `<font>` tags)
* Can use class-names instead of inline styles
* Unifies line-break handling across browsers (hitting enter will create `<br>` instead of `<p>` or `<div>`)
* Auto-parses content inserted via copy & paste (from Word, Powerpoint, PDF, other web pages, ...)
* Converts invalid or unknown html tags into valid/similar tags
* Source code view for users with HTML skills
* Uses sandboxed iframes in order to prevent identity theft through XSS
* Editor inherits styles and attributes (placeholder, autofocus, ...) from original textarea (you only have to style one element)
* Speech-input for Chrome

Extended features not present in xing/wysihtml5:

* Can be used without iframe sandbox when initiated on div instead of textarea
* Blocking of image drag drop in editable is removed
* Table insertion management and cell merging commands
* Improved parser with options to: unwrap tag instead of remove, keep defined styles, complex object type definitions for allowing elements.
* Ability to add uneditable area inside editor text flow (useful when building modules like video tools, advanced image editor etc.)
* Improved formatblock handling
* Ability for user to remove formating with only collapsed caret. (without having to select exactly whole text)
* Improved speed
* Anchor creting and removing logic changed to more universal
* Default build is without internal toolbar functions and build with "-toolbar" suffix contains default toolbar functions

## Browser Support

The rich text editing interface is supported in IE8+, FF 3.5+, Safari 4+, Safari on iOS 5+, Opera 11+ and Chrome.
**Graceful Degradation:** Users with other browsers will see the textarea and are still able to write plain HTML by themselves.

## Development

wysihtml5 can be built using Grunt. Installation instructions for [Grunt can be found here](http://gruntjs.com/getting-started). Once you have it installed, wysihtml5 can be built by simply running

    grunt

This builds both minified and development versions, including one with toolbar support.

## Contributors

See the [list of contributors here](https://github.com/Voog/wysihtml/graphs/contributors).
