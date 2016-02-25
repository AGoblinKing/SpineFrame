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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAuanMiLCJub2RlX21vZHVsZXMvcGF0aC1icm93c2VyaWZ5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInNwaW5lLWFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztBQ0dBLE1BQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsS0FBbkI7QUFDQSxPQUFPLGlCQUFQLENBQXlCLE9BQXpCLEVBQWtDO0FBQ2hDLFVBQVE7QUFDTixTQUFLLEVBQUUsU0FBUyxFQUFULEVBQVA7QUFDQSxlQUFXLEVBQUUsU0FBUyxFQUFULEVBQWI7QUFDQSxXQUFPLEVBQUUsU0FBUyxLQUFULEVBQVQ7R0FIRjs7QUFNQSx3QkFBTztBQUNMLFNBQUssU0FBTCxHQUFpQixJQUFqQixDQURLO0FBRUwsU0FBSyxLQUFMLEdBQWEsSUFBYixDQUZLO0dBUHlCO0FBWWhDLDBCQUFPLFNBQVM7QUFDZCxRQUFJLENBQUMsT0FBRCxJQUFZLEtBQUssSUFBTCxDQUFVLEdBQVYsS0FBa0IsUUFBUSxHQUFSLEVBQWE7QUFDN0MsVUFBTSxPQUFPLGVBQUssUUFBTCxDQUFjLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBckIsQ0FEdUM7QUFFN0MsVUFBTSxNQUFNLGVBQUssT0FBTCxDQUFhLEtBQUssSUFBTCxDQUFVLEdBQVYsQ0FBbkIsQ0FGdUM7O0FBSTdDLFdBQUssU0FBTCxHQUFpQiw2QkFBbUIsSUFBbkIsRUFBeUIsR0FBekIsRUFBOEIsS0FBSyxJQUFMLENBQVUsS0FBVixDQUEvQyxDQUo2QztBQUs3QyxXQUFLLFNBQUwsQ0FBZSxnQkFBZixDQUFnQyx5QkFBZSxvQkFBZixFQUFxQyxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLElBQWpCLENBQXJFLEVBTDZDO0FBTTdDLFdBQUssRUFBTCxDQUFRLFFBQVIsQ0FBaUIsR0FBakIsQ0FBcUIsS0FBSyxTQUFMLENBQXJCLENBTjZDO0FBTzdDLFdBQUssS0FBTCxHQUFhLFNBQWIsQ0FQNkM7S0FBL0M7R0FiOEI7QUF3QmhDLDRCQUFTO0FBQ1AsU0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixrQkFBckIsQ0FBd0MsQ0FBeEMsRUFBMkMsS0FBSyxJQUFMLENBQVUsU0FBVixFQUFxQixJQUFoRSxFQURPO0FBRVAsU0FBSyxLQUFMLEdBQWEsT0FBYixDQUZPO0dBeEJ1QjtBQTZCaEMsd0JBQU87QUFDTCxTQUFLLFNBQUwsQ0FBZSxNQUFmLEdBREs7R0E3QnlCO0FBaUNoQyw0QkFBUztBQUNQLFFBQUksS0FBSyxTQUFMLEVBQWdCO0FBQ2xCLFdBQUssU0FBTCxDQUFlLE9BQWYsR0FEa0I7S0FBcEI7R0FsQzhCO0NBQWxDOzs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDaE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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ZUFBZSxTQUFmLENBQXlCLE9BQXpCLEdBQW1DLFlBQVk7QUFDN0MsTUFBSSxLQUFLLE1BQUwsRUFBYSxLQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW9CLElBQXBCLEVBQWpCLElBQTRDLENBQUssS0FBTCxDQUFXLE9BQVgsR0FEQztDQUFaOztrQkFJcEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFNwaW5lQW5pbWF0aW9uIGZyb20gJy4vc3BpbmUtYW5pbWF0aW9uJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5zcGluZS5Cb25lLnlEb3duID0gZmFsc2U7XHJcbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgnc3BpbmUnLCB7XHJcbiAgc2NoZW1hOiB7XHJcbiAgICBzcmM6IHsgZGVmYXVsdDogJycgfSxcclxuICAgIGFuaW1hdGlvbjogeyBkZWZhdWx0OiAnJyB9LFxyXG4gICAgc2NhbGU6IHsgZGVmYXVsdDogMC4wMDUgfVxyXG4gIH0sXHJcblxyXG4gIGluaXQoKSB7XHJcbiAgICB0aGlzLnNwaW5lQW5pbSA9IG51bGw7XHJcbiAgICB0aGlzLnN0YXRlID0gbnVsbDtcclxuICB9LFxyXG5cclxuICB1cGRhdGUob2xkRGF0YSkge1xyXG4gICAgaWYgKCFvbGREYXRhIHx8IHRoaXMuZGF0YS5zcmMgIT09IG9sZERhdGEuc3JjKSB7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBwYXRoLmJhc2VuYW1lKHRoaXMuZGF0YS5zcmMpO1xyXG4gICAgICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUodGhpcy5kYXRhLnNyYyk7XHJcblxyXG4gICAgICB0aGlzLnNwaW5lQW5pbSA9IG5ldyBTcGluZUFuaW1hdGlvbihuYW1lLCBkaXIsIHRoaXMuZGF0YS5zY2FsZSk7XHJcbiAgICAgIHRoaXMuc3BpbmVBbmltLmFkZEV2ZW50TGlzdGVuZXIoU3BpbmVBbmltYXRpb24uU0tFTEVUT05fREFUQV9MT0FERUQsIHRoaXMubG9hZGVkLmJpbmQodGhpcykpO1xyXG4gICAgICB0aGlzLmVsLm9iamVjdDNELmFkZCh0aGlzLnNwaW5lQW5pbSk7XHJcbiAgICAgIHRoaXMuc3RhdGUgPSAnTE9BRElORyc7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgbG9hZGVkKCkge1xyXG4gICAgdGhpcy5zcGluZUFuaW0uc3RhdGUuc2V0QW5pbWF0aW9uQnlOYW1lKDAsIHRoaXMuZGF0YS5hbmltYXRpb24sIHRydWUpO1xyXG4gICAgdGhpcy5zdGF0ZSA9ICdSRUFEWSc7XHJcbiAgfSxcclxuXHJcbiAgdGljaygpIHtcclxuICAgIHRoaXMuc3BpbmVBbmltLnVwZGF0ZSgpO1xyXG4gIH0sXHJcblxyXG4gIHJlbW92ZSgpIHtcclxuICAgIGlmICh0aGlzLnNwaW5lQW5pbSkge1xyXG4gICAgICB0aGlzLnNwaW5lQW5pbS5kaXNwb3NlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgdG8gcGF0aC5yZXNvbHZlIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH0gZWxzZSBpZiAoIXBhdGgpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHJlc29sdmVkUGF0aCA9IHBhdGggKyAnLycgKyByZXNvbHZlZFBhdGg7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckF0KDApID09PSAnLyc7XG4gIH1cblxuICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XG4gIC8vIGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpIGZhaWxzKVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocmVzb2x2ZWRQYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIXJlc29sdmVkQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICByZXR1cm4gKChyZXNvbHZlZEFic29sdXRlID8gJy8nIDogJycpICsgcmVzb2x2ZWRQYXRoKSB8fCAnLic7XG59O1xuXG4vLyBwYXRoLm5vcm1hbGl6ZShwYXRoKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5ub3JtYWxpemUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciBpc0Fic29sdXRlID0gZXhwb3J0cy5pc0Fic29sdXRlKHBhdGgpLFxuICAgICAgdHJhaWxpbmdTbGFzaCA9IHN1YnN0cihwYXRoLCAtMSkgPT09ICcvJztcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcGF0aCA9IG5vcm1hbGl6ZUFycmF5KGZpbHRlcihwYXRoLnNwbGl0KCcvJyksIGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gISFwO1xuICB9KSwgIWlzQWJzb2x1dGUpLmpvaW4oJy8nKTtcblxuICBpZiAoIXBhdGggJiYgIWlzQWJzb2x1dGUpIHtcbiAgICBwYXRoID0gJy4nO1xuICB9XG4gIGlmIChwYXRoICYmIHRyYWlsaW5nU2xhc2gpIHtcbiAgICBwYXRoICs9ICcvJztcbiAgfVxuXG4gIHJldHVybiAoaXNBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHBhdGg7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmlzQWJzb2x1dGUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHJldHVybiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5qb2luID0gZnVuY3Rpb24oKSB7XG4gIHZhciBwYXRocyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gIHJldHVybiBleHBvcnRzLm5vcm1hbGl6ZShmaWx0ZXIocGF0aHMsIGZ1bmN0aW9uKHAsIGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBwICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGguam9pbiBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgcmV0dXJuIHA7XG4gIH0pLmpvaW4oJy8nKSk7XG59O1xuXG5cbi8vIHBhdGgucmVsYXRpdmUoZnJvbSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgZnJvbSA9IGV4cG9ydHMucmVzb2x2ZShmcm9tKS5zdWJzdHIoMSk7XG4gIHRvID0gZXhwb3J0cy5yZXNvbHZlKHRvKS5zdWJzdHIoMSk7XG5cbiAgZnVuY3Rpb24gdHJpbShhcnIpIHtcbiAgICB2YXIgc3RhcnQgPSAwO1xuICAgIGZvciAoOyBzdGFydCA8IGFyci5sZW5ndGg7IHN0YXJ0KyspIHtcbiAgICAgIGlmIChhcnJbc3RhcnRdICE9PSAnJykgYnJlYWs7XG4gICAgfVxuXG4gICAgdmFyIGVuZCA9IGFyci5sZW5ndGggLSAxO1xuICAgIGZvciAoOyBlbmQgPj0gMDsgZW5kLS0pIHtcbiAgICAgIGlmIChhcnJbZW5kXSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIGlmIChzdGFydCA+IGVuZCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBhcnIuc2xpY2Uoc3RhcnQsIGVuZCAtIHN0YXJ0ICsgMSk7XG4gIH1cblxuICB2YXIgZnJvbVBhcnRzID0gdHJpbShmcm9tLnNwbGl0KCcvJykpO1xuICB2YXIgdG9QYXJ0cyA9IHRyaW0odG8uc3BsaXQoJy8nKSk7XG5cbiAgdmFyIGxlbmd0aCA9IE1hdGgubWluKGZyb21QYXJ0cy5sZW5ndGgsIHRvUGFydHMubGVuZ3RoKTtcbiAgdmFyIHNhbWVQYXJ0c0xlbmd0aCA9IGxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmIChmcm9tUGFydHNbaV0gIT09IHRvUGFydHNbaV0pIHtcbiAgICAgIHNhbWVQYXJ0c0xlbmd0aCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICB2YXIgb3V0cHV0UGFydHMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IHNhbWVQYXJ0c0xlbmd0aDsgaSA8IGZyb21QYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFBhcnRzLnB1c2goJy4uJyk7XG4gIH1cblxuICBvdXRwdXRQYXJ0cyA9IG91dHB1dFBhcnRzLmNvbmNhdCh0b1BhcnRzLnNsaWNlKHNhbWVQYXJ0c0xlbmd0aCkpO1xuXG4gIHJldHVybiBvdXRwdXRQYXJ0cy5qb2luKCcvJyk7XG59O1xuXG5leHBvcnRzLnNlcCA9ICcvJztcbmV4cG9ydHMuZGVsaW1pdGVyID0gJzonO1xuXG5leHBvcnRzLmRpcm5hbWUgPSBmdW5jdGlvbihwYXRoKSB7XG4gIHZhciByZXN1bHQgPSBzcGxpdFBhdGgocGF0aCksXG4gICAgICByb290ID0gcmVzdWx0WzBdLFxuICAgICAgZGlyID0gcmVzdWx0WzFdO1xuXG4gIGlmICghcm9vdCAmJiAhZGlyKSB7XG4gICAgLy8gTm8gZGlybmFtZSB3aGF0c29ldmVyXG4gICAgcmV0dXJuICcuJztcbiAgfVxuXG4gIGlmIChkaXIpIHtcbiAgICAvLyBJdCBoYXMgYSBkaXJuYW1lLCBzdHJpcCB0cmFpbGluZyBzbGFzaFxuICAgIGRpciA9IGRpci5zdWJzdHIoMCwgZGlyLmxlbmd0aCAtIDEpO1xuICB9XG5cbiAgcmV0dXJuIHJvb3QgKyBkaXI7XG59O1xuXG5cbmV4cG9ydHMuYmFzZW5hbWUgPSBmdW5jdGlvbihwYXRoLCBleHQpIHtcbiAgdmFyIGYgPSBzcGxpdFBhdGgocGF0aClbMl07XG4gIC8vIFRPRE86IG1ha2UgdGhpcyBjb21wYXJpc29uIGNhc2UtaW5zZW5zaXRpdmUgb24gd2luZG93cz9cbiAgaWYgKGV4dCAmJiBmLnN1YnN0cigtMSAqIGV4dC5sZW5ndGgpID09PSBleHQpIHtcbiAgICBmID0gZi5zdWJzdHIoMCwgZi5sZW5ndGggLSBleHQubGVuZ3RoKTtcbiAgfVxuICByZXR1cm4gZjtcbn07XG5cblxuZXhwb3J0cy5leHRuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gc3BsaXRQYXRoKHBhdGgpWzNdO1xufTtcblxuZnVuY3Rpb24gZmlsdGVyICh4cywgZikge1xuICAgIGlmICh4cy5maWx0ZXIpIHJldHVybiB4cy5maWx0ZXIoZik7XG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGYoeHNbaV0sIGksIHhzKSkgcmVzLnB1c2goeHNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzO1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnN1YnN0ciAtIG5lZ2F0aXZlIGluZGV4IGRvbid0IHdvcmsgaW4gSUU4XG52YXIgc3Vic3RyID0gJ2FiJy5zdWJzdHIoLTEpID09PSAnYidcbiAgICA/IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHsgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbikgfVxuICAgIDogZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbikge1xuICAgICAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IHN0ci5sZW5ndGggKyBzdGFydDtcbiAgICAgICAgcmV0dXJuIHN0ci5zdWJzdHIoc3RhcnQsIGxlbik7XG4gICAgfVxuO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiBmcm9tIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9tYWtjL3NwaW5lLXJ1bnRpbWVzL3RocmVlLmpzL3NwaW5lLXRocmVlanMvZXhhbXBsZS9pbmRleC5odG1sICovXHJcbnZhciBsb2FkVGV4dCA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XHJcbiAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCAoKTtcclxuICByZXEub3BlbiAoXCJHRVRcIiwgdXJsLCB0cnVlKTtcclxuICByZXEucmVzcG9uc2VUeXBlID0gJ3RleHQnO1xyXG4gIHJlcS5hZGRFdmVudExpc3RlbmVyICgnZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpIHt9LCBmYWxzZSk7XHJcbiAgcmVxLmFkZEV2ZW50TGlzdGVuZXIgKCdhYm9ydCcsIGZ1bmN0aW9uIChldmVudCkge30sIGZhbHNlKTtcclxuICByZXEuYWRkRXZlbnRMaXN0ZW5lciAoJ2xvYWQnLCBmdW5jdGlvbiAoZXZlbnQpIHsgY2FsbGJhY2sgKHJlcS5yZXNwb25zZSk7IH0sIGZhbHNlKTtcclxuICByZXEuc2VuZCAoKTtcclxuICByZXR1cm4gcmVxO1xyXG59O1xyXG5cclxudmFyIGxvYWRJbWFnZSA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XHJcbiAgdmFyIGltYWdlID0gbmV3IEltYWdlICgpO1xyXG4gIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIgKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudCkge30sIGZhbHNlKTtcclxuICBpbWFnZS5hZGRFdmVudExpc3RlbmVyICgnYWJvcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHt9LCBmYWxzZSk7XHJcbiAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciAoJ2xvYWQnLCBmdW5jdGlvbiAoZXZlbnQpIHsgY2FsbGJhY2sgKGltYWdlKTsgfSwgZmFsc2UpO1xyXG4gIGltYWdlLnNyYyA9IHVybDtcclxuICByZXR1cm4gaW1hZ2U7XHJcbn07XHJcblxyXG52YXIgU3BpbmVBbmltYXRpb24gPSBmdW5jdGlvbiAoYW5pbWF0aW9uLCBwYXRoLCBzY2FsZSkge1xyXG5cclxuICBUSFJFRS5PYmplY3QzRC5jYWxsICh0aGlzKTtcclxuXHJcbiAgdGhpcy5uYW1lID0gYW5pbWF0aW9uO1xyXG5cclxuICBwYXRoID0gcGF0aCA/IChwYXRoICtcclxuICAgICgocGF0aC5zdWJzdHIoLTEpICE9ICcvJykgPyAnLycgOiAnJylcclxuICApIDogJyc7XHJcblxyXG4gIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgbG9hZFRleHQgKHBhdGggKyBhbmltYXRpb24gKyAnLmF0bGFzJywgZnVuY3Rpb24gKGF0bGFzVGV4dCkge1xyXG4gICAgc2VsZi5hdGxhcyA9IG5ldyBzcGluZS5BdGxhcyhhdGxhc1RleHQsIHtcclxuICAgICAgbG9hZDogZnVuY3Rpb24gKHBhZ2UsIGltYWdlLCBhdGxhcykge1xyXG4gICAgICAgIGxvYWRJbWFnZSAocGF0aCArIGltYWdlLCBmdW5jdGlvbiAoaW1hZ2UpIHtcclxuICAgICAgICAgIC8vIGNhbGN1bGF0ZSBVVnMgaW4gYXRsYXMgcmVnaW9uc1xyXG4gICAgICAgICAgcGFnZS53aWR0aCA9IGltYWdlLndpZHRoO1xyXG4gICAgICAgICAgcGFnZS5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcblxyXG4gICAgICAgICAgYXRsYXMudXBkYXRlVVZzIChwYWdlKTtcclxuXHJcbiAgICAgICAgICAvLyBwcm9wYWdhdGUgbmV3IFVWcyB0byBhdHRhY2htZW50cywgaWYgdGhleSB3ZXJlIGFscmVhZHkgY3JlYXRlZFxyXG4gICAgICAgICAgaWYgKHNlbGYuc2tlbGV0b24pIHtcclxuICAgICAgICAgICAgdmFyIHNraW5zID0gc2VsZi5za2VsZXRvbi5kYXRhLnNraW5zO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBzID0gMCwgbiA9IHNraW5zLmxlbmd0aDsgcyA8IG47IHMrKykge1xyXG4gICAgICAgICAgICAgIHZhciBhdHRhY2htZW50cyA9IHNraW5zW3NdLmF0dGFjaG1lbnRzO1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gYXR0YWNobWVudHMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBhdHRhY2htZW50ID0gYXR0YWNobWVudHNba107XHJcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNobWVudCBpbnN0YW5jZW9mIHNwaW5lLlJlZ2lvbkF0dGFjaG1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgdmFyIHJlZ2lvbiA9IGF0dGFjaG1lbnQucmVuZGVyZXJPYmplY3Q7XHJcbiAgICAgICAgICAgICAgICAgIGF0dGFjaG1lbnQuc2V0VVZzIChyZWdpb24udSwgcmVnaW9uLnYsIHJlZ2lvbi51MiwgcmVnaW9uLnYyLCByZWdpb24ucm90YXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBjcmVhdGUgYmFzaWMgbWF0ZXJpYWwgZm9yIHRoZSBwYWdlXHJcbiAgICAgICAgICB2YXIgdGV4dHVyZSA9IG5ldyBUSFJFRS5UZXh0dXJlIChpbWFnZSk7XHJcbiAgICAgICAgICB0ZXh0dXJlLm5lZWRzVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICBwYWdlLnJlbmRlcmVyT2JqZWN0ID0gW1xyXG4gICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwgKHtcclxuICAgICAgICAgICAgICAvL2NvbG9yOiAweGZmMDAsIHdpcmVmcmFtZTogdHJ1ZSxcclxuICAgICAgICAgICAgICBtYXAgOiB0ZXh0dXJlLCBzaWRlIDogVEhSRUUuRG91YmxlU2lkZSwgdHJhbnNwYXJlbnQgOiB0cnVlLCBhbHBoYVRlc3QgOiAwLjVcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIF07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHVubG9hZDogZnVuY3Rpb24gKG1hdGVyaWFscykge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gbWF0ZXJpYWxzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgdmFyIG1hdGVyaWFsID0gbWF0ZXJpYWxzW2ldO1xyXG4gICAgICAgICAgaWYgKG1hdGVyaWFsLm1lc2hlcykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIG1hdGVyaWFsLm1lc2hlcykge1xyXG4gICAgICAgICAgICAgIHZhciBtZXNoID0gbWF0ZXJpYWwubWVzaGVzW25hbWVdO1xyXG4gICAgICAgICAgICAgIGlmIChtZXNoLnBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgbWVzaC5wYXJlbnQucmVtb3ZlIChtZXNoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgbWVzaC5nZW9tZXRyeS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG1hdGVyaWFsLm1hcC5kaXNwb3NlKCk7XHJcbiAgICAgICAgICBtYXRlcmlhbC5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHdpbGwgYmUgY2FsbGVkIG11bHRpcGxlIHRpbWVzXHJcbiAgICAgICAgbWF0ZXJpYWxzLmxlbmd0aCA9IDA7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGxvYWRUZXh0IChwYXRoICsgYW5pbWF0aW9uICsgJy5qc29uJywgZnVuY3Rpb24gKHNrZWxldG9uVGV4dCkge1xyXG4gICAgICB2YXIganNvbiA9IG5ldyBzcGluZS5Ta2VsZXRvbkpzb24gKG5ldyBzcGluZS5BdGxhc0F0dGFjaG1lbnRMb2FkZXIgKHNlbGYuYXRsYXMpKTtcclxuICAgICAganNvbi5zY2FsZSA9IHNjYWxlIHx8IDE7XHJcblxyXG4gICAgICB2YXIgc2tlbGV0b25EYXRhID0ganNvbi5yZWFkU2tlbGV0b25EYXRhIChKU09OLnBhcnNlIChza2VsZXRvblRleHQpKTtcclxuXHJcbiAgICAgIHNlbGYuc2tlbGV0b24gPSBuZXcgc3BpbmUuU2tlbGV0b24gKHNrZWxldG9uRGF0YSk7XHJcbiAgICAgIHNlbGYuc3RhdGVEYXRhID0gbmV3IHNwaW5lLkFuaW1hdGlvblN0YXRlRGF0YSAoc2tlbGV0b25EYXRhKTsgIFxyXG4gICAgICBzZWxmLnN0YXRlID0gbmV3IHNwaW5lLkFuaW1hdGlvblN0YXRlIChzZWxmLnN0YXRlRGF0YSk7XHJcblxyXG4gICAgICBzZWxmLmRpc3BhdGNoRXZlbnQoe1xyXG4gICAgICAgIHR5cGUgOiBTcGluZUFuaW1hdGlvbi5TS0VMRVRPTl9EQVRBX0xPQURFRFxyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICB2YXIgbWF0cml4ID0gbmV3IFRIUkVFLk1hdHJpeDQgKCk7XHJcblxyXG4gIC8vIGlmIGdpdmVuLCBkdCBtdXN0IGJlIGluIG1zXHJcblxyXG4gIHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKGR0LCBkeikge1xyXG4gICAgaWYgKCF0aGlzLnN0YXRlKSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5zdGF0ZS51cGRhdGUgKGR0IHx8ICgxLjAgLyA2MCkpO1xyXG4gICAgdGhpcy5zdGF0ZS5hcHBseSAodGhpcy5za2VsZXRvbik7XHJcbiAgICB0aGlzLnNrZWxldG9uLnVwZGF0ZVdvcmxkVHJhbnNmb3JtICgpO1xyXG5cclxuICAgIHRoaXMudHJhdmVyc2UgKGZ1bmN0aW9uIChvYmplY3QpIHtcclxuICAgICAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLk1lc2gpIHtcclxuICAgICAgICBvYmplY3QudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgWiA9IDA7XHJcbiAgICB2YXIgZHJhd09yZGVyID0gdGhpcy5za2VsZXRvbi5kcmF3T3JkZXI7XHJcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IGRyYXdPcmRlci5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgdmFyIHNsb3QgPSBkcmF3T3JkZXJbaV07XHJcbiAgICAgIHZhciBhdHRhY2htZW50ID0gc2xvdC5hdHRhY2htZW50O1xyXG4gICAgICBpZiAoIShhdHRhY2htZW50IGluc3RhbmNlb2Ygc3BpbmUuUmVnaW9uQXR0YWNobWVudCkpIGNvbnRpbnVlO1xyXG5cclxuICAgICAgdmFyIG1hdGVyaWFscyA9IGF0dGFjaG1lbnQucmVuZGVyZXJPYmplY3QucGFnZS5yZW5kZXJlck9iamVjdDtcclxuICAgICAgaWYgKCFtYXRlcmlhbHMpIHtcclxuICAgICAgICAvLyB0ZXh0dXJlIHdhcyBub3QgbG9hZGVkIHlldFxyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2xvdC5kYXRhLmFkZGl0aXZlQmxlbmRpbmcgJiYgKG1hdGVyaWFscy5sZW5ndGggPT0gMSkpIHtcclxuICAgICAgICAvLyBjcmVhdGUgc2VwYXJhdGUgbWF0ZXJpYWwgZm9yIGFkZGl0aXZlIGJsZW5kaW5nXHJcbiAgICAgICAgbWF0ZXJpYWxzLnB1c2ggKG5ldyBUSFJFRS5NZXNoQmFzaWNNYXRlcmlhbCAoe1xyXG4gICAgICAgICAgbWFwIDogbWF0ZXJpYWxzWzBdLm1hcCxcclxuICAgICAgICAgIHNpZGUgOiBUSFJFRS5Eb3VibGVTaWRlLFxyXG4gICAgICAgICAgdHJhbnNwYXJlbnQgOiB0cnVlLFxyXG4gICAgICAgICAgYmxlbmRpbmcgOiBUSFJFRS5BZGRpdGl2ZUJsZW5kaW5nLFxyXG4gICAgICAgICAgZGVwdGhXcml0ZSA6IGZhbHNlXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgbWF0ZXJpYWwgPSBtYXRlcmlhbHNbIHNsb3QuZGF0YS5hZGRpdGl2ZUJsZW5kaW5nID8gMSA6IDAgXTtcclxuXHJcbiAgICAgIG1hdGVyaWFsLm1lc2hlcyA9IG1hdGVyaWFsLm1lc2hlcyB8fCB7fTtcclxuXHJcbiAgICAgIHZhciBtZXNoID0gbWF0ZXJpYWwubWVzaGVzW3Nsb3QuZGF0YS5uYW1lXTtcclxuXHJcbiAgICAgIHZhciBnZW9tZXRyeTtcclxuXHJcbiAgICAgIGlmIChtZXNoKSB7XHJcbiAgICAgICAgZ2VvbWV0cnkgPSBtZXNoLmdlb21ldHJ5O1xyXG5cclxuICAgICAgICBtZXNoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkgKFxyXG4gICAgICAgICAgYXR0YWNobWVudC5yZWdpb25PcmlnaW5hbFdpZHRoLFxyXG4gICAgICAgICAgYXR0YWNobWVudC5yZWdpb25PcmlnaW5hbEhlaWdodFxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIGdlb21ldHJ5LmR5bmFtaWMgPSB0cnVlO1xyXG5cclxuICAgICAgICBtZXNoID0gbmV3IFRIUkVFLk1lc2ggKGdlb21ldHJ5LCBtYXRlcmlhbCk7XHJcblxyXG4gICAgICAgIG1hdGVyaWFsLm1lc2hlc1tzbG90LmRhdGEubmFtZV0gPSBtZXNoO1xyXG5cclxuICAgICAgICBtZXNoLm1hdHJpeEF1dG9VcGRhdGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGQgKG1lc2gpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobWVzaC5hdHRhY2htZW50VGltZSAmJiAoc2xvdC5nZXRBdHRhY2htZW50VGltZSAoKSA+IG1lc2guYXR0YWNobWVudFRpbWUpKSB7XHJcbiAgICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHVwZGF0ZSBVVnNcclxuICAgICAgICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdWzBdLnNldCAoYXR0YWNobWVudC51dnNbNl0sIDEtIGF0dGFjaG1lbnQudXZzWzddKTtcclxuICAgICAgICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdWzFdLnNldCAoYXR0YWNobWVudC51dnNbNF0sIDEtIGF0dGFjaG1lbnQudXZzWzVdKTtcclxuICAgICAgICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzBdWzJdLnNldCAoYXR0YWNobWVudC51dnNbMF0sIDEtIGF0dGFjaG1lbnQudXZzWzFdKTtcclxuICAgICAgICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzFdWzBdLnNldCAoYXR0YWNobWVudC51dnNbNF0sIDEtIGF0dGFjaG1lbnQudXZzWzVdKTtcclxuICAgICAgICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzFdWzFdLnNldCAoYXR0YWNobWVudC51dnNbMl0sIDEtIGF0dGFjaG1lbnQudXZzWzNdKTtcclxuICAgICAgICBnZW9tZXRyeS5mYWNlVmVydGV4VXZzWzBdWzFdWzJdLnNldCAoYXR0YWNobWVudC51dnNbMF0sIDEtIGF0dGFjaG1lbnQudXZzWzFdKTtcclxuICAgICAgICBnZW9tZXRyeS51dnNOZWVkVXBkYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgZ2VvbWV0cnkudmVydGljZXNbMV0uc2V0IChhdHRhY2htZW50Lm9mZnNldFswXSwgYXR0YWNobWVudC5vZmZzZXRbMV0sIDApO1xyXG4gICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzWzNdLnNldCAoYXR0YWNobWVudC5vZmZzZXRbMl0sIGF0dGFjaG1lbnQub2Zmc2V0WzNdLCAwKTtcclxuICAgICAgICBnZW9tZXRyeS52ZXJ0aWNlc1syXS5zZXQgKGF0dGFjaG1lbnQub2Zmc2V0WzRdLCBhdHRhY2htZW50Lm9mZnNldFs1XSwgMCk7XHJcbiAgICAgICAgZ2VvbWV0cnkudmVydGljZXNbMF0uc2V0IChhdHRhY2htZW50Lm9mZnNldFs2XSwgYXR0YWNobWVudC5vZmZzZXRbN10sIDApO1xyXG4gICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIG1lc2guYXR0YWNobWVudFRpbWUgPSBzbG90LmdldEF0dGFjaG1lbnRUaW1lICgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtYXRyaXgubWFrZVRyYW5zbGF0aW9uIChcclxuICAgICAgICB0aGlzLnNrZWxldG9uLnggKyBzbG90LmJvbmUud29ybGRYLFxyXG4gICAgICAgIHRoaXMuc2tlbGV0b24ueSArIHNsb3QuYm9uZS53b3JsZFksXHJcbiAgICAgICAgKGR6IHx8IDAuMSkgKiAoWiArPSAwLjAwMSlcclxuICAgICAgKTtcclxuXHJcbiAgICAgIG1hdHJpeC5lbGVtZW50c1swXSA9IHNsb3QuYm9uZS5tMDA7IG1hdHJpeC5lbGVtZW50c1s0XSA9IHNsb3QuYm9uZS5tMDE7XHJcbiAgICAgIG1hdHJpeC5lbGVtZW50c1sxXSA9IHNsb3QuYm9uZS5tMTA7IG1hdHJpeC5lbGVtZW50c1s1XSA9IHNsb3QuYm9uZS5tMTE7XHJcblxyXG4gICAgICBtZXNoLm1hdHJpeC5jb3B5IChtYXRyaXgpO1xyXG5cclxuICAgICAgLyogVE9ETyBzbG90LnIsZyxiLGEgPz8gdHVyYnVsZW56IGV4YW1wbGUgY29kZTpcclxuICAgICAgYmF0Y2guYWRkKFxyXG4gICAgICAgIGF0dGFjaG1lbnQucmVuZGVyZXJPYmplY3QucGFnZS5yZW5kZXJlck9iamVjdCxcclxuICAgICAgICB2ZXJ0aWNlc1swXSwgdmVydGljZXNbMV0sXHJcbiAgICAgICAgdmVydGljZXNbNl0sIHZlcnRpY2VzWzddLFxyXG4gICAgICAgIHZlcnRpY2VzWzJdLCB2ZXJ0aWNlc1szXSxcclxuICAgICAgICB2ZXJ0aWNlc1s0XSwgdmVydGljZXNbNV0sXHJcbiAgICAgICAgc2tlbGV0b24uciAqIHNsb3QucixcclxuICAgICAgICBza2VsZXRvbi5nICogc2xvdC5nLFxyXG4gICAgICAgIHNrZWxldG9uLmIgKiBzbG90LmIsXHJcbiAgICAgICAgc2tlbGV0b24uYSAqIHNsb3QuYSxcclxuICAgICAgICBhdHRhY2htZW50LnV2c1swXSwgYXR0YWNobWVudC51dnNbMV0sXHJcbiAgICAgICAgYXR0YWNobWVudC51dnNbNF0sIGF0dGFjaG1lbnQudXZzWzVdXHJcbiAgICAgICk7XHJcbiAgICAgICovXHJcbiAgICB9XHJcblxyXG4gIH07XHJcbn07XHJcblxyXG5TcGluZUFuaW1hdGlvbi5TS0VMRVRPTl9EQVRBX0xPQURFRCA9ICdza2VsZXRvbkRhdGFMb2FkZWQnO1xyXG5cclxuU3BpbmVBbmltYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSAoVEhSRUUuT2JqZWN0M0QucHJvdG90eXBlKTtcclxuXHJcblNwaW5lQW5pbWF0aW9uLnByb3RvdHlwZS5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xyXG4gIGlmICh0aGlzLnBhcmVudCkgdGhpcy5wYXJlbnQucmVtb3ZlICh0aGlzKTsgdGhpcy5hdGxhcy5kaXNwb3NlICgpO1xyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU3BpbmVBbmltYXRpb247XHJcbiJdfQ==
