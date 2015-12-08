/**
 * @license wysihtml v@VERSION
 * https://github.com/Voog/wysihtml
 *
 * Author: Christopher Blum (https://github.com/tiff)
 * Secondary author of extended features: Oliver Pulges (https://github.com/pulges)
 *
 * Copyright (C) 2012 XING AG
 * Licensed under the MIT license (MIT)
 *
 */
var wysihtml5 = {
  version: "@VERSION",

  // namespaces
  commands:   {},
  dom:        {},
  quirks:     {},
  toolbar:    {},
  lang:       {},
  selection:  {},
  views:      {},

  INVISIBLE_SPACE: "\uFEFF",
  INVISIBLE_SPACE_REG_EXP: /\uFEFF/g,

  VOID_ELEMENTS: "area, base, br, col, embed, hr, img, input, keygen, link, meta, param, source, track, wbr",

  EMPTY_FUNCTION: function() {},

  ELEMENT_NODE: 1,
  TEXT_NODE:    3,

  BACKSPACE_KEY:  8,
  ENTER_KEY:      13,
  ESCAPE_KEY:     27,
  SPACE_KEY:      32,
  TAB_KEY:        9,
  DELETE_KEY:     46
};
