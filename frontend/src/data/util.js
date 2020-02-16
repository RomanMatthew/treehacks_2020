export function identifier2d(x, y) {
    return ((x + 0x3FFFFF) << 24) | (y + 0x3FFFFF);
}