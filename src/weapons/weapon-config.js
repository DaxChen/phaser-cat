// currently we use the assets 'key' to determine which bullet it is
export const ATK = {
  fireball_normal: 10,
  fireball_charged: 20,
  fireball_super: 40
}

let bulletUID = 1
export function getBulletUID () { return bulletUID++ }
