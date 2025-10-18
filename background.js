async function fetchArrayBuffer(url) {
  const resp = await fetch(url, {mode: 'cors'});
  if (!resp.ok) throw new Error('Fetch failed: ' + resp.status);
  return await resp.arrayBuffer();
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'VISION_ANALYZE') {
    (async () => {
      try {
        if (!msg.apiKey) {
          sendResponse({error:'No API key provided.'});
          return;
        }
        const arr = await fetchArrayBuffer(msg.url);
        const b64 = arrayBufferToBase64(arr);
        const body = {
          requests: [
            {
              image: { content: b64 },
              features: [{ type: "LABEL_DETECTION", maxResults: 5 }]
            }
          ]
        };

        const resp = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${msg.apiKey}`,
            { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) }
        );
        const json = await resp.json();
        sendResponse({result: json});
      } catch (err) {
        sendResponse({error: err.message});
      }
    })();
    return true; // async
  }
});
