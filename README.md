# Spine for A-Frame
This library enables support for Spine in the a-frame framework as a component.

## Quick Start
Toss a reference to a-frame, the Spine runtime, and spine-frame into your HTML file.

```html
<script type="text/javascript" src="a-frame.js"></script>
<script type="text/javascript" src="spine.js"></script>
<script type="text/javascript" src="spine-frame.js"></script>
```

This enables the spine component. You can use this to reference spine assets.

```html
<a-scene> 
  <a-entity spine="src: data/spineboy;animation: walk"></a-entity>
</a-scene>
```

## Example
http://joshgalvin.github.io/SpineFrame/examples/basic.html
