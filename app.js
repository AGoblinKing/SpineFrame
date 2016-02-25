import SpineAnimation from './spine-animation';
import path from 'path';

spine.Bone.yDown = false;
AFRAME.registerComponent('spine', {
  schema: {
    src: { default: '' },
    animation: { default: '' },
    scale: { default: 0.005 }
  },

  init() {
    this.spineAnim = null;
    this.state = null;
  },

  update(oldData) {
    if (!oldData || this.data.src !== oldData.src) {
      const name = path.basename(this.data.src);
      const dir = path.dirname(this.data.src);

      this.spineAnim = new SpineAnimation(name, dir, this.data.scale);
      this.spineAnim.addEventListener(SpineAnimation.SKELETON_DATA_LOADED, this.loaded.bind(this));
      this.el.object3D.add(this.spineAnim);
      this.state = 'LOADING';
    }
  },

  loaded() {
    this.spineAnim.state.setAnimationByName(0, this.data.animation, true);
    this.state = 'READY';
  },

  tick() {
    this.spineAnim.update();
  },

  remove() {
    if (this.spineAnim) {
      this.spineAnim.dispose();
    }
  }
});

