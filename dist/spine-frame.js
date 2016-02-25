(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _spineAnimation = require('./spine-animation');

var _spineAnimation2 = _interopRequireDefault(_spineAnimation);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

spine.Bone.yDown = false;
AFRAME.registerComponent('spine', {
  schema: {
    src: { default: '' },
    animation: { default: '' },
    scale: { default: 0.005 }
  },

  init: function init() {
    this.spineAnim = null;
    this.state = null;
  },
  update: function update(oldData) {
    if (!oldData || this.data.src !== oldData.src) {
      var name = _path2.default.basename(this.data.src);
      var dir = _path2.default.dirname(this.data.src);

      this.spineAnim = new _spineAnimation2.default(name, dir, this.data.scale);
      this.spineAnim.addEventListener(_spineAnimation2.default.SKELETON_DATA_LOADED, this.loaded.bind(this));
      this.el.object3D.add(this.spineAnim);
      this.state = 'LOADING';
    }

    if (this.state === 'READY') {
      this.spineAnim.state.setAnimationByName(0, this.data.animation, true);
    }
  },
  loaded: function loaded() {
    this.spineAnim.state.setAnimationByName(0, this.data.animation, true);
    this.state = 'READY';
  },
  tick: function tick() {
    this.spineAnim.update();
  },
  remove: function remove() {
    if (this.spineAnim) {
      this.spineAnim.dispose();
    }
  }
});

},{"./spine-animation":4,"path":2}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* from https://raw.githubusercontent.com/makc/spine-runtimes/three.js/spine-threejs/example/index.html */
var loadText = function loadText(url, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", url, true);
  req.responseType = 'text';
  req.addEventListener('error', function (event) {}, false);
  req.addEventListener('abort', function (event) {}, false);
  req.addEventListener('load', function (event) {
    callback(req.response);
  }, false);
  req.send();
  return req;
};

var loadImage = function loadImage(url, callback) {
  var image = new Image();
  image.addEventListener('error', function (event) {}, false);
  image.addEventListener('abort', function (event) {}, false);
  image.addEventListener('load', function (event) {
    callback(image);
  }, false);
  image.src = url;
  return image;
};

var SpineAnimation = function SpineAnimation(animation, path, scale) {

  THREE.Object3D.call(this);

  this.name = animation;

  path = path ? path + (path.substr(-1) != '/' ? '/' : '') : '';

  var self = this;

  loadText(path + animation + '.atlas', function (atlasText) {
    self.atlas = new spine.Atlas(atlasText, {
      load: function load(page, image, atlas) {
        loadImage(path + image, function (image) {
          // calculate UVs in atlas regions
          page.width = image.width;
          page.height = image.height;

          atlas.updateUVs(page);

          // propagate new UVs to attachments, if they were already created
          if (self.skeleton) {
            var skins = self.skeleton.data.skins;
            for (var s = 0, n = skins.length; s < n; s++) {
              var attachments = skins[s].attachments;
              for (var k in attachments) {
                var attachment = attachments[k];
                if (attachment instanceof spine.RegionAttachment) {
                  var region = attachment.rendererObject;
                  attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);
                }
              }
            }
          }

          // create basic material for the page
          var texture = new THREE.Texture(image);
          texture.needsUpdate = true;

          page.rendererObject = [new THREE.MeshBasicMaterial({
            //color: 0xff00, wireframe: true,
            map: texture, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5
          })];
        });
      },
      unload: function unload(materials) {
        for (var i = 0, n = materials.length; i < n; i++) {
          var material = materials[i];
          if (material.meshes) {
            for (var name in material.meshes) {
              var mesh = material.meshes[name];
              if (mesh.parent) {
                mesh.parent.remove(mesh);
              }
              mesh.geometry.dispose();
            }
          }
          material.map.dispose();
          material.dispose();
        }
        // will be called multiple times
        materials.length = 0;
      }
    });

    loadText(path + animation + '.json', function (skeletonText) {
      var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(self.atlas));
      json.scale = scale || 1;

      var skeletonData = json.readSkeletonData(JSON.parse(skeletonText));

      self.skeleton = new spine.Skeleton(skeletonData);
      self.stateData = new spine.AnimationStateData(skeletonData);
      self.state = new spine.AnimationState(self.stateData);

      self.dispatchEvent({
        type: SpineAnimation.SKELETON_DATA_LOADED
      });
    });
  });

  var matrix = new THREE.Matrix4();

  // if given, dt must be in ms

  this.update = function (dt, dz) {
    if (!this.state) return;

    this.state.update(dt || 1.0 / 60);
    this.state.apply(this.skeleton);
    this.skeleton.updateWorldTransform();

    this.traverse(function (object) {
      if (object instanceof THREE.Mesh) {
        object.visible = false;
      }
    });

    var Z = 0;
    var drawOrder = this.skeleton.drawOrder;
    for (var i = 0, n = drawOrder.length; i < n; i++) {
      var slot = drawOrder[i];
      var attachment = slot.attachment;
      if (!(attachment instanceof spine.RegionAttachment)) continue;

      var materials = attachment.rendererObject.page.rendererObject;
      if (!materials) {
        // texture was not loaded yet
        continue;
      }

      if (slot.data.additiveBlending && materials.length == 1) {
        // create separate material for additive blending
        materials.push(new THREE.MeshBasicMaterial({
          map: materials[0].map,
          side: THREE.DoubleSide,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        }));
      }

      var material = materials[slot.data.additiveBlending ? 1 : 0];

      material.meshes = material.meshes || {};

      var mesh = material.meshes[slot.data.name];

      var geometry;

      if (mesh) {
        geometry = mesh.geometry;

        mesh.visible = true;
      } else {
        geometry = new THREE.PlaneGeometry(attachment.regionOriginalWidth, attachment.regionOriginalHeight);

        geometry.dynamic = true;

        mesh = new THREE.Mesh(geometry, material);

        material.meshes[slot.data.name] = mesh;

        mesh.matrixAutoUpdate = false;

        this.add(mesh);
      }

      if (mesh.attachmentTime && slot.getAttachmentTime() > mesh.attachmentTime) {
        // do nothing
      } else {
          // update UVs
          geometry.faceVertexUvs[0][0][0].set(attachment.uvs[6], 1 - attachment.uvs[7]);
          geometry.faceVertexUvs[0][0][1].set(attachment.uvs[4], 1 - attachment.uvs[5]);
          geometry.faceVertexUvs[0][0][2].set(attachment.uvs[0], 1 - attachment.uvs[1]);
          geometry.faceVertexUvs[0][1][0].set(attachment.uvs[4], 1 - attachment.uvs[5]);
          geometry.faceVertexUvs[0][1][1].set(attachment.uvs[2], 1 - attachment.uvs[3]);
          geometry.faceVertexUvs[0][1][2].set(attachment.uvs[0], 1 - attachment.uvs[1]);
          geometry.uvsNeedUpdate = true;

          geometry.vertices[1].set(attachment.offset[0], attachment.offset[1], 0);
          geometry.vertices[3].set(attachment.offset[2], attachment.offset[3], 0);
          geometry.vertices[2].set(attachment.offset[4], attachment.offset[5], 0);
          geometry.vertices[0].set(attachment.offset[6], attachment.offset[7], 0);
          geometry.verticesNeedUpdate = true;

          mesh.attachmentTime = slot.getAttachmentTime();
        }

      matrix.makeTranslation(this.skeleton.x + slot.bone.worldX, this.skeleton.y + slot.bone.worldY, (dz || 0.1) * (Z += 0.001));

      matrix.elements[0] = slot.bone.m00;matrix.elements[4] = slot.bone.m01;
      matrix.elements[1] = slot.bone.m10;matrix.elements[5] = slot.bone.m11;

      mesh.matrix.copy(matrix);

      /* TODO slot.r,g,b,a ?? turbulenz example code:
      batch.add(
        attachment.rendererObject.page.rendererObject,
        vertices[0], vertices[1],
        vertices[6], vertices[7],
        vertices[2], vertices[3],
        vertices[4], vertices[5],
        skeleton.r * slot.r,
        skeleton.g * slot.g,
        skeleton.b * slot.b,
        skeleton.a * slot.a,
        attachment.uvs[0], attachment.uvs[1],
        attachment.uvs[4], attachment.uvs[5]
      );
      */
    }
  };
};

SpineAnimation.SKELETON_DATA_LOADED = 'skeletonDataLoaded';

SpineAnimation.prototype = Object.create(THREE.Object3D.prototype);

SpineAnimation.prototype.dispose = function () {
  if (this.parent) this.parent.remove(this);this.atlas.dispose();
};

exports.default = SpineAnimation;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAuanMiLCJub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInNwaW5lLWFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQ0dBLE1BQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsS0FBbkI7QUFDQSxPQUFPLGlCQUFQLENBQXlCLE9BQXpCLEVBQWtDO0FBQ2hDLFVBQVE7QUFDTixTQUFLLEVBQUUsU0FBUyxFQUFULEVBQVA7QUFDQSxlQUFXLEVBQUUsU0FBUyxFQUFULEVBQWI7QUFDQSxXQUFPLEVBQUUsU0FBUyxLQUFULEVBQVQ7R0FIRjs7QUFNQSx3QkFBTztBQUNMLFNBQUssU0FBTCxHQUFpQixJQUFqQixDQURLO0FBRUwsU0FBSyxLQUFMLEdBQWEsSUFBYixDQUZLO0dBUHlCO0FBWWhDLDBCQUFPLFNBQVM7QUFDZCxRQUFJLENBQUMsT0FBRCxJQUFZLEtBQUssSUFBTCxDQUFVLEdBQVYsS0FBa0IsUUFBUSxHQUFSLEVBQWE7QUFDN0MsVUFBTSxPQUFPLGVBQUssUUFBTCxDQUFjLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBckIsQ0FEdUM7QUFFN0MsVUFBTSxNQUFNLGVBQUssT0FBTCxDQUFhLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBbkIsQ0FGdUM7O0FBSTdDLFdBQUssU0FBTCxHQUFpQiw2QkFBbUIsSUFBbkIsRUFBeUIsR0FBekIsRUFBOEIsS0FBSyxJQUFMLENBQVUsS0FBVixDQUEvQyxDQUo2QztBQUs3QyxXQUFLLFNBQUwsQ0FBZSxnQkFBZixDQUFnQyx5QkFBZSxvQkFBZixFQUFxQyxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQXJFLEVBTDZDO0FBTTdDLFdBQUssRUFBTCxDQUFRLFFBQVIsQ0FBaUIsR0FBakIsQ0FBcUIsS0FBSyxTQUFMLENBQXJCLENBTjZDO0FBTzdDLFdBQUssS0FBTCxHQUFhLFNBQWIsQ0FQNkM7S0FBL0M7O0FBVUEsUUFBSSxLQUFLLEtBQUwsS0FBZSxPQUFmLEVBQXdCO0FBQzFCLFdBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsa0JBQXJCLENBQXdDLENBQXhDLEVBQTJDLEtBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBaEUsRUFEMEI7S0FBNUI7R0F2QjhCO0FBNEJoQyw0QkFBUztBQUNQLFNBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsa0JBQXJCLENBQXdDLENBQXhDLEVBQTJDLEtBQUssSUFBTCxDQUFVLFNBQVYsRUFBcUIsSUFBaEUsRUFETztBQUVQLFNBQUssS0FBTCxHQUFhLE9BQWIsQ0FGTztHQTVCdUI7QUFpQ2hDLHdCQUFPO0FBQ0wsU0FBSyxTQUFMLENBQWUsTUFBZixHQURLO0dBakN5QjtBQXFDaEMsNEJBQVM7QUFDUCxRQUFJLEtBQUssU0FBTCxFQUFnQjtBQUNsQixXQUFLLFNBQUwsQ0FBZSxPQUFmLEdBRGtCO0tBQXBCO0dBdEM4QjtDQUFsQzs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Ozs7Ozs7O0FBakZnRCxLQUFsRDtHQWZZLENBekZ1QztDQUFsQzs7QUErTXJCLGVBQWUsb0JBQWYsR0FBc0Msb0JBQXRDOztBQUVBLGVBQWUsU0FBZixHQUEyQixPQUFPLE1BQVAsQ0FBZSxNQUFNLFFBQU4sQ0FBZSxTQUFmLENBQTFDOztBQUVBLGVBQWUsU0FBZixDQUF5QixPQUF6QixHQUFtQyxZQUFZO0FBQzdDLE1BQUksS0FBSyxNQUFMLEVBQWEsS0FBSyxNQUFMLENBQVksTUFBWixDQUFvQixJQUFwQixFQUFqQixJQUE0QyxDQUFLLEtBQUwsQ0FBVyxPQUFYLEdBREM7Q0FBWjs7a0JBSXBCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBTcGluZUFuaW1hdGlvbiBmcm9tICcuL3NwaW5lLWFuaW1hdGlvbic7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuc3BpbmUuQm9uZS55RG93biA9IGZhbHNlO1xyXG5BRlJBTUUucmVnaXN0ZXJDb21wb25lbnQoJ3NwaW5lJywge1xyXG4gIHNjaGVtYToge1xyXG4gICAgc3JjOiB7IGRlZmF1bHQ6ICcnIH0sXHJcbiAgICBhbmltYXRpb246IHsgZGVmYXVsdDogJycgfSxcclxuICAgIHNjYWxlOiB7IGRlZmF1bHQ6IDAuMDA1IH1cclxuICB9LFxyXG5cclxuICBpbml0KCkge1xyXG4gICAgdGhpcy5zcGluZUFuaW0gPSBudWxsO1xyXG4gICAgdGhpcy5zdGF0ZSA9IG51bGw7XHJcbiAgfSxcclxuXHJcbiAgdXBkYXRlKG9sZERhdGEpIHtcclxuICAgIGlmICghb2xkRGF0YSB8fCB0aGlzLmRhdGEuc3JjICE9PSBvbGREYXRhLnNyYykge1xyXG4gICAgICBjb25zdCBuYW1lID0gcGF0aC5iYXNlbmFtZSh0aGlzLmRhdGEuc3JjKTtcclxuICAgICAgY29uc3QgZGlyID0gcGF0aC5kaXJuYW1lKHRoaXMuZGF0YS5zcmMpO1xyXG5cclxuICAgICAgdGhpcy5zcGluZUFuaW0gPSBuZXcgU3BpbmVBbmltYXRpb24obmFtZSwgZGlyLCB0aGlzLmRhdGEuc2NhbGUpO1xyXG4gICAgICB0aGlzLnNwaW5lQW5pbS5hZGRFdmVudExpc3RlbmVyKFNwaW5lQW5pbWF0aW9uLlNLRUxFVE9OX0RBVEFfTE9BREVELCB0aGlzLmxvYWRlZC5iaW5kKHRoaXMpKTtcclxuICAgICAgdGhpcy5lbC5vYmplY3QzRC5hZGQodGhpcy5zcGluZUFuaW0pO1xyXG4gICAgICB0aGlzLnN0YXRlID0gJ0xPQURJTkcnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnN0YXRlID09PSAnUkVBRFknKSB7XHJcbiAgICAgIHRoaXMuc3BpbmVBbmltLnN0YXRlLnNldEFuaW1hdGlvbkJ5TmFtZSgwLCB0aGlzLmRhdGEuYW5pbWF0aW9uLCB0cnVlKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICBsb2FkZWQoKSB7XHJcbiAgICB0aGlzLnNwaW5lQW5pbS5zdGF0ZS5zZXRBbmltYXRpb25CeU5hbWUoMCwgdGhpcy5kYXRhLmFuaW1hdGlvbiwgdHJ1ZSk7XHJcbiAgICB0aGlzLnN0YXRlID0gJ1JFQURZJztcclxuICB9LFxyXG5cclxuICB0aWNrKCkge1xyXG4gICAgdGhpcy5zcGluZUFuaW0udXBkYXRlKCk7XHJcbiAgfSxcclxuXHJcbiAgcmVtb3ZlKCkge1xyXG4gICAgaWYgKHRoaXMuc3BpbmVBbmltKSB7XHJcbiAgICAgIHRoaXMuc3BpbmVBbmltLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHJlc29sdmVzIC4gYW5kIC4uIGVsZW1lbnRzIGluIGEgcGF0aCBhcnJheSB3aXRoIGRpcmVjdG9yeSBuYW1lcyB0aGVyZVxuLy8gbXVzdCBiZSBubyBzbGFzaGVzLCBlbXB0eSBlbGVtZW50cywgb3IgZGV2aWNlIG5hbWVzIChjOlxcKSBpbiB0aGUgYXJyYXlcbi8vIChzbyBhbHNvIG5vIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHNsYXNoZXMgLSBpdCBkb2VzIG5vdCBkaXN0aW5ndWlzaFxuLy8gcmVsYXRpdmUgYW5kIGFic29sdXRlIHBhdGhzKVxuZnVuY3Rpb24gbm9ybWFsaXplQXJyYXkocGFydHMsIGFsbG93QWJvdmVSb290KSB7XG4gIC8vIGlmIHRoZSBwYXRoIHRyaWVzIHRvIGdvIGFib3ZlIHRoZSByb290LCBgdXBgIGVuZHMgdXAgPiAwXG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIGkgPSBwYXJ0cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBsYXN0ID0gcGFydHNbaV07XG4gICAgaWYgKGxhc3QgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAobGFzdCA9PT0gJy4uJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBwYXJ0cy51bnNoaWZ0KCcuLicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXJ0cztcbn1cblxuLy8gU3BsaXQgYSBmaWxlbmFtZSBpbnRvIFtyb290LCBkaXIsIGJhc2VuYW1lLCBleHRdLCB1bml4IHZlcnNpb25cbi8vICdyb290JyBpcyBqdXN0IGEgc2xhc2gsIG9yIG5vdGhpbmcuXG52YXIgc3BsaXRQYXRoUmUgPVxuICAgIC9eKFxcLz98KShbXFxzXFxTXSo/KSgoPzpcXC57MSwyfXxbXlxcL10rP3wpKFxcLlteLlxcL10qfCkpKD86W1xcL10qKSQvO1xudmFyIHNwbGl0UGF0aCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gIHJldHVybiBzcGxpdFBhdGhSZS5leGVjKGZpbGVuYW1lKS5zbGljZSgxKTtcbn07XG5cbi8vIHBhdGgucmVzb2x2ZShbZnJvbSAuLi5dLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzb2x2ZWRQYXRoID0gJycsXG4gICAgICByZXNvbHZlZEFic29sdXRlID0gZmFsc2U7XG5cbiAgZm9yICh2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICB2YXIgcGF0aCA9IChpID49IDApID8gYXJndW1lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcblxuICAgIC8vIFNraXAgZW1wdHkgYW5kIGludmFsaWQgZW50cmllc1xuICAgIGlmICh0eXBlb2YgcGF0aCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKGZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHAgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5qb2luIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfSkuam9pbignLycpKTtcbn07XG5cblxuLy8gcGF0aC5yZWxhdGl2ZShmcm9tLCB0bylcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMucmVsYXRpdmUgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICBmcm9tID0gZXhwb3J0cy5yZXNvbHZlKGZyb20pLnN1YnN0cigxKTtcbiAgdG8gPSBleHBvcnRzLnJlc29sdmUodG8pLnN1YnN0cigxKTtcblxuICBmdW5jdGlvbiB0cmltKGFycikge1xuICAgIHZhciBzdGFydCA9IDA7XG4gICAgZm9yICg7IHN0YXJ0IDwgYXJyLmxlbmd0aDsgc3RhcnQrKykge1xuICAgICAgaWYgKGFycltzdGFydF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICB2YXIgZW5kID0gYXJyLmxlbmd0aCAtIDE7XG4gICAgZm9yICg7IGVuZCA+PSAwOyBlbmQtLSkge1xuICAgICAgaWYgKGFycltlbmRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgaWYgKHN0YXJ0ID4gZW5kKSByZXR1cm4gW107XG4gICAgcmV0dXJuIGFyci5zbGljZShzdGFydCwgZW5kIC0gc3RhcnQgKyAxKTtcbiAgfVxuXG4gIHZhciBmcm9tUGFydHMgPSB0cmltKGZyb20uc3BsaXQoJy8nKSk7XG4gIHZhciB0b1BhcnRzID0gdHJpbSh0by5zcGxpdCgnLycpKTtcblxuICB2YXIgbGVuZ3RoID0gTWF0aC5taW4oZnJvbVBhcnRzLmxlbmd0aCwgdG9QYXJ0cy5sZW5ndGgpO1xuICB2YXIgc2FtZVBhcnRzTGVuZ3RoID0gbGVuZ3RoO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGZyb21QYXJ0c1tpXSAhPT0gdG9QYXJ0c1tpXSkge1xuICAgICAgc2FtZVBhcnRzTGVuZ3RoID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHZhciBvdXRwdXRQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBpID0gc2FtZVBhcnRzTGVuZ3RoOyBpIDwgZnJvbVBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgb3V0cHV0UGFydHMucHVzaCgnLi4nKTtcbiAgfVxuXG4gIG91dHB1dFBhcnRzID0gb3V0cHV0UGFydHMuY29uY2F0KHRvUGFydHMuc2xpY2Uoc2FtZVBhcnRzTGVuZ3RoKSk7XG5cbiAgcmV0dXJuIG91dHB1dFBhcnRzLmpvaW4oJy8nKTtcbn07XG5cbmV4cG9ydHMuc2VwID0gJy8nO1xuZXhwb3J0cy5kZWxpbWl0ZXIgPSAnOic7XG5cbmV4cG9ydHMuZGlybmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIHJlc3VsdCA9IHNwbGl0UGF0aChwYXRoKSxcbiAgICAgIHJvb3QgPSByZXN1bHRbMF0sXG4gICAgICBkaXIgPSByZXN1bHRbMV07XG5cbiAgaWYgKCFyb290ICYmICFkaXIpIHtcbiAgICAvLyBObyBkaXJuYW1lIHdoYXRzb2V2ZXJcbiAgICByZXR1cm4gJy4nO1xuICB9XG5cbiAgaWYgKGRpcikge1xuICAgIC8vIEl0IGhhcyBhIGRpcm5hbWUsIHN0cmlwIHRyYWlsaW5nIHNsYXNoXG4gICAgZGlyID0gZGlyLnN1YnN0cigwLCBkaXIubGVuZ3RoIC0gMSk7XG4gIH1cblxuICByZXR1cm4gcm9vdCArIGRpcjtcbn07XG5cblxuZXhwb3J0cy5iYXNlbmFtZSA9IGZ1bmN0aW9uKHBhdGgsIGV4dCkge1xuICB2YXIgZiA9IHNwbGl0UGF0aChwYXRoKVsyXTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIGNvbXBhcmlzb24gY2FzZS1pbnNlbnNpdGl2ZSBvbiB3aW5kb3dzP1xuICBpZiAoZXh0ICYmIGYuc3Vic3RyKC0xICogZXh0Lmxlbmd0aCkgPT09IGV4dCkge1xuICAgIGYgPSBmLnN1YnN0cigwLCBmLmxlbmd0aCAtIGV4dC5sZW5ndGgpO1xuICB9XG4gIHJldHVybiBmO1xufTtcblxuXG5leHBvcnRzLmV4dG5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBzcGxpdFBhdGgocGF0aClbM107XG59O1xuXG5mdW5jdGlvbiBmaWx0ZXIgKHhzLCBmKSB7XG4gICAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmKTtcbiAgICB2YXIgcmVzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXM7XG59XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbnZhciBzdWJzdHIgPSAnYWInLnN1YnN0cigtMSkgPT09ICdiJ1xuICAgID8gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikgeyByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKSB9XG4gICAgOiBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7XG4gICAgICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuICAgICAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuKTtcbiAgICB9XG47XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8qIGZyb20gaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL21ha2Mvc3BpbmUtcnVudGltZXMvdGhyZWUuanMvc3BpbmUtdGhyZWVqcy9leGFtcGxlL2luZGV4Lmh0bWwgKi9cclxudmFyIGxvYWRUZXh0ID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcclxuICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0ICgpO1xyXG4gIHJlcS5vcGVuIChcIkdFVFwiLCB1cmwsIHRydWUpO1xyXG4gIHJlcS5yZXNwb25zZVR5cGUgPSAndGV4dCc7XHJcbiAgcmVxLmFkZEV2ZW50TGlzdGVuZXIgKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudCkge30sIGZhbHNlKTtcclxuICByZXEuYWRkRXZlbnRMaXN0ZW5lciAoJ2Fib3J0JywgZnVuY3Rpb24gKGV2ZW50KSB7fSwgZmFsc2UpO1xyXG4gIHJlcS5hZGRFdmVudExpc3RlbmVyICgnbG9hZCcsIGZ1bmN0aW9uIChldmVudCkgeyBjYWxsYmFjayAocmVxLnJlc3BvbnNlKTsgfSwgZmFsc2UpO1xyXG4gIHJlcS5zZW5kICgpO1xyXG4gIHJldHVybiByZXE7XHJcbn07XHJcblxyXG52YXIgbG9hZEltYWdlID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcclxuICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UgKCk7XHJcbiAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciAoJ2Vycm9yJywgZnVuY3Rpb24gKGV2ZW50KSB7fSwgZmFsc2UpO1xyXG4gIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIgKCdhYm9ydCcsIGZ1bmN0aW9uIChldmVudCkge30sIGZhbHNlKTtcclxuICBpbWFnZS5hZGRFdmVudExpc3RlbmVyICgnbG9hZCcsIGZ1bmN0aW9uIChldmVudCkgeyBjYWxsYmFjayAoaW1hZ2UpOyB9LCBmYWxzZSk7XHJcbiAgaW1hZ2Uuc3JjID0gdXJsO1xyXG4gIHJldHVybiBpbWFnZTtcclxufTtcclxuXHJcbnZhciBTcGluZUFuaW1hdGlvbiA9IGZ1bmN0aW9uIChhbmltYXRpb24sIHBhdGgsIHNjYWxlKSB7XHJcblxyXG4gIFRIUkVFLk9iamVjdDNELmNhbGwgKHRoaXMpO1xyXG5cclxuICB0aGlzLm5hbWUgPSBhbmltYXRpb247XHJcblxyXG4gIHBhdGggPSBwYXRoID8gKHBhdGggK1xyXG4gICAgKChwYXRoLnN1YnN0cigtMSkgIT0gJy8nKSA/ICcvJyA6ICcnKVxyXG4gICkgOiAnJztcclxuXHJcbiAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICBsb2FkVGV4dCAocGF0aCArIGFuaW1hdGlvbiArICcuYXRsYXMnLCBmdW5jdGlvbiAoYXRsYXNUZXh0KSB7XHJcbiAgICBzZWxmLmF0bGFzID0gbmV3IHNwaW5lLkF0bGFzKGF0bGFzVGV4dCwge1xyXG4gICAgICBsb2FkOiBmdW5jdGlvbiAocGFnZSwgaW1hZ2UsIGF0bGFzKSB7XHJcbiAgICAgICAgbG9hZEltYWdlIChwYXRoICsgaW1hZ2UsIGZ1bmN0aW9uIChpbWFnZSkge1xyXG4gICAgICAgICAgLy8gY2FsY3VsYXRlIFVWcyBpbiBhdGxhcyByZWdpb25zXHJcbiAgICAgICAgICBwYWdlLndpZHRoID0gaW1hZ2Uud2lkdGg7XHJcbiAgICAgICAgICBwYWdlLmhlaWdodCA9IGltYWdlLmhlaWdodDtcclxuXHJcbiAgICAgICAgICBhdGxhcy51cGRhdGVVVnMgKHBhZ2UpO1xyXG5cclxuICAgICAgICAgIC8vIHByb3BhZ2F0ZSBuZXcgVVZzIHRvIGF0dGFjaG1lbnRzLCBpZiB0aGV5IHdlcmUgYWxyZWFkeSBjcmVhdGVkXHJcbiAgICAgICAgICBpZiAoc2VsZi5za2VsZXRvbikge1xyXG4gICAgICAgICAgICB2YXIgc2tpbnMgPSBzZWxmLnNrZWxldG9uLmRhdGEuc2tpbnM7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHMgPSAwLCBuID0gc2tpbnMubGVuZ3RoOyBzIDwgbjsgcysrKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGF0dGFjaG1lbnRzID0gc2tpbnNbc10uYXR0YWNobWVudHM7XHJcbiAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBhdHRhY2htZW50cykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGF0dGFjaG1lbnQgPSBhdHRhY2htZW50c1trXTtcclxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2htZW50IGluc3RhbmNlb2Ygc3BpbmUuUmVnaW9uQXR0YWNobWVudCkge1xyXG4gICAgICAgICAgICAgICAgICB2YXIgcmVnaW9uID0gYXR0YWNobWVudC5yZW5kZXJlck9iamVjdDtcclxuICAgICAgICAgICAgICAgICAgYXR0YWNobWVudC5zZXRVVnMgKHJlZ2lvbi51LCByZWdpb24udiwgcmVnaW9uLnUyLCByZWdpb24udjIsIHJlZ2lvbi5yb3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIGNyZWF0ZSBiYXNpYyBtYXRlcmlhbCBmb3IgdGhlIHBhZ2VcclxuICAgICAgICAgIHZhciB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUgKGltYWdlKTtcclxuICAgICAgICAgIHRleHR1cmUubmVlZHNVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgIHBhZ2UucmVuZGVyZXJPYmplY3QgPSBbXHJcbiAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCAoe1xyXG4gICAgICAgICAgICAgIC8vY29sb3I6IDB4ZmYwMCwgd2lyZWZyYW1lOiB0cnVlLFxyXG4gICAgICAgICAgICAgIG1hcCA6IHRleHR1cmUsIHNpZGUgOiBUSFJFRS5Eb3VibGVTaWRlLCB0cmFuc3BhcmVudCA6IHRydWUsIGFscGhhVGVzdCA6IDAuNVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgXTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSxcclxuICAgICAgdW5sb2FkOiBmdW5jdGlvbiAobWF0ZXJpYWxzKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBtYXRlcmlhbHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgbWF0ZXJpYWwgPSBtYXRlcmlhbHNbaV07XHJcbiAgICAgICAgICBpZiAobWF0ZXJpYWwubWVzaGVzKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gbWF0ZXJpYWwubWVzaGVzKSB7XHJcbiAgICAgICAgICAgICAgdmFyIG1lc2ggPSBtYXRlcmlhbC5tZXNoZXNbbmFtZV07XHJcbiAgICAgICAgICAgICAgaWYgKG1lc2gucGFyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBtZXNoLnBhcmVudC5yZW1vdmUgKG1lc2gpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBtZXNoLmdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbWF0ZXJpYWwubWFwLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIG1hdGVyaWFsLmRpc3Bvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gd2lsbCBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXNcclxuICAgICAgICBtYXRlcmlhbHMubGVuZ3RoID0gMDtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgbG9hZFRleHQgKHBhdGggKyBhbmltYXRpb24gKyAnLmpzb24nLCBmdW5jdGlvbiAoc2tlbGV0b25UZXh0KSB7XHJcbiAgICAgIHZhciBqc29uID0gbmV3IHNwaW5lLlNrZWxldG9uSnNvbiAobmV3IHNwaW5lLkF0bGFzQXR0YWNobWVudExvYWRlciAoc2VsZi5hdGxhcykpO1xyXG4gICAgICBqc29uLnNjYWxlID0gc2NhbGUgfHwgMTtcclxuXHJcbiAgICAgIHZhciBza2VsZXRvbkRhdGEgPSBqc29uLnJlYWRTa2VsZXRvbkRhdGEgKEpTT04ucGFyc2UgKHNrZWxldG9uVGV4dCkpO1xyXG5cclxuICAgICAgc2VsZi5za2VsZXRvbiA9IG5ldyBzcGluZS5Ta2VsZXRvbiAoc2tlbGV0b25EYXRhKTtcclxuICAgICAgc2VsZi5zdGF0ZURhdGEgPSBuZXcgc3BpbmUuQW5pbWF0aW9uU3RhdGVEYXRhIChza2VsZXRvbkRhdGEpOyAgXHJcbiAgICAgIHNlbGYuc3RhdGUgPSBuZXcgc3BpbmUuQW5pbWF0aW9uU3RhdGUgKHNlbGYuc3RhdGVEYXRhKTtcclxuXHJcbiAgICAgIHNlbGYuZGlzcGF0Y2hFdmVudCh7XHJcbiAgICAgICAgdHlwZSA6IFNwaW5lQW5pbWF0aW9uLlNLRUxFVE9OX0RBVEFfTE9BREVEXHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHZhciBtYXRyaXggPSBuZXcgVEhSRUUuTWF0cml4NCAoKTtcclxuXHJcbiAgLy8gaWYgZ2l2ZW4sIGR0IG11c3QgYmUgaW4gbXNcclxuXHJcbiAgdGhpcy51cGRhdGUgPSBmdW5jdGlvbiAoZHQsIGR6KSB7XHJcbiAgICBpZiAoIXRoaXMuc3RhdGUpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLnN0YXRlLnVwZGF0ZSAoZHQgfHwgKDEuMCAvIDYwKSk7XHJcbiAgICB0aGlzLnN0YXRlLmFwcGx5ICh0aGlzLnNrZWxldG9uKTtcclxuICAgIHRoaXMuc2tlbGV0b24udXBkYXRlV29ybGRUcmFuc2Zvcm0gKCk7XHJcblxyXG4gICAgdGhpcy50cmF2ZXJzZSAoZnVuY3Rpb24gKG9iamVjdCkge1xyXG4gICAgICBpZiAob2JqZWN0IGluc3RhbmNlb2YgVEhSRUUuTWVzaCkge1xyXG4gICAgICAgIG9iamVjdC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBaID0gMDtcclxuICAgIHZhciBkcmF3T3JkZXIgPSB0aGlzLnNrZWxldG9uLmRyYXdPcmRlcjtcclxuICAgIGZvciAodmFyIGkgPSAwLCBuID0gZHJhd09yZGVyLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICB2YXIgc2xvdCA9IGRyYXdPcmRlcltpXTtcclxuICAgICAgdmFyIGF0dGFjaG1lbnQgPSBzbG90LmF0dGFjaG1lbnQ7XHJcbiAgICAgIGlmICghKGF0dGFjaG1lbnQgaW5zdGFuY2VvZiBzcGluZS5SZWdpb25BdHRhY2htZW50KSkgY29udGludWU7XHJcblxyXG4gICAgICB2YXIgbWF0ZXJpYWxzID0gYXR0YWNobWVudC5yZW5kZXJlck9iamVjdC5wYWdlLnJlbmRlcmVyT2JqZWN0O1xyXG4gICAgICBpZiAoIW1hdGVyaWFscykge1xyXG4gICAgICAgIC8vIHRleHR1cmUgd2FzIG5vdCBsb2FkZWQgeWV0XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChzbG90LmRhdGEuYWRkaXRpdmVCbGVuZGluZyAmJiAobWF0ZXJpYWxzLmxlbmd0aCA9PSAxKSkge1xyXG4gICAgICAgIC8vIGNyZWF0ZSBzZXBhcmF0ZSBtYXRlcmlhbCBmb3IgYWRkaXRpdmUgYmxlbmRpbmdcclxuICAgICAgICBtYXRlcmlhbHMucHVzaCAobmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsICh7XHJcbiAgICAgICAgICBtYXAgOiBtYXRlcmlhbHNbMF0ubWFwLFxyXG4gICAgICAgICAgc2lkZSA6IFRIUkVFLkRvdWJsZVNpZGUsXHJcbiAgICAgICAgICB0cmFuc3BhcmVudCA6IHRydWUsXHJcbiAgICAgICAgICBibGVuZGluZyA6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXHJcbiAgICAgICAgICBkZXB0aFdyaXRlIDogZmFsc2VcclxuICAgICAgICB9KSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBtYXRlcmlhbCA9IG1hdGVyaWFsc1sgc2xvdC5kYXRhLmFkZGl0aXZlQmxlbmRpbmcgPyAxIDogMCBdO1xyXG5cclxuICAgICAgbWF0ZXJpYWwubWVzaGVzID0gbWF0ZXJpYWwubWVzaGVzIHx8IHt9O1xyXG5cclxuICAgICAgdmFyIG1lc2ggPSBtYXRlcmlhbC5tZXNoZXNbc2xvdC5kYXRhLm5hbWVdO1xyXG5cclxuICAgICAgdmFyIGdlb21ldHJ5O1xyXG5cclxuICAgICAgaWYgKG1lc2gpIHtcclxuICAgICAgICBnZW9tZXRyeSA9IG1lc2guZ2VvbWV0cnk7XHJcblxyXG4gICAgICAgIG1lc2gudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuUGxhbmVHZW9tZXRyeSAoXHJcbiAgICAgICAgICBhdHRhY2htZW50LnJlZ2lvbk9yaWdpbmFsV2lkdGgsXHJcbiAgICAgICAgICBhdHRhY2htZW50LnJlZ2lvbk9yaWdpbmFsSGVpZ2h0XHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgZ2VvbWV0cnkuZHluYW1pYyA9IHRydWU7XHJcblxyXG4gICAgICAgIG1lc2ggPSBuZXcgVEhSRUUuTWVzaCAoZ2VvbWV0cnksIG1hdGVyaWFsKTtcclxuXHJcbiAgICAgICAgbWF0ZXJpYWwubWVzaGVzW3Nsb3QuZGF0YS5uYW1lXSA9IG1lc2g7XHJcblxyXG4gICAgICAgIG1lc2gubWF0cml4QXV0b1VwZGF0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmFkZCAobWVzaCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChtZXNoLmF0dGFjaG1lbnRUaW1lICYmIChzbG90LmdldEF0dGFjaG1lbnRUaW1lICgpID4gbWVzaC5hdHRhY2htZW50VGltZSkpIHtcclxuICAgICAgICAvLyBkbyBub3RoaW5nXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gdXBkYXRlIFVWc1xyXG4gICAgICAgIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMF1bMF0uc2V0IChhdHRhY2htZW50LnV2c1s2XSwgMS0gYXR0YWNobWVudC51dnNbN10pO1xyXG4gICAgICAgIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMF1bMV0uc2V0IChhdHRhY2htZW50LnV2c1s0XSwgMS0gYXR0YWNobWVudC51dnNbNV0pO1xyXG4gICAgICAgIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMF1bMl0uc2V0IChhdHRhY2htZW50LnV2c1swXSwgMS0gYXR0YWNobWVudC51dnNbMV0pO1xyXG4gICAgICAgIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV1bMF0uc2V0IChhdHRhY2htZW50LnV2c1s0XSwgMS0gYXR0YWNobWVudC51dnNbNV0pO1xyXG4gICAgICAgIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV1bMV0uc2V0IChhdHRhY2htZW50LnV2c1syXSwgMS0gYXR0YWNobWVudC51dnNbM10pO1xyXG4gICAgICAgIGdlb21ldHJ5LmZhY2VWZXJ0ZXhVdnNbMF1bMV1bMl0uc2V0IChhdHRhY2htZW50LnV2c1swXSwgMS0gYXR0YWNobWVudC51dnNbMV0pO1xyXG4gICAgICAgIGdlb21ldHJ5LnV2c05lZWRVcGRhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlc1sxXS5zZXQgKGF0dGFjaG1lbnQub2Zmc2V0WzBdLCBhdHRhY2htZW50Lm9mZnNldFsxXSwgMCk7XHJcbiAgICAgICAgZ2VvbWV0cnkudmVydGljZXNbM10uc2V0IChhdHRhY2htZW50Lm9mZnNldFsyXSwgYXR0YWNobWVudC5vZmZzZXRbM10sIDApO1xyXG4gICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzWzJdLnNldCAoYXR0YWNobWVudC5vZmZzZXRbNF0sIGF0dGFjaG1lbnQub2Zmc2V0WzVdLCAwKTtcclxuICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlc1swXS5zZXQgKGF0dGFjaG1lbnQub2Zmc2V0WzZdLCBhdHRhY2htZW50Lm9mZnNldFs3XSwgMCk7XHJcbiAgICAgICAgZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgbWVzaC5hdHRhY2htZW50VGltZSA9IHNsb3QuZ2V0QXR0YWNobWVudFRpbWUgKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG1hdHJpeC5tYWtlVHJhbnNsYXRpb24gKFxyXG4gICAgICAgIHRoaXMuc2tlbGV0b24ueCArIHNsb3QuYm9uZS53b3JsZFgsXHJcbiAgICAgICAgdGhpcy5za2VsZXRvbi55ICsgc2xvdC5ib25lLndvcmxkWSxcclxuICAgICAgICAoZHogfHwgMC4xKSAqIChaICs9IDAuMDAxKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgbWF0cml4LmVsZW1lbnRzWzBdID0gc2xvdC5ib25lLm0wMDsgbWF0cml4LmVsZW1lbnRzWzRdID0gc2xvdC5ib25lLm0wMTtcclxuICAgICAgbWF0cml4LmVsZW1lbnRzWzFdID0gc2xvdC5ib25lLm0xMDsgbWF0cml4LmVsZW1lbnRzWzVdID0gc2xvdC5ib25lLm0xMTtcclxuXHJcbiAgICAgIG1lc2gubWF0cml4LmNvcHkgKG1hdHJpeCk7XHJcblxyXG4gICAgICAvKiBUT0RPIHNsb3QucixnLGIsYSA/PyB0dXJidWxlbnogZXhhbXBsZSBjb2RlOlxyXG4gICAgICBiYXRjaC5hZGQoXHJcbiAgICAgICAgYXR0YWNobWVudC5yZW5kZXJlck9iamVjdC5wYWdlLnJlbmRlcmVyT2JqZWN0LFxyXG4gICAgICAgIHZlcnRpY2VzWzBdLCB2ZXJ0aWNlc1sxXSxcclxuICAgICAgICB2ZXJ0aWNlc1s2XSwgdmVydGljZXNbN10sXHJcbiAgICAgICAgdmVydGljZXNbMl0sIHZlcnRpY2VzWzNdLFxyXG4gICAgICAgIHZlcnRpY2VzWzRdLCB2ZXJ0aWNlc1s1XSxcclxuICAgICAgICBza2VsZXRvbi5yICogc2xvdC5yLFxyXG4gICAgICAgIHNrZWxldG9uLmcgKiBzbG90LmcsXHJcbiAgICAgICAgc2tlbGV0b24uYiAqIHNsb3QuYixcclxuICAgICAgICBza2VsZXRvbi5hICogc2xvdC5hLFxyXG4gICAgICAgIGF0dGFjaG1lbnQudXZzWzBdLCBhdHRhY2htZW50LnV2c1sxXSxcclxuICAgICAgICBhdHRhY2htZW50LnV2c1s0XSwgYXR0YWNobWVudC51dnNbNV1cclxuICAgICAgKTtcclxuICAgICAgKi9cclxuICAgIH1cclxuXHJcbiAgfTtcclxufTtcclxuXHJcblNwaW5lQW5pbWF0aW9uLlNLRUxFVE9OX0RBVEFfTE9BREVEID0gJ3NrZWxldG9uRGF0YUxvYWRlZCc7XHJcblxyXG5TcGluZUFuaW1hdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlIChUSFJFRS5PYmplY3QzRC5wcm90b3R5cGUpO1xyXG5cclxuU3BpbmVBbmltYXRpb24ucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgaWYgKHRoaXMucGFyZW50KSB0aGlzLnBhcmVudC5yZW1vdmUgKHRoaXMpOyB0aGlzLmF0bGFzLmRpc3Bvc2UgKCk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTcGluZUFuaW1hdGlvbjtcclxuIl19
