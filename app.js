const API_URL = 'https://script.google.com/macros/s/AKfycby-Dv9n7SeNvUYeMNgtPQfUJeon1YuEUuxwWgqax3DQ8eJMvfa-SiA3lZs6NqdywGazDQ/exec';
const ADS_DATA_URL = 'ads_data.json'; // Local JSON updated by PS script

let platformChartInstance = null;
let pillarChartInstance = null;
let currentTab = 'overview';

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();

    document.getElementById('refresh-btn').addEventListener('click', () => {
        if(currentTab === 'overview') fetchDashboardData();
        else fetchAdsData();
    });
});

window.switchTab = function(tab) {
    currentTab = tab;
    
    // Update nav classes
    document.getElementById('nav-overview').classList.remove('active');
    document.getElementById('nav-ads').classList.remove('active');
    document.getElementById('nav-' + tab).classList.add('active');
    
    // Toggle visibility
    document.getElementById('overview-body').classList.add('hidden');
    document.getElementById('ads-body').classList.add('hidden');
    document.getElementById(tab + '-body').classList.remove('hidden');
    
    // Update title
    document.getElementById('page-title').innerText = tab === 'overview' ? 'Tổng Quan Nội Dung' : 'Phân Tích Báo Cáo Ads';
    
    if (tab === 'overview') fetchDashboardData();
    else fetchAdsData();
}

async function fetchDashboardData() {
    const loader = document.getElementById('loader');
    const body = document.getElementById('overview-body');
    
    loader.classList.remove('hidden');
    body.classList.add('hidden');

    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        processOverviewData(result.rows);
    } catch (error) {
        console.error("Fetch error:", error);
    } finally {
        loader.classList.add('hidden');
        if(currentTab === 'overview') body.classList.remove('hidden');
    }
}

async function fetchAdsData() {
    const loader = document.getElementById('loader');
    const body = document.getElementById('ads-body');
    
    loader.classList.remove('hidden');
    body.classList.add('hidden');

    try {
        // Cần chạy HTTP server hoặc Fetch file local
        const response = await fetch(ADS_DATA_URL + '?t=' + new Date().getTime());
        const data = await response.json();
        processAdsData(data);
    } catch (error) {
        console.error("Fetch Ads error:", error);
        alert("Không tìm thấy dữ liệu Ads (ads_data.json). Vui lòng đảm bảo script fb_ads_sync đã chạy thành công.");
    } finally {
        loader.classList.add('hidden');
        if(currentTab === 'ads') body.classList.remove('hidden');
    }
}

function processOverviewData(rows) {
    if (!rows || rows.length <= 1) return;
    const dataRows = rows.slice(1);
    
    const totalPosts = dataRows.length;
    const publishedPosts = dataRows.filter(row => String(row[8]).includes('4. Đã đăng')).length;
    const pendingPosts = totalPosts - publishedPosts;

    document.getElementById('metric-total').textContent = totalPosts;
    document.getElementById('metric-published').textContent = publishedPosts;
    document.getElementById('metric-pending').textContent = pendingPosts;

    const platforms = {};
    const pillars = {};
    dataRows.forEach(row => {
        platforms[row[2] || 'Khác'] = (platforms[row[2] || 'Khác'] || 0) + 1;
        pillars[row[4] || 'Chưa phân loại'] = (pillars[row[4] || 'Chưa phân loại'] || 0) + 1;
    });

    renderPlatformChart(Object.keys(platforms), Object.values(platforms));
    renderPillarChart(Object.keys(pillars), Object.values(pillars));
    renderOverviewTable(dataRows);
}

function processAdsData(data) {
    let totalSpend = 0;
    let totalLeads = 0;
    
    const tbody = document.querySelector('#ads-table tbody');
    tbody.innerHTML = '';
    
    data.forEach(item => {
        totalSpend += item.spend;
        totalLeads += item.leads;
        
        const cpl = item.leads > 0 ? Math.round(item.spend / item.leads) : 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.campaign}</strong></td>
            <td>${item.spend.toLocaleString('vi-VN')} đ</td>
            <td>${item.impressions.toLocaleString('vi-VN')}</td>
            <td>${item.clicks.toLocaleString('vi-VN')}</td>
            <td>${item.leads}</td>
            <td>${cpl.toLocaleString('vi-VN')} đ</td>
        `;
        tbody.appendChild(tr);
    });
    
    const avgCpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
    
    document.getElementById('ads-spend').textContent = totalSpend.toLocaleString('vi-VN') + ' đ';
    document.getElementById('ads-leads').textContent = totalLeads;
    document.getElementById('ads-cpl').textContent = avgCpl.toLocaleString('vi-VN') + ' đ';
}

function renderPlatformChart(labels, data) {
    const ctx = document.getElementById('platformChart').getContext('2d');
    if (platformChartInstance) platformChartInstance.destroy();
    platformChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: ['#ff9800', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%' }
    });
}

function renderPillarChart(labels, data) {
    const ctx = document.getElementById('pillarChart').getContext('2d');
    if (pillarChartInstance) pillarChartInstance.destroy();
    pillarChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'Số lượng bài', data: data, backgroundColor: '#3498db', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { grid: { display: false } } } }
    });
}

function renderOverviewTable(dataRows) {
    const tbody = document.querySelector('#upcoming-table tbody');
    tbody.innerHTML = '';
    const recentRows = [...dataRows].reverse().slice(0, 5);
    recentRows.forEach(row => {
        let statusClass = 'status-draft';
        if (String(row[8]).includes('4.')) statusClass = 'status-published';
        else if (String(row[8]).includes('3.')) statusClass = 'status-pending';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row[1]}</td><td><strong>${row[6]}</strong></td><td>${row[2]}</td><td>${row[4]}</td><td><span class="status-badge ${statusClass}">${row[8] || 'Draft'}</span></td>`;
        tbody.appendChild(tr);
    });
}
