document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      return Array.from(document.images).map(img => img.src);
    },
  }, (results) => {
    const urls = results[0].result;
    const container = document.getElementById("images");

    urls.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.addEventListener("click", () => {
        chrome.downloads.download({ url });
      });
      container.appendChild(img);
    });

    document.getElementById("downloadAll").addEventListener("click", () => {
      urls.forEach(url => {
        chrome.downloads.download({ url });
      });
    });
  });
});
