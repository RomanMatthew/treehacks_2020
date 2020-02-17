export default class ImageLayer {
    constructor() {
        this.images = [];
    }

    addImage(url, x, y, w, h) {
        let img = new Image();
        img.src = url;
        this.images.push({
            image: img,
            x: x,
            y: y,
            w: w,
            h: h,
        });
    }

    drawToContext(context, x1, y1, x2, y2) {
        let screenWidth = context.canvas.width;
        let screenHeight = context.canvas.height;
        let screenXPerPixel = screenWidth / (x2 - x1);
        let screenYPerPixel = screenHeight / (y2 - y1);

        context.imageSmoothingEnabled = true;
        for (let image of this.images) {
            context.drawImage(
                image.image, 
                (image.x - x1) * screenXPerPixel,
                (image.y - y1) * screenYPerPixel,
                image.w * screenXPerPixel,
                image.h * screenYPerPixel,
            );
        }
    }
}