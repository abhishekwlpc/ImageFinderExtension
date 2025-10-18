import { filterImages } from "../imageUtils.js";

describe("Image filtering", () => {
    test("should filter out small icons", () => {
        const images = [
            { width: 100, height: 100 },
            { width: 10, height: 10 },
        ];
        const result = filterImages(images);
        expect(result.length).toBe(1);
    });
});
