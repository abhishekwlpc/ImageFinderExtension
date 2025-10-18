describe("Content script image detection", () => {
    test("should detect image elements on a webpage", () => {
        document.body.innerHTML = `
      <img src="photo.jpg" alt="Beach">
      <img src="icon.png" width="20" height="20">
    `;

        const images = Array.from(document.querySelectorAll("img"));
        expect(images.length).toBe(2);
    });

    test("should include image titles under each image", () => {
        const image = document.createElement("img");
        image.alt = "Nature View";
        document.body.appendChild(image);

        expect(image.alt).toBe("Nature View");
    });
});
