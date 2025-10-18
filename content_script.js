(function(){
  function collectImages() {
    const imgs = Array.from(document.images || []);
    return imgs.map(img => {
      const src = img.currentSrc || img.src || null;
      return {
        src,
        alt: img.alt || '',
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0
      };
    }).filter(i => i.src);
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'GET_IMAGES') {
      sendResponse({images: collectImages()});
    } else if (msg.type === 'DOWNLOAD_IMAGE') {
      const a = document.createElement('a');
      a.href = msg.url;
      a.download = msg.filename || 'image';
      document.body.appendChild(a);
      a.click();
      a.remove();
      sendResponse({ok:true});
    }
    return true;
  });
})();
