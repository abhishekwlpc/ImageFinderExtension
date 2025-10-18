export function filterImages(images) {
    return images.filter(img => {
        const width = img.width || 0;
        const height = img.height || 0;
        return width >= 100 && height >= 100;
    });
}
