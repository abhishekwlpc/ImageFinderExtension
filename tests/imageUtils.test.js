const { filterImages } = require("./imageUtils.js");

describe("Image filtering", () => {
    test("should filter out small icons", () => {
        const images = [
            { width: 16, height: 16 },
            { width: 48, height: 48 },
            { width: 200, height: 300 }
        ];

        const result = filterImages(images);
        expect(result.length).toBe(1);
        expect(result[0].width).toBe(200);
    });

    test("should keep only meaningful images", () => {
        const images = [
            { width: 120, height: 100 },
            { width: 90, height: 90 }
        ];

        const result = filterImages(images);
        expect(result.length).toBe(1);
    });
});
