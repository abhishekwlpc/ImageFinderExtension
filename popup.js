document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // Extract the best possible URL
      const getBestImageURL = (img) => {
        let url = img.src;

        // 1️⃣ Try srcset (find largest width)
        if (img.srcset) {
          const candidates = img.srcset.split(",").map(s => {
            const parts = s.trim().split(" ");
            return { url: parts[0], width: parseInt(parts[1]) || 0 };
          });
          candidates.sort((a, b) => b.width - a.width);
          if (candidates.length > 0) url = candidates[0].url;
        }

        // 2️⃣ Common lazy-load attributes
        const dataAttrs = ["data-src", "data-original", "data-full", "data-large", "data-hires"];
        for (const attr of dataAttrs) {
          if (img.getAttribute(attr)) {
            url = img.getAttribute(attr);
            break;
          }
        }

        // 3️⃣ Try parent anchor <a href> if it's an image link
        const parentLink = img.closest("a");
        if (parentLink && parentLink.href && !parentLink.href.includes("google.com")) {
          url = parentLink.href;
        }

        // 4️⃣ Try to remove size/quality parameters from URL
        url = url.replace(/([?&])(w|width|h|height|size|quality)=\d+/gi, "");
        return url;
      };

      return Array.from(document.images)
          .map(img => ({
            src: getBestImageURL(img),
            width: img.naturalWidth,
            height: img.naturalHeight,
            alt: img.alt || img.title || img.src.split('/').pop(),
            visible: img.offsetParent !== null
          }))
          // Filter visible + meaningful images only
          .filter(img =>
              img.visible &&
              img.width >= 150 &&
              img.height >= 150 &&
              !img.src.includes("sprite") &&
              !img.src.includes("icon") &&
              !img.src.includes("logo") &&
              !img.src.includes("favicon") &&
              !img.src.startsWith("data:image")
          );
    },
  }, (results) => {
    const images = results[0].result;
    const container = document.getElementById("images");

    if (images.length === 0) {
      container.innerHTML = "<p>No suitable high-quality images found.</p>";
      return;
    }

    images.forEach(({ src, width, height, alt }) => {
      const wrapper = document.createElement("div");
      wrapper.className = "image-item";

      const img = document.createElement("img");
      img.src = src;
      img.title = `${width}x${height}`;
      img.addEventListener("click", () => {
        chrome.downloads.download({ url: src });
      });

      const title = document.createElement("div");
      title.className = "image-title";
      title.textContent = alt.length > 25 ? alt.substring(0, 25) + "..." : alt;

      wrapper.appendChild(img);
      wrapper.appendChild(title);
      container.appendChild(wrapper);
    });

    document.getElementById("downloadAll").addEventListener("click", () => {
      images.forEach(({ src }) => {
        chrome.downloads.download({ url: src });
      });
    });
  });
});
