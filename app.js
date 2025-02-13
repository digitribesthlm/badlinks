async function loadData() {
    try {
        const response = await fetch('data/www_links_20250213_143022.json');
        const data = await response.json();
        renderPages(data);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function renderPages(data) {
    const container = document.getElementById('pages-container');
    
    data.forEach(pageData => {
        const pageGroup = document.createElement('div');
        pageGroup.className = 'page-group';
        
        // Create page URL header
        const pageUrl = document.createElement('div');
        pageUrl.className = 'page-url';
        pageUrl.textContent = `Page: ${pageData.page_url}`;
        
        pageGroup.appendChild(pageUrl);
        
        // Create redirect items
        pageData.links.forEach(link => {
            const redirectItem = document.createElement('div');
            redirectItem.className = 'redirect-item';
            
            // Check if the URL needs updating
            const needsUpdate = link.url !== link.final_url;
            if (!needsUpdate) {
                redirectItem.classList.add('fixed');
            }
            
            // Create status badge
            const status = document.createElement('span');
            status.className = `status-badge ${needsUpdate ? 'status-bad' : 'status-good'}`;
            status.textContent = needsUpdate ? 'Needs Update' : 'Updated';
            
            // Create URL information
            const urlInfo = document.createElement('div');
            urlInfo.className = 'url-info';
            urlInfo.innerHTML = `
                <div><strong>Original URL:</strong> ${link.url}</div>
                <div><strong>Final URL:</strong> ${link.final_url}</div>
                <div class="anchor-text"><strong>Anchor Text:</strong> ${link.anchor_text}</div>
            `;
            
            redirectItem.appendChild(status);
            redirectItem.appendChild(urlInfo);
            pageGroup.appendChild(redirectItem);
        });
        
        container.appendChild(pageGroup);
    });
}

// Load data when the page loads
document.addEventListener('DOMContentLoaded', loadData); 