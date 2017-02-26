export const centerGameObjects = (objects) => {
  objects.forEach(function (object) {
    object.anchor.setTo(0.5)
  })
}

import { gridsize } from './config'
export const snapToGrid = x => Math.round(x / gridsize) * gridsize
