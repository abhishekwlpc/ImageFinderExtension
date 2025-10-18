document.addEventListener('DOMContentLoaded', async () => {
  const list = document.getElementById('list');
  const visionKeyInput = document.getElementById('visionKey');

  const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
  chrome.tabs.sendMessage(tab.id, {type: 'GET_IMAGES'}, (resp) => {
    const imgs = (resp && resp.images) || [];
    list.innerHTML = '';
    if (!imgs.length) {
      list.textContent = 'No images found on this page.';
      return;
    }

    imgs.forEach((img, idx) => {
      const row = document.createElement('div');
      row.className = 'img-row';

      const thumb = document.createElement('img');
      thumb.className = 'thumb';
      thumb.src = img.src;

      const info = document.createElement('div');
      info.className='info';
      info.innerHTML = `<strong>${img.alt || ('Image ' + (idx+1))}</strong><br>${img.width}×${img.height}`;

      const dlBtn = document.createElement('button');
      dlBtn.textContent = 'Download';
      dlBtn.onclick = () => {
        chrome.tabs.sendMessage(tab.id, {type:'DOWNLOAD_IMAGE', url: img.src, filename: null});
      };

      const detailBtn = document.createElement('button');
      detailBtn.textContent = 'Get Details';
      detailBtn.onclick = () => {
        const key = visionKeyInput.value.trim();
        chrome.runtime.sendMessage({type:'VISION_ANALYZE', url: img.src, apiKey: key}, (resp) => {
          if (resp?.result) {
            const out = JSON.stringify(resp.result, null, 2);
            const w = window.open("", "_blank");
            w.document.write(`<pre>${out}</pre>`);
          } else {
            alert(resp?.error || 'Error fetching details');
          }
        });
      };

      row.appendChild(thumb);
      row.appendChild(info);
      row.appendChild(dlBtn);
      row.appendChild(detailBtn);
      list.appendChild(row);
    });
  });
});
