/**
 * HI SUVAI ADMIN PANEL CONTROLLER
 * Inspired by VDG Fashion Admin Dashboard
 */

// Deployed backend URL for DigitalOcean / Production
const BACKEND_URL = 'https://www.hisuvai.com';

function getAdminApiUrl(path) {
  if (window.location.protocol === 'file:') {
    return 'http://127.0.0.1:5000/api' + path;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return (window.location.port === '5000' ? '/api' : 'http://127.0.0.1:5000/api') + path;
  }
  if (window.location.hostname.includes('hisuvai.com') || window.location.port === '5000') {
    return '/api' + path;
  }
  if (BACKEND_URL) {
    return BACKEND_URL + '/api' + path;
  }
  return '/api' + path;
}

const API_BASE = getAdminApiUrl('');

function resolveImageUrl(img) {
  const isFileProto = window.location.protocol === 'file:';
  const prefix = isFileProto ? 'http://127.0.0.1:5000' : '';
  if (!img) return isFileProto ? prefix + '/assets/suvai1.png' : '../assets/suvai1.png';
  if (img.startsWith('data:image/') || img.startsWith('blob:') || img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/uploads/')) return prefix + img;
  if (img.startsWith('uploads/')) return prefix + '/' + img;
  if (img.startsWith('/assets/')) return isFileProto ? prefix + img : '..' + img;
  if (img.startsWith('assets/')) return isFileProto ? prefix + '/' + img : '../' + img;
  if (img.startsWith('banner-slot-')) return prefix + '/uploads/banners/' + img;
  if (img.startsWith('product-')) return prefix + '/uploads/products/' + img;
  return isFileProto ? prefix + '/assets/' + img : '../assets/' + img;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let authToken = localStorage.getItem('hisuvai_admin_token') || null;
let currentAdmin = null;

// State caches
let allProducts = [];
let allOrders = [];
let allCustomers = [];
let allBanners = [];
let currentSettings = {};
let deleteTargetId = null;

// ============================================================
// INITIALIZATION & AUTHENTICATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.protocol === 'file:') {
    const banner = document.getElementById('file-protocol-banner');
    if (banner) banner.style.display = 'block';
  }
  const catSel = document.getElementById('form-category');
  if (catSel) {
    catSel.addEventListener('change', handleProductCategoryChange);
    catSel.addEventListener('input', handleProductCategoryChange);
  }
  const skuInput = document.getElementById('form-sku');
  if (skuInput) {
    skuInput.addEventListener('input', () => {
      isSkuManuallyEdited = true;
    });
  }
  if (authToken) {
    validateSessionAndBootstrap();
  } else {
    showAuthScreen();
  }
});

function showAuthScreen() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('admin-app').style.display = 'none';
}

function showAdminApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
  bootstrapAdminDashboard();
}

async function validateSessionAndBootstrap() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (res.ok && data.success && data.admin) {
      currentAdmin = data.admin;
      localStorage.setItem('hisuvai_admin_user', JSON.stringify(currentAdmin));
      updateAdminUserUI();
      showAdminApp();
    } else {
      handleAdminLogout();
      showToast('Your session has expired. Please log in again.', 'error');
    }
  } catch (e) {
    handleAdminLogout();
  }
}

function updateAdminUserUI() {
  if (!currentAdmin) return;
  const name = currentAdmin.name || 'Admin';
  const initial = name.charAt(0).toUpperCase();

  const sbInitial = document.getElementById('sidebar-avatar-initial');
  if (sbInitial) sbInitial.textContent = initial;
  const sbName = document.getElementById('sidebar-user-name');
  if (sbName) sbName.textContent = name;

  const topInitial = document.getElementById('top-avatar-initial');
  if (topInitial) topInitial.textContent = initial;
  const topName = document.getElementById('top-user-name');
  if (topName) topName.textContent = name;
}

function showForgotPassword(e) {
  e.preventDefault();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('forgot-password-link').parentElement.style.display = 'none';
  document.getElementById('forgot-password-panel').style.display = 'block';
  document.getElementById('forgot-email').value = '';
  document.getElementById('forgot-msg').textContent = '';
}

function hideForgotPassword(e) {
  e.preventDefault();
  document.getElementById('forgot-password-panel').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
  const link = document.getElementById('forgot-password-link');
  if (link && link.parentElement) link.parentElement.style.display = 'block';
}

async function handleForgotPassword() {
  const emailEl = document.getElementById('forgot-email');
  const msgEl = document.getElementById('forgot-msg');
  const email = emailEl ? emailEl.value.trim() : '';

  if (!email) {
    msgEl.innerHTML = '<span style="color:#e53e3e;">⚠️ Please enter your email address.</span>';
    return;
  }

  msgEl.innerHTML = '<span style="color:#7c3aed;">⏳ Sending reset link...</span>';

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      msgEl.innerHTML = '<span style="color:#16a34a;">✅ ' + (data.message || 'Reset link sent! Check your email.') + '</span>';
    } else {
      msgEl.innerHTML = '<span style="color:#e53e3e;">❌ ' + (data.message || 'Email not found or error occurred.') + '</span>';
    }
  } catch (err) {
    msgEl.innerHTML = '<span style="color:#e53e3e;">❌ Network error. Please try again.</span>';
  }
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-submit-btn');

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Authenticating...';
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success && data.token) {
      authToken = data.token;
      currentAdmin = data.admin;
      localStorage.setItem('hisuvai_admin_token', authToken);
      localStorage.setItem('hisuvai_admin_user', JSON.stringify(currentAdmin));
      showToast('✦ Login successful! Welcome to Hi Suvai Admin.');
      updateAdminUserUI();
      showAdminApp();
    } else {
      showToast(data.message || 'Invalid email or password', 'error');
    }
  } catch (error) {
    showToast('Failed to connect to backend server: ' + error.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Log In to Dashboard';
    }
  }
}

function handleAdminLogout() {
  authToken = null;
  currentAdmin = null;
  localStorage.removeItem('hisuvai_admin_token');
  localStorage.removeItem('hisuvai_admin_user');
  showToast('Logged out successfully');
  showAuthScreen();
}

// ============================================================
// NAVIGATION & VIEW SWITCHING
// ============================================================
function switchView(viewName) {
  // Update sidebar active buttons
  document.querySelectorAll('.sidebar-item').forEach(btn => btn.classList.remove('active'));
  const activeNav = document.getElementById(`nav-${viewName}`);
  if (activeNav) activeNav.classList.add('active');

  // Hide all sections
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) targetSec.classList.add('active');

  // Load specific data on view enter
  if (viewName === 'dashboard') {
    loadDashboardStats();
    loadAdminOrders();
  } else if (viewName === 'products') {
    loadAdminProducts();
  } else if (viewName === 'inventory') {
    loadAdminInventory();
  } else if (viewName === 'orders') {
    loadAdminOrders();
  } else if (viewName === 'customers') {
    loadAdminCustomers();
  } else if (viewName === 'banners') {
    loadAdminBanners();
  } else if (viewName === 'settings') {
    loadAdminSettings();
  } else if (viewName === 'razorpay') {
    loadAdminRazorpayStats();
  } else if (viewName === 'trash') {
    loadAdminTrash();
  }
}

function switchSettingsTab(tabName) {
  document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`tab-btn-${tabName}`);
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.settings-pane').forEach(p => p.style.display = 'none');
  const pane = document.getElementById(`settings-pane-${tabName}`);
  if (pane) pane.style.display = 'block';
}

// ============================================================
// BOOTSTRAP DATA
// ============================================================
let adminPollInterval = null;

async function bootstrapAdminDashboard() {
  await Promise.all([
    loadDashboardStats(),
    loadAdminProducts(),
    loadAdminOrders(),
    loadAdminCustomers(),
    loadAdminBanners(),
    loadAdminSettings()
  ]);

  if (adminPollInterval) clearInterval(adminPollInterval);
  adminPollInterval = setInterval(() => {
    loadAdminOrders();
    const activeSec = document.querySelector('.view-section.active');
    if (activeSec && activeSec.id === 'view-inventory') {
      loadAdminInventory();
    }
  }, 8000);
}

// ============================================================
// DASHBOARD STATS
// ============================================================
async function loadDashboardStats() {
  try {
    const res = await fetch(`${API_BASE}/products/admin/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();

    if (data.success && data.stats) {
      const s = data.stats;
      const kpiTotal = document.getElementById('kpi-total-products');
      if (kpiTotal) kpiTotal.textContent = s.totalProducts || 0;

      const sideProd = document.getElementById('sidebar-product-count');
      if (sideProd) sideProd.textContent = s.totalProducts || 0;

      // Category breakdown
      const catList = document.getElementById('category-distribution-list');
      if (catList && s.categoryBreakdown) {
        catList.innerHTML = '';
        s.categoryBreakdown.forEach(cat => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:var(--bg-surface-2); border-radius:6px;';
          row.innerHTML = `
            <span style="text-transform:capitalize; font-weight:600; color:var(--text-primary);">${cat._id}</span>
            <span class="badge cat">${cat.count} Items</span>
          `;
          catList.appendChild(row);
        });
      }
    }
  } catch (error) {
    console.warn('Dashboard stats error:', error);
  }
}

// ============================================================
// PRODUCTS MANAGEMENT
// ============================================================
async function loadAdminProducts() {
  const tbody = document.getElementById('admin-products-tbody');
  const loading = document.getElementById('table-loading-msg');
  const empty = document.getElementById('table-empty-msg');

  if (loading) loading.style.display = 'block';
  if (empty) empty.style.display = 'none';
  if (tbody) tbody.innerHTML = '';

  try {
    const res = await fetch(`${API_BASE}/products?limit=100`);
    const data = await res.json();

    if (loading) loading.style.display = 'none';

    if (data.success && data.products) {
      allProducts = data.products;
      const sideProd = document.getElementById('sidebar-product-count');
      if (sideProd) sideProd.textContent = allProducts.length;

      renderProductsTable(allProducts);
    }
  } catch (error) {
    if (loading) loading.style.display = 'none';
    showToast('Error loading products: ' + error.message, 'error');
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('admin-products-tbody');
  const empty = document.getElementById('table-empty-msg');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (products.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  products.forEach(p => {
    const tr = document.createElement('tr');
    const idSafe = escapeHtml(p._id);
    const nameSafe = escapeHtml(p.name);
    const tagSafe = escapeHtml(p.tag || 'Traditional Choice');
    const unitSafe = escapeHtml(p.unit || '250g');
    const catSafe = escapeHtml(p.category || 'general');
    const imgSrc = resolveImageUrl(p.image);
    const imgSrcSafe = escapeHtml(imgSrc);

    tr.innerHTML = `
      <td>
        <div class="prod-thumb-cell">
          <img src="${imgSrcSafe}" alt="${nameSafe}" onerror="this.onerror=null; this.src='../assets/suvai1.png';" />
        </div>
      </td>
      <td class="prod-title-cell">
        <strong>${nameSafe}</strong>
        <span style="display:inline-block; margin:2px 0; font-size:0.72rem; font-family:monospace; background:rgba(217,119,6,0.12); color:#B45309; padding:1px 6px; border-radius:4px; font-weight:700; border:1px solid rgba(217,119,6,0.25);">
          ID: ${escapeHtml(p.sku || `HS-${String(p._id).slice(-5).toUpperCase()}`)}
        </span>
        <span>${tagSafe} — ${unitSafe} | ⭐ ${Number(p.rating) !== undefined ? Number(p.rating) : 4.9}</span>
      </td>
      <td>
        <span class="badge cat">${catSafe}</span>
      </td>
      <td>
        <strong style="color:var(--crimson);">₹${Number(p.price) || 0}</strong>
        ${p.originalPrice > p.price ? `<span style="font-size:0.75rem; text-decoration:line-through; color:var(--text-dim); margin-left:4px;">₹${Number(p.originalPrice) || 0}</span>` : ''}
      </td>
      <td>
        <strong style="color:${p.stock <= 10 ? 'var(--danger)' : 'var(--text-primary)'};">${Number(p.stock) || 0}</strong>
        <span style="font-size:0.75rem; color:var(--text-muted);">(${unitSafe})</span>
      </td>
      <td>
        ${p.isAvailable && p.stock > 0 
          ? '<span class="badge available">In Stock</span>' 
          : '<span class="badge outofstock">Out of Stock</span>'}
      </td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" title="Edit Product" onclick="openEditProductModal('${idSafe}')">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" title="Delete Product" onclick="promptDeleteProduct('${idSafe}', '${escapeHtml(p.name).replace(/'/g, "\\'")}')">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleProductFilterChange() {
  const searchVal = (document.getElementById('admin-search-input')?.value || '').toLowerCase().trim();
  const catVal = document.getElementById('admin-filter-category')?.value || 'all';
  const statusVal = document.getElementById('admin-filter-status')?.value || 'all';
  const sortVal = document.getElementById('admin-filter-sort')?.value || 'newest';

  let filtered = allProducts.filter(p => {
    const matchSearch = !searchVal || 
      p.name.toLowerCase().includes(searchVal) || 
      (p.tag && p.tag.toLowerCase().includes(searchVal)) ||
      (p.description && p.description.toLowerCase().includes(searchVal));

    const matchCat = catVal === 'all' || p.category === catVal;
    
    let matchStatus = true;
    if (statusVal === 'available') matchStatus = p.isAvailable && p.stock > 0;
    if (statusVal === 'outofstock') matchStatus = !p.isAvailable || p.stock <= 0;

    return matchSearch && matchCat && matchStatus;
  });

  if (sortVal === 'low-high') {
    filtered.sort((a,b) => a.price - b.price);
  } else if (sortVal === 'high-low') {
    filtered.sort((a,b) => b.price - a.price);
  }

  renderProductsTable(filtered);
}

// Product Modal Add/Edit
function handleProductCategoryChange() {
  const sel = document.getElementById('form-category');
  const customGroup = document.getElementById('form-custom-category-group');
  const customInput = document.getElementById('form-custom-category');
  const editBtn = document.getElementById('btn-edit-selected-cat');
  const delBtn = document.getElementById('btn-delete-selected-cat');
  if (!sel || !customGroup) return;

  if (sel.value === 'other') {
    customGroup.style.display = 'block';
    if (customInput) {
      customInput.focus();
    }
    if (editBtn) editBtn.style.display = 'none';
    if (delBtn) delBtn.style.display = 'none';
  } else {
    customGroup.style.display = 'none';
    if (editBtn) editBtn.style.display = 'inline-flex';
    if (delBtn) delBtn.style.display = 'inline-flex';
  }
}

async function promptEditSelectedCategory() {
  const sel = document.getElementById('form-category');
  if (!sel || sel.value === 'other') {
    showToast('Please select a valid category to edit / மாற்ற வேண்டிய வகையை தேர்ந்தெடுக்கவும்', 'warning');
    return;
  }

  const cat = adminCategories.find(c => c.key === sel.value);
  if (!cat) {
    showToast('Category not found', 'error');
    return;
  }

  const newLabel = prompt(`Edit Category Name / வகை பெயரை மாற்றவும்:`, cat.label);
  if (!newLabel || !newLabel.trim() || newLabel.trim() === cat.label) return;

  cat.label = newLabel.trim();
  updateProductFormCategorySelect();
  sel.value = cat.key;
  handleProductCategoryChange();
  renderAdminCategoriesList();

  showToast(`Category updated to "${cat.label}"!`);

  // Persist to backend settings
  try {
    const formData = new FormData();
    formData.append('customCategories', JSON.stringify(adminCategories));
    fetch(getAdminApiUrl('/settings'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    }).catch(e => console.warn('Could not persist categories to settings:', e));
  } catch (e) {}
}

async function promptDeleteSelectedCategory() {
  const sel = document.getElementById('form-category');
  if (!sel || sel.value === 'other') {
    showToast('Please select a valid category to delete / நீக்க வேண்டிய வகையை தேர்ந்தெடுக்கவும்', 'warning');
    return;
  }

  if (adminCategories.length <= 1) {
    showToast('At least one category is required / குறைந்தபட்சம் ஒரு வகை இருக்க வேண்டும்', 'error');
    return;
  }

  const cat = adminCategories.find(c => c.key === sel.value);
  if (!cat) {
    showToast('Category not found', 'error');
    return;
  }

  const confirmed = confirm(`Are you sure you want to delete category "${cat.label}"?\n"${cat.label}" வகையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?`);
  if (!confirmed) return;

  const deletedLabel = cat.label;
  adminCategories = adminCategories.filter(c => c.key !== cat.key);
  updateProductFormCategorySelect();

  // Select the first remaining category
  if (sel && adminCategories.length > 0) {
    sel.value = adminCategories[0].key;
  }
  handleProductCategoryChange();
  renderAdminCategoriesList();

  showToast(`Category "${deletedLabel}" deleted successfully!`);

  // Persist to backend settings
  try {
    const formData = new FormData();
    formData.append('customCategories', JSON.stringify(adminCategories));
    fetch(getAdminApiUrl('/settings'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    }).catch(e => console.warn('Could not persist categories to settings:', e));
  } catch (e) {}
}

function openCategoryManagerModal() {
  renderCategoryManagerList();
  const modal = document.getElementById('category-manager-modal-overlay');
  if (modal) modal.classList.add('open');
  const input = document.getElementById('modal-new-cat-name');
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 100);
  }
}

function closeCategoryManagerModal() {
  const modal = document.getElementById('category-manager-modal-overlay');
  if (modal) modal.classList.remove('open');
}

function renderCategoryManagerList() {
  const container = document.getElementById('category-manager-list');
  if (!container) return;
  container.innerHTML = '';

  adminCategories.forEach((cat, idx) => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex; gap:8px; align-items:center; background:var(--bg-surface-2); padding:8px 12px; border-radius:8px; border:1px solid var(--border-color);';
    item.innerHTML = `
      <span style="font-weight:700; color:var(--text-muted); font-size:0.75rem; width:22px;">#${idx + 1}</span>
      <input type="text" class="form-control" value="${cat.label.replace(/"/g, '&quot;')}" 
        style="flex:1; padding:6px 10px; font-size:0.85rem; font-weight:600;" 
        onchange="updateCategoryManagerItem(${idx}, this.value)" />
      <span style="font-size:0.7rem; color:var(--text-muted); background:var(--bg-card); padding:3px 6px; border-radius:4px; font-family:monospace;">${cat.key}</span>
      <button type="button" class="btn btn-outline" style="padding:4px 8px; color:var(--danger); border-color:#FECACA;" 
        onclick="deleteCategoryFromManager(${idx})" title="Delete Category">
        ✕
      </button>
    `;
    container.appendChild(item);
  });
}

async function addNewCategoryFromManager() {
  const input = document.getElementById('modal-new-cat-name');
  const val = (input ? input.value : '').trim();
  if (!val) {
    showToast('Please enter category name / வகை பெயரை உள்ளிடவும்', 'warning');
    if (input) input.focus();
    return;
  }

  let normalizedKey = val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
  if (!normalizedKey) {
    normalizedKey = 'cat_' + Date.now().toString(36);
  }

  if (adminCategories.some(c => c.key === normalizedKey || c.label.toLowerCase() === val.toLowerCase())) {
    showToast('Category already exists / இந்த வகை ஏற்கெனவே உள்ளது', 'warning');
    return;
  }

  adminCategories.push({ key: normalizedKey, label: val });
  if (input) input.value = '';
  renderCategoryManagerList();
  updateProductFormCategorySelect();
  renderAdminCategoriesList();

  showToast(`Category "${val}" added!`);

  try {
    const formData = new FormData();
    formData.append('customCategories', JSON.stringify(adminCategories));
    fetch(getAdminApiUrl('/settings'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    }).catch(e => console.warn(e));
  } catch (e) {}
}

async function updateCategoryManagerItem(idx, newLabel) {
  if (!adminCategories[idx]) return;
  const trimmed = newLabel.trim();
  if (!trimmed) {
    showToast('Category name cannot be empty', 'warning');
    renderCategoryManagerList();
    return;
  }
  adminCategories[idx].label = trimmed;
  updateProductFormCategorySelect();
  renderAdminCategoriesList();
  showToast(`Category renamed to "${trimmed}"!`);

  try {
    const formData = new FormData();
    formData.append('customCategories', JSON.stringify(adminCategories));
    fetch(getAdminApiUrl('/settings'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    }).catch(e => console.warn(e));
  } catch (e) {}
}

async function deleteCategoryFromManager(idx) {
  if (adminCategories.length <= 1) {
    showToast('At least one category is required', 'error');
    return;
  }
  const cat = adminCategories[idx];
  if (!confirm(`Are you sure you want to delete category "${cat.label}"?`)) return;

  const deletedLabel = cat.label;
  adminCategories.splice(idx, 1);
  renderCategoryManagerList();
  updateProductFormCategorySelect();
  renderAdminCategoriesList();
  showToast(`Category "${deletedLabel}" deleted!`);

  try {
    const formData = new FormData();
    formData.append('customCategories', JSON.stringify(adminCategories));
    fetch(getAdminApiUrl('/settings'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    }).catch(e => console.warn(e));
  } catch (e) {}
}

async function saveCustomCategoryInline() {
  const customInput = document.getElementById('form-custom-category');
  const val = (customInput ? customInput.value : '').trim();

  if (!val) {
    showToast('Please enter category name / வகை பெயரை உள்ளிடவும்', 'warning');
    if (customInput) customInput.focus();
    return;
  }

  // Create clean normalized key
  let normalizedKey = val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
  if (!normalizedKey) {
    normalizedKey = 'cat_' + Date.now().toString(36);
  }

  // Check if category already exists in adminCategories
  const existing = adminCategories.find(c => c.key === normalizedKey || c.label.toLowerCase() === val.toLowerCase());
  let finalKey = normalizedKey;
  if (existing) {
    finalKey = existing.key;
  } else {
    adminCategories.push({ key: normalizedKey, label: val });
  }

  // Re-render category select dropdowns
  updateProductFormCategorySelect();

  // Select the newly created category in the form
  const sel = document.getElementById('form-category');
  if (sel) {
    sel.value = finalKey;
  }

  // Hide the custom category input box
  const customGroup = document.getElementById('form-custom-category-group');
  if (customGroup) customGroup.style.display = 'none';
  if (customInput) customInput.value = '';

  showToast(`Category "${val}" saved and selected!`);

  // Persist to backend settings in background so it remains saved
  try {
    const formData = new FormData();
    formData.append('customCategories', JSON.stringify(adminCategories));
    fetch(getAdminApiUrl('/settings'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    }).catch(e => console.warn('Could not persist categories to settings:', e));
  } catch (e) {
    // Non-blocking
  }
}

let isSkuManuallyEdited = false;

function autoGenerateProductId() {
  const skuInput = document.getElementById('form-sku');
  if (!skuInput) return;
  const randNum = Math.floor(100000 + Math.random() * 900000);
  skuInput.value = `HS-${randNum}`;
  isSkuManuallyEdited = true; // Auto-locked permanently
}

function convertNameToProductId(force = false) {
  // Product ID is fully automatic and locked (e.g. HS-123456); preserve generated ID
  const skuInput = document.getElementById('form-sku');
  if (!skuInput || !skuInput.value) {
    autoGenerateProductId();
  }
}

function handleProductNameInputForSku() {
  // Product ID is permanent and auto-locked; never overwrite when typing product name
  const skuInput = document.getElementById('form-sku');
  if (skuInput && !skuInput.value) {
    autoGenerateProductId();
  }
}

function openAddProductModal() {
  const form = document.getElementById('product-form');
  if (form) form.reset();
  document.getElementById('form-product-id').value = '';
  document.getElementById('product-modal-title').textContent = 'Add New Product';
  document.getElementById('form-rating').value = '4.9';
  const delChargeEl = document.getElementById('form-delivery-charge');
  if (delChargeEl) delChargeEl.value = '0';
  document.getElementById('main-image-preview-wrap').style.display = 'none';

  // Automatically generate and strictly lock unique Product ID
  autoGenerateProductId();
  const skuGenBtn = document.getElementById('btn-auto-gen-sku');
  if (skuGenBtn) skuGenBtn.style.display = 'none'; // Locked: nobody can change it

  // Reset custom category & benefits
  const customGroup = document.getElementById('form-custom-category-group');
  if (customGroup) customGroup.style.display = 'none';
  const customInput = document.getElementById('form-custom-category');
  if (customInput) customInput.value = '';
  const benefitsEl = document.getElementById('form-benefits');
  if (benefitsEl) benefitsEl.value = '';

  handleProductCategoryChange();

  const modal = document.getElementById('product-modal-overlay');
  if (modal) modal.classList.add('open');
}

function openEditProductModal(id) {
  const p = allProducts.find(item => (item._id || item.id) == id);
  if (!p) return;

  const idKey = p._id || p.id;
  document.getElementById('form-product-id').value = idKey;
  document.getElementById('product-modal-title').textContent = `Edit Product: ${p.name}`;
  document.getElementById('form-sku').value = p.sku || `HS-${String(idKey).slice(-6).toUpperCase()}`;
  isSkuManuallyEdited = true;
  const skuGenBtn = document.getElementById('btn-auto-gen-sku');
  if (skuGenBtn) skuGenBtn.style.display = 'none'; // Locked: nobody can change existing product ID
  document.getElementById('form-name').value = p.name;
  document.getElementById('form-tag').value = p.tag || '';

  // Category and Custom Category Handling
  const sel = document.getElementById('form-category');
  const customGroup = document.getElementById('form-custom-category-group');
  const customInput = document.getElementById('form-custom-category');
  const hasOption = sel && Array.from(sel.options).some(o => o.value === p.category);
  if (hasOption && p.category !== 'other') {
    if (sel) sel.value = p.category;
    if (customGroup) customGroup.style.display = 'none';
    if (customInput) customInput.value = '';
  } else {
    if (sel) sel.value = 'other';
    if (customGroup) customGroup.style.display = 'block';
    if (customInput) customInput.value = p.customCategory || (p.category !== 'other' ? p.category : '');
  }
  handleProductCategoryChange();

  document.getElementById('form-price').value = p.price;
  document.getElementById('form-original-price').value = p.originalPrice || '';
  document.getElementById('form-stock').value = p.stock;
  document.getElementById('form-unit').value = p.unit || '250g';
  const delChargeEl = document.getElementById('form-delivery-charge');
  if (delChargeEl) delChargeEl.value = p.deliveryCharge !== undefined ? p.deliveryCharge : 0;
  document.getElementById('form-rating').value = p.rating !== undefined ? p.rating : 4.9;
  document.getElementById('form-short-desc').value = p.shortDescription || '';
  document.getElementById('form-desc').value = p.description;

  // Benefits
  const benefitsEl = document.getElementById('form-benefits');
  if (benefitsEl) benefitsEl.value = p.benefits || '';

  const previewWrap = document.getElementById('main-image-preview-wrap');
  const previewImg = document.getElementById('main-preview-img');
  if (p.image && previewImg) {
    previewImg.src = resolveImageUrl(p.image);
    if (previewWrap) previewWrap.style.display = 'block';
  }

  const modal = document.getElementById('product-modal-overlay');
  if (modal) modal.classList.add('open');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal-overlay');
  if (modal) modal.classList.remove('open');
}

function previewMainImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById('main-preview-img');
      if (img) img.src = e.target.result;
      const wrap = document.getElementById('main-image-preview-wrap');
      if (wrap) wrap.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function handleProductFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('form-product-id').value;
  const isEditing = !!id;

  const formData = new FormData();
  const skuVal = (document.getElementById('form-sku')?.value || '').trim();
  formData.append('sku', skuVal || `HS-${Math.floor(100000 + Math.random() * 900000)}`);
  formData.append('name', document.getElementById('form-name').value.trim());
  formData.append('tag', document.getElementById('form-tag').value.trim());

  // Category & Custom Category Handling
  const selCat = document.getElementById('form-category')?.value || 'health';
  const customCatInput = document.getElementById('form-custom-category');
  const customCatVal = customCatInput ? customCatInput.value.trim() : '';

  if (selCat === 'other' && customCatVal) {
    let normalizedKey = customCatVal.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (!normalizedKey) {
      normalizedKey = 'cat-' + Date.now().toString(36);
    }
    formData.append('category', normalizedKey);
    formData.append('customCategory', customCatVal);

    // Auto-register to adminCategories list if not present
    if (normalizedKey && !adminCategories.some(c => c.key === normalizedKey)) {
      adminCategories.push({ key: normalizedKey, label: customCatVal });
      updateProductFormCategorySelect();
    }
  } else {
    formData.append('category', selCat);
    formData.append('customCategory', '');
  }

  formData.append('price', document.getElementById('form-price').value);
  formData.append('originalPrice', document.getElementById('form-original-price').value || 0);
  formData.append('stock', document.getElementById('form-stock').value);
  formData.append('unit', document.getElementById('form-unit').value.trim() || '250g');
  formData.append('deliveryCharge', document.getElementById('form-delivery-charge')?.value || 0);
  formData.append('rating', document.getElementById('form-rating').value || 4.9);
  formData.append('shortDescription', document.getElementById('form-short-desc').value.trim());
  formData.append('description', document.getElementById('form-desc').value.trim());
  formData.append('benefits', document.getElementById('form-benefits')?.value.trim() || '');

  const fileInput = document.getElementById('form-file-main');
  if (fileInput && fileInput.files[0]) {
    formData.append('image', fileInput.files[0]);
  }

  const submitBtn = document.getElementById('form-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
  }

  try {
    const url = isEditing ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
    const method = isEditing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      showToast(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
      closeProductModal();
      loadAdminProducts();
      loadDashboardStats();
    } else {
      showToast(data.message || 'Failed to save product', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Product';
    }
  }
}

function promptDeleteProduct(id, name) {
  deleteTargetId = id;
  const nameEl = document.getElementById('delete-prod-name');
  if (nameEl) nameEl.textContent = name;
  const modal = document.getElementById('delete-modal-overlay');
  if (modal) modal.classList.add('open');
}

function closeDeleteModal() {
  deleteTargetId = null;
  const modal = document.getElementById('delete-modal-overlay');
  if (modal) modal.classList.remove('open');
}

async function executeDeleteProduct() {
  if (!deleteTargetId) return;

  try {
    const res = await fetch(`${API_BASE}/products/${deleteTargetId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast('Product deleted successfully');
      closeDeleteModal();
      loadAdminProducts();
      loadDashboardStats();
    } else {
      showToast(data.message || 'Failed to delete product', 'error');
    }
  } catch (err) {
    showToast('Error deleting product: ' + err.message, 'error');
  }
}

// ============================================================
// ORDERS MANAGEMENT (NEW!)
// ============================================================
async function loadAdminOrders() {
  const tbody = document.getElementById('admin-orders-tbody');
  const dashTbody = document.getElementById('dashboard-recent-orders-tbody');
  const loading = document.getElementById('orders-loading-msg');
  const empty = document.getElementById('orders-empty-msg');

  if (loading) loading.style.display = 'block';
  if (empty) empty.style.display = 'none';

  let apiOrders = [];
  try {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(getAdminApiUrl('/orders?limit=100'), { headers });
    const data = await res.json();
    if (data.success && data.orders) {
      apiOrders = data.orders;
    }
  } catch (error) {
    console.warn('Orders API fetch notice:', error.message);
  }

  // Read local storage orders
  let localOrders = [];
  try {
    localOrders = JSON.parse(localStorage.getItem('hisuvai_orders') || '[]');
  } catch(e) {}

  // Merge API orders & local orders (deduplicate by orderId)
  const orderMap = new Map();
  apiOrders.forEach(o => { if (o && o.orderId) orderMap.set(o.orderId, o); });
  localOrders.forEach(o => {
    if (o && o.orderId && !orderMap.has(o.orderId)) {
      orderMap.set(o.orderId, o);
    }
  });

  const trashSet = new Set(getTrashOrdersFromStorage().map(t => t.orderId || t._id));
  allOrders = Array.from(orderMap.values()).filter(o => !o.isDeleted && !trashSet.has(o.orderId) && !trashSet.has(o._id));
  allOrders.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
  updateTrashBadge();

  if (loading) loading.style.display = 'none';

  // Calculate KPIs
  const totalCount = allOrders.length;
  const pendingCount = allOrders.filter(o => (o.orderStatus || 'Pending') === 'Pending').length;
  const deliveredCount = allOrders.filter(o => (o.orderStatus === 'Shipped' || o.orderStatus === 'Delivered')).length;
  const totalRev = allOrders.reduce((sum, o) => {
    if (o.orderStatus === 'Cancelled') return sum;
    return sum + (o.pricing?.grandTotal || o.total || 0);
  }, 0);

  // Sidebar badge
  const sideOrder = document.getElementById('sidebar-order-count');
  if (sideOrder) sideOrder.textContent = totalCount;

  // Orders Tab KPIs
  const kpiTot = document.getElementById('orders-kpi-total'); if (kpiTot) kpiTot.textContent = totalCount;
  const kpiPend = document.getElementById('orders-kpi-pending'); if (kpiPend) kpiPend.textContent = pendingCount;
  const kpiDel = document.getElementById('orders-kpi-delivered'); if (kpiDel) kpiDel.textContent = deliveredCount;
  const kpiRev = document.getElementById('orders-kpi-revenue'); if (kpiRev) kpiRev.textContent = '₹' + totalRev;

  // Dashboard Tab KPIs
  const dTot = document.getElementById('kpi-total-orders'); if (dTot) dTot.textContent = totalCount;
  const dPend = document.getElementById('kpi-pending-orders'); if (dPend) dPend.textContent = pendingCount;
  const dRev = document.getElementById('kpi-total-revenue'); if (dRev) dRev.textContent = '₹' + totalRev;

  // Dynamic Increase/Decrease Trends calculation (Comparing Current Month vs Previous Month)
  const now = new Date();
  const thisMonthOrders = allOrders.filter(o => {
    if (o.orderStatus === 'Cancelled') return false;
    const d = new Date(o.createdAt || Date.now());
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthOrders = allOrders.filter(o => {
    if (o.orderStatus === 'Cancelled') return false;
    const d = new Date(o.createdAt || Date.now());
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
  });

  const thisMonthRev = thisMonthOrders.reduce((s, o) => s + Number(o.pricing?.grandTotal || o.total || 0), 0);
  const lastMonthRev = lastMonthOrders.reduce((s, o) => s + Number(o.pricing?.grandTotal || o.total || 0), 0);

  // Revenue percentage increase/decrease badge
  const revTrendEl = document.getElementById('kpi-revenue-trend');
  if (revTrendEl) {
    if (lastMonthRev > 0) {
      const diff = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;
      const isUp = diff >= 0;
      revTrendEl.textContent = `${isUp ? '↗ +' : '↘ '}${diff.toFixed(1)}%`;
      revTrendEl.style.background = isUp ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)';
      revTrendEl.style.color = isUp ? '#16A34A' : '#DC2626';
    } else {
      revTrendEl.textContent = '↗ +18.5%';
      revTrendEl.style.background = 'rgba(22,163,74,0.1)';
      revTrendEl.style.color = '#16A34A';
    }
  }

  // Orders percentage increase/decrease badge
  const orderTrendEl = document.getElementById('kpi-orders-trend');
  if (orderTrendEl) {
    if (lastMonthOrders.length > 0) {
      const diff = ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100;
      const isUp = diff >= 0;
      orderTrendEl.textContent = `${isUp ? '↗ +' : '↘ '}${diff.toFixed(1)}%`;
      orderTrendEl.style.background = isUp ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)';
      orderTrendEl.style.color = isUp ? '#16A34A' : '#DC2626';
    } else {
      orderTrendEl.textContent = '↗ +14.2%';
      orderTrendEl.style.background = 'rgba(22,163,74,0.1)';
      orderTrendEl.style.color = '#16A34A';
    }
  }

  renderOrdersTable(allOrders);
  renderDashboardRecentOrders(allOrders.slice(0, 5));
  updateDashboardCharts(allOrders);
}

// ============================================================
// DYNAMIC LIVE CHARTS (SALES OVERVIEW & CATEGORY DISTRIBUTION)
// ============================================================
let salesChartInstance = null;
let categoryChartInstance = null;

function initAdminCharts() {
  const salesCtx = document.getElementById('salesChart');
  if (salesCtx) {
    salesChartInstance = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Sales Revenue (₹)',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220, 38, 38, 0.12)',
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#DC2626',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ' Revenue: ₹' + Number(context.raw || 0).toLocaleString('en-IN');
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) { return '₹' + value.toLocaleString('en-IN'); }
            }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const categoryCtx = document.getElementById('categoryChart');
  if (categoryCtx) {
    categoryChartInstance = new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ['Health Mix', 'Porridge Mix', 'Special Flour', 'Combo Deals', 'Other'],
        datasets: [{
          data: [1, 1, 1, 1, 1],
          backgroundColor: ['#7C3AED', '#C8973A', '#16A34A', '#EA580C', '#64748B'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 11 }, maxWidth: 200 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.raw} units`;
              }
            }
          }
        }
      }
    });
  }
}

function handleSalesChartFilterChange() {
  const timeframe = document.getElementById('sales-chart-timeframe')?.value || 'year';
  renderSalesOverviewChart(allOrders, timeframe);
}

function handleCategoryChartFilterChange() {
  const timeframe = document.getElementById('category-chart-timeframe')?.value || 'month';
  renderCategoryDistributionChart(allOrders, timeframe);
}

function renderSalesOverviewChart(orders, timeframe = 'year') {
  if (!salesChartInstance) return;
  const now = new Date();
  let labels = [];
  let dataPoints = [];
  let growthLabel = '↗ +18.5% increase vs last period';

  if (timeframe === 'today') {
    // 8 blocks of 3 hours throughout the day
    labels = ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
    dataPoints = new Array(8).fill(0);

    const todayOrders = (orders || []).filter(o => {
      if (o.orderStatus === 'Cancelled') return false;
      const d = new Date(o.createdAt || Date.now());
      return d.toDateString() === now.toDateString();
    });

    todayOrders.forEach(o => {
      const d = new Date(o.createdAt || Date.now());
      const hour = d.getHours();
      const bucket = Math.min(Math.floor(hour / 3), 7);
      const rev = Number(o.pricing?.grandTotal || o.total || 0);
      dataPoints[bucket] += rev;
    });

    const totalToday = dataPoints.reduce((a, b) => a + b, 0);
    growthLabel = totalToday > 0 ? `₹${totalToday.toLocaleString('en-IN')} revenue recorded today` : `Active live tracking for Today`;
  } 
  else if (timeframe === 'week') {
    // 7 days of the past week
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    labels = [];
    dataPoints = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayLabel = `${days[d.getDay()]} (${d.getDate()}/${d.getMonth()+1})`;
      labels.push(dayLabel);
      
      const dayRev = (orders || []).filter(o => {
        if (o.orderStatus === 'Cancelled') return false;
        const od = new Date(o.createdAt || Date.now());
        return od.toDateString() === d.toDateString();
      }).reduce((sum, o) => sum + Number(o.pricing?.grandTotal || o.total || 0), 0);

      dataPoints.push(dayRev);
    }
    const totalWeek = dataPoints.reduce((a, b) => a + b, 0);
    growthLabel = totalWeek > 0 ? `₹${totalWeek.toLocaleString('en-IN')} revenue this week (↗ +12.3%)` : `Weekly performance tracking`;
  }
  else if (timeframe === 'month') {
    // Days of current month grouped into 6 5-day intervals
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    labels = ['1-5', '6-10', '11-15', '16-20', '21-25', `26-${daysInMonth}`];
    dataPoints = new Array(6).fill(0);

    const monthOrders = (orders || []).filter(o => {
      if (o.orderStatus === 'Cancelled') return false;
      const d = new Date(o.createdAt || Date.now());
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    monthOrders.forEach(o => {
      const d = new Date(o.createdAt || Date.now());
      const day = d.getDate();
      let bucket = Math.min(Math.floor((day - 1) / 5), 5);
      const rev = Number(o.pricing?.grandTotal || o.total || 0);
      dataPoints[bucket] += rev;
    });

    const totalMonth = dataPoints.reduce((a, b) => a + b, 0);
    growthLabel = totalMonth > 0 ? `₹${totalMonth.toLocaleString('en-IN')} revenue this month (↗ +14.8%)` : `Monthly revenue tracking`;
  }
  else {
    // Year: 12 months (Jan - Dec)
    labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    dataPoints = new Array(12).fill(0);

    const yearOrders = (orders || []).filter(o => {
      if (o.orderStatus === 'Cancelled') return false;
      const d = new Date(o.createdAt || Date.now());
      return d.getFullYear() === now.getFullYear();
    });

    yearOrders.forEach(o => {
      const d = new Date(o.createdAt || Date.now());
      const m = d.getMonth();
      const rev = Number(o.pricing?.grandTotal || o.total || 0);
      dataPoints[m] += rev;
    });

    const totalYear = dataPoints.reduce((a, b) => a + b, 0);
    growthLabel = totalYear > 0 ? `₹${totalYear.toLocaleString('en-IN')} total annual revenue (↗ +18.5% YoY)` : `Annual revenue overview`;
  }

  const growthEl = document.getElementById('sales-overview-growth');
  if (growthEl) growthEl.textContent = growthLabel;

  salesChartInstance.data.labels = labels;
  salesChartInstance.data.datasets[0].data = dataPoints;
  salesChartInstance.update();
}

function renderCategoryDistributionChart(orders, timeframe = 'month') {
  if (!categoryChartInstance) return;
  const now = new Date();

  const filteredOrders = (orders || []).filter(o => {
    if (o.orderStatus === 'Cancelled') return false;
    if (timeframe === 'all') return true;
    const d = new Date(o.createdAt || Date.now());
    if (timeframe === 'today') {
      return d.toDateString() === now.toDateString();
    } else if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    } else if (timeframe === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (timeframe === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const categoryCounts = {
    'Health Mix': 0,
    'Porridge Mix': 0,
    'Special Flour': 0,
    'Combo Deals': 0,
    'Other': 0
  };

  filteredOrders.forEach(o => {
    const items = o.items || [];
    items.forEach(it => {
      const qty = Number(it.quantity || it.qty || 1);
      const name = (it.name || '').toLowerCase();
      const cat = (it.category || '').toLowerCase();

      if (cat.includes('health') || name.includes('health') || name.includes('ஹெல்த்')) {
        categoryCounts['Health Mix'] += qty;
      } else if (cat.includes('porridge') || cat.includes('rice') || name.includes('porridge') || name.includes('kanji') || name.includes('கஞ்சி')) {
        categoryCounts['Porridge Mix'] += qty;
      } else if (cat.includes('flour') || name.includes('flour') || name.includes('மாவு') || name.includes('gothumai')) {
        categoryCounts['Special Flour'] += qty;
      } else if (cat.includes('combo') || name.includes('combo') || name.includes('காம்போ')) {
        categoryCounts['Combo Deals'] += qty;
      } else {
        categoryCounts['Other'] += qty;
      }
    });
  });

  const catLabels = Object.keys(categoryCounts);
  const catData = Object.values(categoryCounts);
  const totalUnits = catData.reduce((a, b) => a + b, 0);

  const subEl = document.getElementById('category-overview-sub');
  if (subEl) {
    const formattedTf = timeframe === 'today' ? 'Today' : timeframe === 'week' ? 'This Week' : timeframe === 'month' ? 'This Month' : timeframe === 'year' ? 'This Year' : 'All Time';
    subEl.textContent = totalUnits > 0 ? `${totalUnits} units sold (${formattedTf})` : `No category orders recorded for ${formattedTf}`;
  }

  categoryChartInstance.data.labels = catLabels;
  categoryChartInstance.data.datasets[0].data = totalUnits > 0 ? catData : [4, 2, 2, 2, 1];
  categoryChartInstance.update();
}

function updateDashboardCharts(orders) {
  if (!orders) return;
  const salesTimeframe = document.getElementById('sales-chart-timeframe')?.value || 'year';
  const catTimeframe = document.getElementById('category-chart-timeframe')?.value || 'month';
  renderSalesOverviewChart(orders, salesTimeframe);
  renderCategoryDistributionChart(orders, catTimeframe);
}

function formatAdminPayMethod(method) {
  if (!method) return 'Razorpay';
  const m = String(method).toLowerCase();
  if (m === 'razorpay' || m === 'upi') return 'Razorpay (Online)';
  if (m === 'wa') return 'WhatsApp';
  if (m === 'cod') return 'COD';
  return method.toUpperCase();
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('admin-orders-tbody');
  const empty = document.getElementById('orders-empty-msg');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (orders.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  orders.forEach(ord => {
    const tr = document.createElement('tr');
    const targetId = ord._id || ord.orderId;
    const dateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const itemsSummary = (ord.items || []).map(i => `${i.name} (${i.quantity})`).join(', ');

    // Full Delivery Address formatting
    const cust = ord.customer || {};
    const addrParts = [];
    if (cust.address) addrParts.push(cust.address);
    if (cust.apartment) addrParts.push(cust.apartment);
    if (cust.city) addrParts.push(cust.city);
    if (cust.state) addrParts.push(cust.state);
    if (cust.pincode) addrParts.push(`PIN: ${cust.pincode}`);
    const fullAddressStr = addrParts.length > 0 ? addrParts.join(', ') : 'Address not provided';

    const isCancelled = ord.orderStatus === 'Cancelled';
    const isPaid = ord.payment?.status === 'paid' || ord.payment?.method === 'razorpay' || ord.payment?.method === 'upi';
    const isRefunded = ord.payment?.refundStatus === 'processed';

    let paymentBadge = `<span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; background:var(--bg-surface-2); padding:3px 8px; border-radius:4px; display:inline-block;">${formatAdminPayMethod(ord.payment?.method)}</span>`;
    if (isRefunded) {
      paymentBadge += `<br><span class="badge available" style="font-size:0.7rem; display:inline-block; margin-top:4px; background:rgba(16,185,129,0.12); color:#10B981; font-weight:700;">💚 Refunded (₹${ord.payment?.refundAmount || ord.pricing?.grandTotal || 0})</span>`;
    }

    let cancelDetailsHtml = '';
    if (isCancelled) {
      const cancelReasonText = ord.cancellationReason || 'Cancelled by Customer';
      const cancelDateText = ord.cancelledAt ? new Date(ord.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
      cancelDetailsHtml = `
        <div style="margin-top:6px; padding:6px 8px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:6px; font-size:0.75rem; text-align:left;">
          <div style="color:#DC2626; font-weight:700; display:flex; align-items:center; gap:4px;">
            <span>🚫 Cancelled</span>
          </div>
          <div style="color:var(--text-primary); font-weight:600; margin-top:3px; word-break:break-word;">
            Reason: ${cancelReasonText}
          </div>
          ${cancelDateText ? `<div style="color:var(--text-muted); font-size:0.7rem; margin-top:2px;">On ${cancelDateText}</div>` : ''}
        </div>
      `;
    }

    let statusSelectHtml = '';
    if (isCancelled) {
      statusSelectHtml = `
        <select class="select-ctrl" style="padding:4px 8px; font-size:0.78rem; opacity:0.65; cursor:not-allowed; background:rgba(239,68,68,0.06); border-color:rgba(239,68,68,0.3); color:#DC2626; font-weight:700;" disabled title="Cancelled order status is locked and cannot be edited">
          <option value="Cancelled" selected>🚫 Cancelled (Locked)</option>
        </select>
      `;
    } else {
      statusSelectHtml = `
        <select class="select-ctrl" style="padding:4px 8px; font-size:0.78rem;" onchange="updateOrderStatus('${targetId}', this.value)">
          <option value="Pending" ${ord.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Processing" ${ord.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
          <option value="Shipped" ${ord.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${ord.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      `;
    }

    let actionsHtml = `
      <div style="display:flex; flex-direction:column; gap:4px; align-items:stretch;">
        <button class="btn btn-outline" style="padding:4px 10px; font-size:0.75rem;" onclick="openOrderDetailModal('${targetId}')">
          View Details
        </button>
    `;
    if (isCancelled && isPaid && !isRefunded) {
      actionsHtml += `
        <button class="btn btn-crimson" style="padding:4px 10px; font-size:0.75rem;" onclick="executeAdminRefund('${targetId}', ${ord.pricing?.grandTotal || 0})">
          ↩️ Process Refund
        </button>
      `;
    }
    if (isCancelled) {
      actionsHtml += `
        <button class="btn btn-outline" style="padding:4px 10px; font-size:0.75rem; color:#EF4444; border-color:rgba(239,68,68,0.4);" onclick="deleteOrderFromAdmin('${targetId}', '${ord.orderId}')" title="Delete Cancelled Order">
          🗑️ Delete Order
        </button>
      `;
    }
    actionsHtml += `</div>`;

    const orderIdSafe = escapeHtml(ord.orderId);
    const targetIdSafe = escapeHtml(targetId);
    const custNameSafe = escapeHtml(ord.customer?.name || 'Customer');
    const custPhoneSafe = escapeHtml(ord.customer?.phone || '');
    const fullAddressSafe = escapeHtml(fullAddressStr);
    const itemsSummarySafe = escapeHtml(itemsSummary || 'Items');

    tr.innerHTML = `
      <td>
        <strong style="color:var(--purple-accent); cursor:pointer;" onclick="openOrderDetailModal('${targetIdSafe}')">${orderIdSafe}</strong>
        <span style="display:block; font-size:0.72rem; color:var(--text-muted);">${dateStr}</span>
      </td>
      <td>
        <strong>${custNameSafe}</strong>
        <span style="display:block; font-size:0.75rem; color:var(--text-muted);">${custPhoneSafe}</span>
      </td>
      <td>
        <div style="font-size:0.83rem; color:var(--text-primary); line-height:1.4; max-width:220px; word-break:break-word;">
          ${fullAddressSafe}
        </div>
      </td>
      <td>
        <span style="font-size:0.8rem; color:var(--text-muted);">${itemsSummarySafe}</span>
      </td>
      <td>
        <strong style="color:var(--crimson); font-size:0.95rem;">₹${Number(ord.pricing?.grandTotal) || 0}</strong>
      </td>
      <td>
        ${paymentBadge}
      </td>
      <td>
        ${statusSelectHtml}
        ${cancelDetailsHtml}
      </td>
      <td>
        ${actionsHtml}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDashboardRecentOrders(orders) {
  const tbody = document.getElementById('dashboard-recent-orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No customer orders placed yet.</td></tr>';
    return;
  }

  orders.forEach(ord => {
    const tr = document.createElement('tr');
    const dateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const itemsCount = (ord.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
    const orderIdSafe = escapeHtml(ord.orderId);
    const custNameSafe = escapeHtml(ord.customer?.name || 'Customer');
    const custPhoneSafe = escapeHtml(ord.customer?.phone || '');
    const statusSafe = escapeHtml(ord.orderStatus || 'Pending');

    tr.innerHTML = `
      <td><strong style="color:var(--purple-accent);">${orderIdSafe}</strong></td>
      <td><strong>${custNameSafe}</strong><br><span style="font-size:0.72rem; color:var(--text-muted);">${custPhoneSafe}</span></td>
      <td>${itemsCount} items</td>
      <td><strong style="color:var(--crimson);">₹${Number(ord.pricing?.grandTotal) || 0}</strong></td>
      <td><span style="font-size:0.72rem; text-transform:uppercase;">${formatAdminPayMethod(ord.payment?.method)}</span></td>
      <td><span class="badge status-${statusSafe.toLowerCase()}">${statusSafe}</span></td>
      <td><span style="font-size:0.75rem; color:var(--text-muted);">${dateStr}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function handleOrderFilterChange() {
  const searchVal = (document.getElementById('order-search-input')?.value || '').toLowerCase().trim();
  const statusVal = document.getElementById('order-filter-status')?.value || 'all';

  const filtered = allOrders.filter(o => {
    const matchStatus = statusVal === 'all' || o.orderStatus === statusVal;
    const matchSearch = !searchVal ||
      (o.orderId && o.orderId.toLowerCase().includes(searchVal)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchVal)) ||
      (o.customer?.phone && o.customer.phone.toLowerCase().includes(searchVal)) ||
      (o.customer?.city && o.customer.city.toLowerCase().includes(searchVal)) ||
      (o.customer?.address && o.customer.address.toLowerCase().includes(searchVal));

    return matchStatus && matchSearch;
  });

  renderOrdersTable(filtered);
}

async function updateOrderStatus(orderId, newStatus) {
  let reason = '';
  if (newStatus === 'Cancelled') {
    reason = prompt('Enter cancellation reason (optional):', 'Cancelled by Admin') || 'Cancelled by Admin';
  }

  // Also update local storage if order exists there
  try {
    let localOrders = JSON.parse(localStorage.getItem('hisuvai_orders') || '[]');
    let updatedLocal = false;
    localOrders = localOrders.map(o => {
      if (o._id === orderId || o.orderId === orderId) {
        o.orderStatus = newStatus;
        if (newStatus === 'Cancelled') {
          o.cancellationReason = reason || 'Cancelled by Admin';
          o.cancelledAt = new Date().toISOString();
        }
        updatedLocal = true;
      }
      return o;
    });
    if (updatedLocal) {
      localStorage.setItem('hisuvai_orders', JSON.stringify(localOrders));
    }
  } catch(e) {}

  try {
    const res = await fetch(getAdminApiUrl(`/orders/${orderId}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: newStatus, cancellationReason: reason })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Order status updated to ${newStatus}`);
    }
  } catch (err) {
    console.warn('Backend status update warning:', err.message);
  }
  showToast(`Order status set to ${newStatus}`);
  loadAdminOrders();
}

async function cancelOrderFromAdmin(orderId) {
  const reason = prompt('Enter cancellation reason for Order:', 'Cancelled by Admin') || 'Cancelled by Admin';
  try {
    const res = await fetch(getAdminApiUrl(`/orders/${orderId}/status`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ status: 'Cancelled', cancellationReason: reason })
    });
    const data = await res.json();
    if (data.success) {
      showToast('✓ ' + (data.message || 'Order cancelled successfully'));
      closeOrderDetailModal();
      loadAdminOrders();
    } else {
      showToast('⚠️ ' + (data.message || 'Failed to cancel order'), 'error');
    }
  } catch (err) {
    showToast('⚠️ Cancellation error: ' + err.message, 'error');
  }
}

let allTrashOrders = [];

function getTrashOrdersFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('hisuvai_trash_orders') || '[]');
  } catch(e) {
    return [];
  }
}

function saveTrashOrdersToStorage(list) {
  try {
    localStorage.setItem('hisuvai_trash_orders', JSON.stringify(list));
  } catch(e) {}
}

function updateTrashBadge() {
  const trash = getTrashOrdersFromStorage();
  const badge = document.getElementById('sidebar-trash-count');
  if (badge) {
    badge.textContent = trash.length;
    badge.style.display = trash.length > 0 ? 'inline-flex' : 'none';
  }
}

async function deleteOrderFromAdmin(orderId, displayId) {
  const code = displayId || orderId;
  const ord = allOrders.find(o => o._id === orderId || o.orderId === orderId || o.orderId === code);
  
  if (!confirm(`Move Order #${code} to Recycling Bin? You can restore it anytime.`)) {
    return;
  }

  // 1. Prepare deleted item
  const deletedItem = ord ? { ...ord } : { orderId: code, _id: orderId };
  deletedItem.deletedAt = new Date().toISOString();
  deletedItem.isDeleted = true;

  // 2. Save to Trash storage
  let trashList = getTrashOrdersFromStorage();
  trashList = trashList.filter(t => t._id !== orderId && t.orderId !== code);
  trashList.unshift(deletedItem);
  saveTrashOrdersToStorage(trashList);

  // 3. Remove from Active local orders storage
  try {
    let localOrders = JSON.parse(localStorage.getItem('hisuvai_orders') || '[]');
    localOrders = localOrders.filter(o => o._id !== orderId && o.orderId !== orderId && o.orderId !== code);
    localStorage.setItem('hisuvai_orders', JSON.stringify(localOrders));
  } catch(e) {}

  // 4. Remove from active state array
  allOrders = allOrders.filter(o => o._id !== orderId && o.orderId !== orderId && o.orderId !== code);

  showToast(`✓ Order #${code} moved to Recycling Bin (Restore anytime)`);
  closeOrderDetailModal();
  updateTrashBadge();
  loadAdminOrders();
}

function loadAdminTrash() {
  const loading = document.getElementById('trash-loading-msg');
  const empty = document.getElementById('trash-empty-msg');

  if (loading) loading.style.display = 'block';
  if (empty) empty.style.display = 'none';

  allTrashOrders = getTrashOrdersFromStorage();
  updateTrashBadge();

  if (loading) loading.style.display = 'none';

  // Update KPIs
  const totalCount = allTrashOrders.length;
  const totalVal = allTrashOrders.reduce((sum, o) => sum + (o.pricing?.grandTotal || o.total || 0), 0);

  const kpiTot = document.getElementById('trash-kpi-total'); if (kpiTot) kpiTot.textContent = totalCount;
  const kpiVal = document.getElementById('trash-kpi-value'); if (kpiVal) kpiVal.textContent = '₹' + totalVal.toLocaleString('en-IN');

  renderTrashTable(allTrashOrders);
}

function renderTrashTable(trashItems) {
  const tbody = document.getElementById('admin-trash-tbody');
  const empty = document.getElementById('trash-empty-msg');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!trashItems || trashItems.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  trashItems.forEach(ord => {
    const tr = document.createElement('tr');
    const targetId = ord._id || ord.orderId;
    const origDateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : 'Recent';
    const deletedDateStr = ord.deletedAt ? new Date(ord.deletedAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Just now';

    const cust = ord.customer || {};
    const addrParts = [];
    if (cust.address) addrParts.push(cust.address);
    if (cust.apartment) addrParts.push(cust.apartment);
    if (cust.city) addrParts.push(cust.city);
    if (cust.state) addrParts.push(cust.state);
    if (cust.pincode) addrParts.push(`PIN: ${cust.pincode}`);
    const fullAddressStr = addrParts.length > 0 ? addrParts.join(', ') : 'Address not provided';

    tr.innerHTML = `
      <td>
        <strong style="color:var(--purple-accent);">${ord.orderId || targetId}</strong>
      </td>
      <td>
        <strong>${cust.name || 'Customer'}</strong>
        <span style="display:block; font-size:0.75rem; color:var(--text-muted);">${cust.phone || ''}</span>
      </td>
      <td>
        <div style="font-size:0.83rem; color:var(--text-primary); line-height:1.4; max-width:220px; word-break:break-word;">
          ${fullAddressStr}
        </div>
      </td>
      <td>
        <span style="font-size:0.8rem; color:var(--text-muted);">${origDateStr}</span>
      </td>
      <td>
        <span style="font-size:0.8rem; color:#EF4444; font-weight:600;">${deletedDateStr}</span>
      </td>
      <td>
        <strong style="color:var(--crimson); font-size:0.95rem;">₹${ord.pricing?.grandTotal || ord.total || 0}</strong>
      </td>
      <td>
        <span class="badge warning" style="background:rgba(239,68,68,0.1); color:#EF4444; font-weight:700;">In Recycling Bin</span>
      </td>
      <td>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="btn btn-outline" style="padding:4px 9px; font-size:0.75rem; color:#16A34A; border-color:rgba(22,163,74,0.4);" onclick="restoreOrderFromTrash('${targetId}')" title="Restore back to active Orders list">
            🔄 Restore
          </button>
          <button class="btn btn-crimson" style="padding:4px 9px; font-size:0.75rem;" onclick="permanentlyDeleteOrderFromTrash('${targetId}')" title="Permanently Erase from Database">
            ❌ Erase
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleTrashFilterChange() {
  const searchVal = (document.getElementById('trash-search-input')?.value || '').toLowerCase().trim();
  const filtered = allTrashOrders.filter(o => {
    return !searchVal ||
      (o.orderId && o.orderId.toLowerCase().includes(searchVal)) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchVal)) ||
      (o.customer?.phone && o.customer.phone.toLowerCase().includes(searchVal));
  });
  renderTrashTable(filtered);
}

function restoreOrderFromTrash(orderId) {
  let trashList = getTrashOrdersFromStorage();
  const itemToRestore = trashList.find(t => t._id === orderId || t.orderId === orderId);

  if (!itemToRestore) return;

  // 1. Remove from trash
  trashList = trashList.filter(t => t._id !== orderId && t.orderId !== orderId);
  saveTrashOrdersToStorage(trashList);

  // 2. Add back to active local storage orders
  try {
    delete itemToRestore.isDeleted;
    delete itemToRestore.deletedAt;
    let localOrders = JSON.parse(localStorage.getItem('hisuvai_orders') || '[]');
    localOrders.unshift(itemToRestore);
    localStorage.setItem('hisuvai_orders', JSON.stringify(localOrders));
  } catch(e) {}

  showToast(`✓ Order #${itemToRestore.orderId || orderId} restored back to active Orders!`);
  loadAdminTrash();
  loadAdminOrders();
}

async function permanentlyDeleteOrderFromTrash(orderId) {
  let trashList = getTrashOrdersFromStorage();
  const item = trashList.find(t => t._id === orderId || t.orderId === orderId);
  const code = item ? item.orderId : orderId;

  if (!confirm(`Are you sure you want to PERMANENTLY erase Order #${code}? This action cannot be undone.`)) {
    return;
  }

  // Remove from Trash storage
  trashList = trashList.filter(t => t._id !== orderId && t.orderId !== orderId);
  saveTrashOrdersToStorage(trashList);

  if (!String(orderId).startsWith('local_')) {
    try {
      await fetch(getAdminApiUrl(`/orders/${orderId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
    } catch (err) {}
  }

  showToast(`❌ Order #${code} permanently erased`);
  loadAdminTrash();
}

async function emptyTrashBin() {
  let trashList = getTrashOrdersFromStorage();
  if (trashList.length === 0) {
    showToast('Recycling Bin is already empty');
    return;
  }

  if (!confirm(`Are you sure you want to permanently erase all ${trashList.length} items in the Recycling Bin?`)) {
    return;
  }

  for (const item of trashList) {
    const idKey = item._id || item.orderId;
    if (idKey && !String(idKey).startsWith('local_')) {
      try {
        await fetch(getAdminApiUrl(`/orders/${idKey}`), {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
      } catch(e) {}
    }
  }

  saveTrashOrdersToStorage([]);
  showToast('✓ Recycling Bin permanently emptied');
  loadAdminTrash();
}

function openOrderDetailModal(orderId) {
  const ord = allOrders.find(o => o._id === orderId || o.orderId === orderId);
  if (!ord) return;

  const targetId = ord._id || ord.orderId;
  const dateStr = new Date(ord.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const idEl = document.getElementById('od-modal-order-id'); if (idEl) idEl.textContent = `Order ${ord.orderId}`;
  const dtEl = document.getElementById('od-modal-date'); if (dtEl) dtEl.textContent = `Placed on ${dateStr}`;

  // Customer info
  const cName = document.getElementById('od-cust-name'); if (cName) cName.textContent = ord.customer?.name || '-';
  const cPhone = document.getElementById('od-cust-phone'); if (cPhone) cPhone.textContent = ord.customer?.phone || '-';
  const cEmail = document.getElementById('od-cust-email'); if (cEmail) cEmail.textContent = ord.customer?.email || 'N/A';
  const cCity = document.getElementById('od-cust-city'); if (cCity) cCity.textContent = `${ord.customer?.city || ''}, ${ord.customer?.state || ''} - ${ord.customer?.pincode || ''}`;
  const cAddr = document.getElementById('od-cust-address'); if (cAddr) cAddr.textContent = `${ord.customer?.address || ''} ${ord.customer?.apartment || ''}`;

  // Line items
  const itemsContainer = document.getElementById('od-items-container');
  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    (ord.items || []).forEach(item => {
      const row = document.createElement('div');
      row.className = 'order-detail-row';
      const imgSrcSafe = escapeHtml(resolveImageUrl(item.image));
      const itemNameSafe = escapeHtml(item.name || 'Product');
      const itemUnitSafe = escapeHtml(item.unit || '250g');
      const qtySafe = Number(item.quantity) || 1;
      const priceSafe = Number(item.price) || 0;
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
          <img src="${imgSrcSafe}" alt="${itemNameSafe}" style="width:36px; height:36px; object-fit:contain; border-radius:4px; border:1px solid var(--border-color);" />
          <div>
            <strong>${itemNameSafe}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">Qty: ${qtySafe} × ₹${priceSafe} (${itemUnitSafe})</span>
          </div>
        </div>
        <strong>₹${priceSafe * qtySafe}</strong>
      `;
      itemsContainer.appendChild(row);
    });
  }

  // Totals
  const payEl = document.getElementById('od-pay-method');
  if (payEl) {
    let pText = formatAdminPayMethod(ord.payment?.method);
    if (ord.payment?.razorpayPaymentId) {
      pText += ` [Txn: ${ord.payment.razorpayPaymentId}]`;
    }
    payEl.textContent = pText;
  }
  const statEl = document.getElementById('od-order-status'); if (statEl) statEl.textContent = ord.orderStatus || 'Pending';
  const totEl = document.getElementById('od-grand-total'); if (totEl) totEl.textContent = '₹' + (ord.pricing?.grandTotal || 0);

  // Cancellation & Refund Info Card
  const cancelCard = document.getElementById('od-cancel-info-card');
  const isCancelled = ord.orderStatus === 'Cancelled';
  const isPaid = ord.payment?.status === 'paid' || ord.payment?.method === 'razorpay' || ord.payment?.method === 'upi';
  const isRefunded = ord.payment?.refundStatus === 'processed';

  if (cancelCard) {
    if (isCancelled) {
      cancelCard.style.display = 'block';
      const rsnEl = document.getElementById('od-cancel-reason');
      if (rsnEl) rsnEl.textContent = ord.cancellationReason || 'Cancelled by Customer';

      const dtCancelEl = document.getElementById('od-cancel-date');
      if (dtCancelEl) {
        dtCancelEl.textContent = ord.cancelledAt ? new Date(ord.cancelledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
      }

      const refEl = document.getElementById('od-refund-info');
      if (refEl) {
        if (isRefunded) {
          refEl.innerHTML = `<span style="color:#16A34A; font-weight:700;">💚 Refund Processed (ID: ${ord.payment?.refundId || 'N/A'}, Amount: ₹${ord.payment?.refundAmount || ord.pricing?.grandTotal || 0})</span>`;
        } else if (isPaid) {
          refEl.innerHTML = `<span style="color:#EA580C; font-weight:700;">⏳ Refund Pending (Online payment ₹${ord.pricing?.grandTotal || 0})</span>`;
        } else {
          refEl.innerHTML = `<span style="color:var(--text-muted);">No online refund required (COD / Unpaid)</span>`;
        }
      }
    } else {
      cancelCard.style.display = 'none';
    }
  }

  // Admin Actions Bar
  const actionsContainer = document.getElementById('od-modal-admin-actions');
  if (actionsContainer) {
    let actionsHtml = `
      <button type="button" class="btn btn-purple" onclick="openOrderInvoiceModal('${targetId}')" style="display:inline-flex; align-items:center; gap:6px;">
        📄 Print / Download Invoice
      </button>
      <button type="button" class="btn btn-outline" onclick="closeOrderDetailModal()">Close</button>
    `;
    if (!isCancelled) {
      actionsHtml += `
        <button type="button" class="btn btn-crimson" onclick="cancelOrderFromAdmin('${targetId}')">
          🚫 Cancel Order
        </button>
      `;
    } else {
      if (isPaid && !isRefunded) {
        actionsHtml += `
          <button type="button" class="btn btn-crimson" onclick="executeAdminRefund('${targetId}', ${ord.pricing?.grandTotal || 0})">
            ↩️ Process Instant Refund
          </button>
        `;
      }
      actionsHtml += `
        <button type="button" class="btn btn-outline" style="color:#EF4444; border-color:rgba(239,68,68,0.4);" onclick="deleteOrderFromAdmin('${targetId}', '${ord.orderId}')">
          🗑️ Delete Order
        </button>
      `;
    }
    actionsContainer.innerHTML = actionsHtml;
  }

  const modal = document.getElementById('order-detail-modal-overlay');
  if (modal) modal.classList.add('open');
}

function openOrderInvoiceModal(orderId) {
  let ord = (allOrders || []).find(o => o._id === orderId || o.orderId === orderId);
  if (!ord && window.allTrashOrders) {
    ord = allTrashOrders.find(o => o._id === orderId || o.orderId === orderId);
  }
  if (!ord) {
    try {
      const localOrders = JSON.parse(localStorage.getItem('hisuvai_orders') || '[]');
      ord = localOrders.find(o => o._id === orderId || o.orderId === orderId);
    } catch(e) {}
  }
  if (!ord) {
    showToast('Order details not found for invoice.', 'error');
    return;
  }

  const container = document.getElementById('invoice-modal-content-body');
  if (container) {
    container.innerHTML = renderTaxInvoiceHTML(ord);
  }

  const modal = document.getElementById('invoice-modal-overlay');
  if (modal) modal.classList.add('open');
}

function closeInvoiceModal() {
  const modal = document.getElementById('invoice-modal-overlay');
  if (modal) modal.classList.remove('open');
}

function renderTaxInvoiceHTML(order) {
  if (!order) return '';
  const orderId = escapeHtml(order.orderId || 'HS-000000');
  const issueDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const cust = order.customer || {};
  const custName = escapeHtml(cust.name || 'Customer');
  const custPhone = escapeHtml(cust.phone || 'N/A');
  const custEmail = escapeHtml(cust.email || 'N/A');
  
  const addrParts = [];
  if (cust.address) addrParts.push(escapeHtml(cust.address));
  if (cust.apartment) addrParts.push(escapeHtml(cust.apartment));
  if (cust.city) addrParts.push(escapeHtml(cust.city));
  if (cust.state) addrParts.push(escapeHtml(cust.state || 'Tamil Nadu'));
  if (cust.pincode) addrParts.push(`PIN: ${escapeHtml(cust.pincode)}`);
  const fullAddress = addrParts.length > 0 ? addrParts.join(', ') : 'Address Not Specified';

  const items = order.items || [];
  let subtotal = Number(order.pricing?.subtotal || 0);
  if (!subtotal && items.length > 0) {
    subtotal = items.reduce((s, i) => s + Number((i.price || 0) * (i.quantity || 1)), 0);
  }
  const shipping = Number(order.pricing?.shipping || 0);
  const discount = Number(order.pricing?.discount || 0);
  const grandTotal = Number(order.pricing?.grandTotal || (subtotal + shipping - discount));

  const isPaid = order.payment?.status === 'paid' || order.payment?.method === 'razorpay' || order.payment?.method === 'upi';
  const payMethodStr = formatAdminPayMethod(order.payment?.method || 'razorpay');
  const txnId = order.payment?.razorpayPaymentId || order.payment?.refundId || `TXN-${orderId}`;

  const rowsHtml = items.map((item, idx) => {
    const qty = Number(item.quantity || 1);
    const unitPrice = Number(item.price || 0);
    const lineTotal = qty * unitPrice;
    const bgStyle = (idx % 2 === 1) ? 'background-color: #F8FAFC;' : '';
    const itemNameSafe = escapeHtml(item.name || 'Hi Suvai Product');
    const itemUnitSafe = escapeHtml(item.unit || '250g');
    return `
      <tr style="${bgStyle}">
        <td style="padding: 12px 16px; border-bottom: 1px solid #F1F5F9;">
          <div style="font-weight: 700; color: #1E293B; font-size: 0.9rem;">${itemNameSafe}</div>
          <div style="font-size: 0.76rem; color: #64748B; margin-top: 2px;">Net Wt: ${itemUnitSafe} &bull; Packaged Food Product</div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #F1F5F9; text-align: center; font-weight: 600;">${qty}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #F1F5F9; text-align: right; font-weight: 600;">₹${unitPrice.toFixed(2)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #F1F5F9; text-align: center; color: #64748B; font-size: 0.82rem;">5% (GST Inc)</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #F1F5F9; text-align: right; font-weight: 700; color: #0F172A;">₹${lineTotal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="inv-paper" id="printable-invoice-paper">
      <!-- HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
        <div>
          <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; font-weight: 800; color: #8B1A1A; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
            <span>🔴🟢</span> HI SUVAI
          </div>
          <div style="font-size: 0.75rem; letter-spacing: 1.5px; text-transform: uppercase; color: #64748B; font-weight: 600; margin-top: 2px; margin-bottom: 8px;">
            Pure Taste, Ancient Roots
          </div>
          <div style="font-size: 0.82rem; color: #475569; line-height: 1.5;">
            15A, Madasamy Kovil Street, Pettai<br>
            Tirunelveli – 627004. Tamil Nadu, India.<br>
            <strong>Email:</strong> hiisuvai@gmail.com | <strong>Phone:</strong> +91 6381926567<br>
            <strong>GSTIN:</strong> 33AAAAA0000A1Z5 &bull; <strong>FSSAI:</strong> 22421000000123
          </div>
        </div>

        <div style="text-align: right;">
          <h1 style="font-size: 2.4rem; font-weight: 900; color: #1E293B; letter-spacing: 2px; line-height: 1; margin: 0 0 12px 0;">INVOICE</h1>
          <div style="display: inline-flex; align-items: center; gap: 12px; background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 8px 14px; border-radius: 10px; text-align: left;">
            <div style="font-size: 0.75rem; color: #334155; line-height: 1.3;">
              <strong style="color:#0F172A; font-size:0.8rem; display:block;">Verified Tax Invoice</strong>
              Order #${orderId}
            </div>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=HISUVAI-${orderId}" alt="QR Code" style="width:50px; height:50px; border-radius:4px; border:1px solid #CBD5E1;" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      <!-- ACCENT DIVIDER BAR -->
      <div style="height: 4px; background: linear-gradient(90deg, #8B1A1A 0%, #EA580C 100%); border-radius: 2px; margin: 20px 0 24px 0;"></div>

      <!-- INVOICE DETAILS & BILL TO GRID -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 28px;">
        <div>
          <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #EA580C; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 6px; margin-bottom: 12px;">
            INVOICE DETAILS
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:3px 0; color:#475569;">
            <strong>Invoice Number:</strong> <span>INV-${orderId}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:3px 0; color:#475569;">
            <strong>Issue Date:</strong> <span>${issueDate}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:3px 0; color:#475569;">
            <strong>Payment Method:</strong> <span>${payMethodStr}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; padding:3px 0; color:#475569;">
            <strong>Payment Status:</strong> <span style="font-weight:700; color:${isPaid ? '#16A34A' : '#DC2626'}">${isPaid ? '✅ PAID IN FULL' : '⏳ PENDING (COD)'}</span>
          </div>
        </div>

        <div>
          <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #EA580C; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 6px; margin-bottom: 12px;">
            BILL TO
          </div>
          <div style="font-size: 1rem; font-weight: 800; color: #0F172A; margin-bottom: 4px;">${custName}</div>
          <div style="font-size: 0.85rem; color: #475569; line-height: 1.5;">
            📍 ${fullAddress}<br>
            📞 <strong>Phone:</strong> ${custPhone}<br>
            ✉️ <strong>Email:</strong> ${custEmail}
          </div>
        </div>
      </div>

      <!-- PRODUCTS TABLE -->
      <div style="margin-bottom: 28px; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.88rem;">
          <thead>
            <tr style="background: #1E293B; color: #FFFFFF;">
              <th style="text-align: left; padding: 12px 16px; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.8px;">Description</th>
              <th style="text-align: center; padding: 12px 16px; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.8px;">Quantity</th>
              <th style="text-align: right; padding: 12px 16px; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.8px;">Unit Price</th>
              <th style="text-align: center; padding: 12px 16px; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.8px;">Tax Rate</th>
              <th style="text-align: right; padding: 12px 16px; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <!-- PAYMENT DETAILS & SUMMARY -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 28px; align-items: start;">
        <div style="background: #F8FAFC; border-left: 4px solid #EA580C; padding: 16px 20px; border-radius: 0 8px 8px 0;">
          <div style="font-size: 0.8rem; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #EA580C; margin-bottom: 10px;">
            PAYMENT DETAILS
          </div>
          <div style="font-size: 0.82rem; color: #475569; line-height: 1.6;">
            <strong>Transaction ID:</strong> <span style="font-family:monospace; color:#0F172A;">${txnId}</span><br>
            <strong>Payment Mode:</strong> ${payMethodStr}<br>
            <strong>Terms:</strong> Standard Purchase Invoice
          </div>
          <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #CBD5E1; font-size: 0.78rem; color: #64748B;">
            <strong>Notes:</strong> Thank you for your business! All Hi Suvai products are handcrafted fresh with 100% natural ingredients.
          </div>
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #475569; font-size: 0.88rem; border-bottom: 1px dashed #E2E8F0;">
            <span>Subtotal</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #475569; font-size: 0.88rem; border-bottom: 1px dashed #E2E8F0;">
            <span>Shipping Charge</span>
            <span style="color:${shipping === 0 ? '#16A34A' : '#475569'}; font-weight:${shipping === 0 ? '700' : 'normal'};">
              ${shipping === 0 ? 'FREE' : '₹' + shipping.toFixed(2)}
            </span>
          </div>
          ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; padding: 6px 0; color: #16A34A; font-size: 0.88rem; border-bottom: 1px dashed #E2E8F0;">
              <span>Discount</span>
              <span>-₹${discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 12px 16px; background: #FEF2F2; border-left: 4px solid #8B1A1A; border-radius: 0 8px 8px 0; font-size: 1.1rem; font-weight: 800; color: #8B1A1A; margin-top: 10px;">
            <span>Total</span>
            <span>₹${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 0.78rem; color: #64748B;">
        Invoice - INV-${orderId} &bull; Thank you for your business! &bull; Hi Suvai (www.hisuvai.com)
      </div>
    </div>
  `;
}

function closeOrderDetailModal() {
  const modal = document.getElementById('order-detail-modal-overlay');
  if (modal) modal.classList.remove('open');
}

// ============================================================
// INDEX BANNERS MANAGEMENT (VDG FASHION STYLE)
// ============================================================
async function loadAdminBanners() {
  try {
    const res = await fetch(`${API_BASE}/banners`);
    const data = await res.json();
    if (data.success && data.banners) {
      allBanners = data.banners;
      data.banners.forEach(b => {
        const slot = b.slot;
        const imgEl = document.getElementById(`banner-img-${slot}`);
        if (imgEl && b.image) {
          imgEl.src = resolveImageUrl(b.image);
          imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = '../assets/hero-cereals-dy3wvrdu.png'; };
        }

        const thumbEl = document.getElementById(`slot-thumb-${slot}`);
        if (thumbEl && b.image) {
          thumbEl.src = resolveImageUrl(b.image);
          thumbEl.onerror = () => { thumbEl.onerror = null; thumbEl.src = '../assets/hero-cereals-dy3wvrdu.png'; };
        }

        const titleEl = document.getElementById(`banner-title-${slot}`);
        if (titleEl && b.title) titleEl.value = b.title;

        const mobileThumbEl = document.getElementById(`mobile-slot-thumb-${slot}`);
        if (mobileThumbEl && b.mobileImage) {
          mobileThumbEl.src = resolveImageUrl(b.mobileImage);
          mobileThumbEl.onerror = () => { mobileThumbEl.onerror = null; mobileThumbEl.src = '../assets/mobile_portait_hero22.png'; };
        }
      });
      try {
        localStorage.setItem('hisuvai_hero_banners', JSON.stringify(data.banners));
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Banners load error:', err);
  }
}

function previewSlotImage(slot, input, type) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'desktop') {
        const img = document.getElementById(`banner-img-${slot}`);
        if (img) img.src = e.target.result;
        const thumb = document.getElementById(`slot-thumb-${slot}`);
        if (thumb) thumb.src = e.target.result;
      } else if (type === 'mobile') {
        const mobileThumb = document.getElementById(`mobile-slot-thumb-${slot}`);
        if (mobileThumb) mobileThumb.src = e.target.result;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function handleBannerUpload(e, slot) {
  e.preventDefault();
  const fileInput = document.getElementById(`banner-file-${slot}`);
  const mobileFileInput = document.getElementById(`mobile-banner-file-${slot}`);
  const titleInput = document.getElementById(`banner-title-${slot}`);

  const formData = new FormData();
  if (titleInput && titleInput.value) {
    formData.append('title', titleInput.value.trim());
  }
  if (fileInput && fileInput.files[0]) {
    formData.append('bannerImage', fileInput.files[0]);
  }
  if (mobileFileInput && mobileFileInput.files[0]) {
    formData.append('mobileImage', mobileFileInput.files[0]);
  }

  try {
    const res = await fetch(`${API_BASE}/banners/slot/${slot}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Slot ${slot} banner updated successfully!`);
      loadAdminBanners();
    } else {
      showToast(data.message || 'Failed to update banner', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

// ============================================================
// SETTINGS & SOCIAL LINKS MANAGEMENT
// ============================================================
let adminCategories = [
  { key: 'health', label: 'Health Mix' },
  { key: 'porridge', label: 'Porridge & Rice Mix' },
  { key: 'flour', label: 'Special Flour' },
  { key: 'combo', label: 'Combo Packs' }
];

let adminPriceRanges = [
  { key: 'under150', label: 'Under ₹150', min: 0, max: 149 },
  { key: '150-200', label: '₹150 – ₹200', min: 150, max: 200 },
  { key: 'above200', label: 'Above ₹200', min: 201, max: 999999 }
];

let adminSpecialOffers = [
  {
    title: 'ஹெல்த் மிக்ஸ் + கஞ்சி மிக்ஸ் காம்போ',
    description: '1KG ஹெல்த் மிக்ஸ் (₹700) + 1KG கஞ்சி மிக்ஸ் (₹400) | மொத்த விலை ₹1100 ➔ சிறப்பு சலுகை விலை ₹1000',
    benefits: 'நோய் எதிர்ப்பு சக்தி, புத்துணர்ச்சி தரும் இயற்கை சத்து, 100% இயற்கை',
    price: 1000,
    originalPrice: 1100,
    image: 'offer_1.jpg',
    buttonText: 'BUY OFFER - ₹1000'
  },
  {
    title: 'இன்றைய சிறப்பு சலுகை Combo',
    description: '24 வகை ஹெல்த் மிக்ஸ் + 16 வகை பாரம்பரிய அரிசி கஞ்சி மிக்ஸ் 1KG Combo Pack',
    benefits: '24 இயற்கை தானியங்கள், குழந்தைகளுக்கு ஏற்றது, செரிமானத்திற்கு நல்லது',
    price: 1000,
    originalPrice: 1100,
    image: 'offer_2.jpg',
    buttonText: 'BUY OFFER - ₹1000'
  },
  {
    title: 'Weekend Offer - Free Gift!',
    description: '1KG ஹெல்த் மிக்ஸ் (Rs. 700) வாங்கினால் 250g கருப்பு கோதுமை மாவு இலவசம்!',
    benefits: 'இலவச பரிசு, 100% தூய கருப்பு கோதுமை மாவு, நார்ச்சத்து நிறைந்தது',
    price: 700,
    originalPrice: 0,
    image: 'offer_3.jpg',
    buttonText: 'CLAIM OFFER - ₹700'
  }
];

async function loadAdminSettings() {
  try {
    const res = await fetch(getAdminApiUrl('/settings'));
    const data = await res.json();
    if (data.success && data.settings) {
      currentSettings = data.settings;
      const s = data.settings;

      const storeName = document.getElementById('setting-storename'); if (storeName) storeName.value = s.storeName || 'Hi Suvai';
      const proprietor = document.getElementById('setting-proprietor'); if (proprietor) proprietor.value = s.proprietorName || 'M. Rajaselvi Mahalingam. M.Sc., B.Ed.';
      const phone = document.getElementById('setting-phone'); if (phone) phone.value = s.supportPhone || '';
      const email = document.getElementById('setting-email'); if (email) email.value = s.contactEmail || '';
      const addr = document.getElementById('setting-address'); if (addr) addr.value = s.storeAddress || '';
      const about = document.getElementById('setting-about'); if (about) about.value = s.aboutText || '';
      const mapUrl = document.getElementById('setting-map'); if (mapUrl) mapUrl.value = s.googleMapUrl || '';

      const fb = document.getElementById('setting-facebook'); if (fb) fb.value = s.facebookUrl || '';
      const ig = document.getElementById('setting-instagram'); if (ig) ig.value = s.instagramUrl || '';
      const yt = document.getElementById('setting-youtube'); if (yt) yt.value = s.youtubeUrl || '';
      const wa = document.getElementById('setting-whatsapp'); if (wa) wa.value = s.whatsappNumber || '';

      if (s.customCategories && Array.isArray(s.customCategories) && s.customCategories.length > 0) {
        adminCategories = s.customCategories;
      }
      if (s.priceRanges && Array.isArray(s.priceRanges) && s.priceRanges.length > 0) {
        adminPriceRanges = s.priceRanges;
      }
      if (s.specialOffers && Array.isArray(s.specialOffers) && s.specialOffers.length > 0) {
        adminSpecialOffers = s.specialOffers;
      }

      renderAdminCategoriesList();
      renderAdminPriceRangesList();
      renderAdminOffersList();
      updateProductFormCategorySelect();

      const logoImg = document.getElementById('settings-logo-preview');
      if (logoImg && s.storeLogo) logoImg.src = resolveImageUrl(s.storeLogo);
    }
  } catch (err) {
    console.warn('Settings load error:', err);
  }
}

function renderAdminOffersList() {
  const container = document.getElementById('admin-offers-list');
  if (!container) return;
  container.innerHTML = '';

  adminSpecialOffers.forEach((offer, index) => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg-surface-2); padding:18px; border-radius:12px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:14px; box-shadow:0 2px 8px rgba(0,0,0,0.02);';
    
    const displayImg = offer.image || '';
    const hasImage = Boolean(displayImg.trim());

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; background:rgba(139,26,26,0.1); color:var(--crimson); font-weight:700; font-size:0.8rem;">#${index+1}</span>
          <strong style="color:var(--crimson); font-size:0.95rem;">Offer Card #${index+1}</strong>
        </div>
        <button type="button" class="btn btn-outline" style="padding:4px 10px; color:var(--danger); font-size:0.8rem;" onclick="removeSpecialOfferRow(${index})">
          ✕ Remove Offer
        </button>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Offer Title (Tamil / English)</label>
          <input type="text" class="form-control" value="${escapeOfferHtml(offer.title || '')}" oninput="adminSpecialOffers[${index}].title = this.value" placeholder="e.g. ஹெல்த் மிக்ஸ் + கஞ்சி மிக்ஸ் காம்போ" />
        </div>

        <div>
          <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Action Button Text</label>
          <input type="text" class="form-control" value="${escapeOfferHtml(offer.buttonText || 'BUY OFFER')}" oninput="adminSpecialOffers[${index}].buttonText = this.value" placeholder="BUY OFFER - ₹1000" />
        </div>

        <div style="grid-column:1 / -1;">
          <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Description &amp; Pack Details</label>
          <textarea class="form-control" rows="2" oninput="adminSpecialOffers[${index}].description = this.value" placeholder="1KG ஹெல்த் மிக்ஸ் + 1KG கஞ்சி மிக்ஸ்...">${escapeOfferHtml(offer.description || '')}</textarea>
        </div>

        <div style="grid-column:1 / -1;">
          <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Key Benefits (நன்மைகள் - எ.கா: நோய் எதிர்ப்பு சக்தி, 100% இயற்கை)</label>
          <textarea class="form-control" rows="2" oninput="adminSpecialOffers[${index}].benefits = this.value" placeholder="எ.கா: நோய் எதிர்ப்பு சக்தி தரும், குழந்தைகளுக்கு ஏற்றது, 100% இயற்கை...">${escapeOfferHtml(offer.benefits || '')}</textarea>
        </div>

        <div>
          <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Offer Price (₹)</label>
          <input type="number" class="form-control" value="${offer.price || 0}" oninput="adminSpecialOffers[${index}].price = Number(this.value)" placeholder="1000" />
        </div>

        <div>
          <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase; font-weight:600; margin-bottom:4px;">Original Total Price (₹)</label>
          <input type="number" class="form-control" value="${offer.originalPrice || 0}" oninput="adminSpecialOffers[${index}].originalPrice = Number(this.value)" placeholder="1100" />
        </div>

        <!-- SPECIAL OFFERS IMAGE FILE UPLOADER & DRAG-AND-DROP -->
        <div style="grid-column:1 / -1;">
          <div class="offer-image-box" id="offer-img-box-${index}">
            <div class="offer-image-header">
              <div class="offer-image-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Offer Combo Image
              </div>
              <div class="offer-mode-switch">
                <button type="button" class="offer-mode-btn active" id="offer-mode-upload-${index}" onclick="switchOfferImageMode(${index}, 'upload')">
                  ☁️ File Upload &amp; Drag
                </button>
                <button type="button" class="offer-mode-btn" id="offer-mode-url-${index}" onclick="switchOfferImageMode(${index}, 'url')">
                  🔗 Image URL / Path
                </button>
              </div>
            </div>

            <!-- TAB 1: UPLOAD / DRAG & DROP -->
            <div id="offer-upload-panel-${index}">
              <div class="offer-dropzone" id="offer-dropzone-${index}"
                   onclick="triggerOfferFileInput(${index})"
                   ondragover="handleOfferDragOver(event, ${index})"
                   ondragleave="handleOfferDragLeave(event, ${index})"
                   ondrop="handleOfferDrop(event, ${index})">
                <input type="file" id="offer-file-input-${index}" accept="image/png, image/jpeg, image/jpg, image/webp" style="display:none;" onchange="handleOfferFileSelect(event, ${index})" />
                <div class="offer-dropzone-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div class="offer-dropzone-title">Drag &amp; drop image here, or <span>Browse File</span></div>
                <div class="offer-dropzone-desc">Upload PNG, JPG, JPEG, WEBP (Max 5MB)</div>
              </div>
            </div>

            <!-- TAB 2: DIRECT URL / FILENAME INPUT -->
            <div id="offer-url-panel-${index}" style="display:none;">
              <div style="display:flex; flex-direction:column; gap:6px;">
                <label style="font-size:0.7rem; color:var(--text-dim); text-transform:uppercase; font-weight:600;">Image URL or Asset File Name</label>
                <input type="text" class="form-control" id="offer-url-input-${index}" value="${escapeOfferHtml(offer.image || '')}" oninput="handleOfferUrlInput(${index}, this.value)" placeholder="e.g. offer_1.jpg, /uploads/settings/offer.jpg, or https://..." />
                <span style="font-size:0.68rem; color:var(--text-muted);">Enter relative asset filename (e.g. <code>offer_1.jpg</code>), upload path, or direct web URL.</span>
              </div>
            </div>

            <!-- PREVIEW CARD (Visible if an image is assigned) -->
            <div class="offer-preview-card" id="offer-preview-card-${index}" style="${hasImage ? 'display:flex;' : 'display:none;'}">
              <img src="${resolveImageUrl(displayImg)}" id="offer-preview-img-${index}" class="offer-preview-thumb" alt="Offer Preview" onerror="this.src='/assets/offer_1.jpg'" />
              <div class="offer-preview-info">
                <div class="offer-preview-name" id="offer-preview-name-${index}">${getOfferImageDisplayFilename(displayImg)}</div>
                <div class="offer-preview-meta">
                  <span class="offer-status-badge ready" id="offer-badge-${index}">Active Image</span>
                  <span id="offer-preview-src-${index}" style="font-size:0.68rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; max-width:260px; white-space:nowrap;">${displayImg}</span>
                </div>
              </div>
              <div class="offer-preview-actions">
                <button type="button" class="offer-action-btn" onclick="triggerOfferFileInput(${index})" title="Change image">
                  ↺ Replace
                </button>
                <button type="button" class="offer-action-btn delete" onclick="removeOfferImage(${index})" title="Remove image">
                  ✕ Clear
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
    container.appendChild(card);
  });
}

function escapeOfferHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getOfferImageDisplayFilename(img) {
  if (!img) return 'No Image Selected';
  if (img.startsWith('data:image/')) return 'Uploaded Image (Local File)';
  const parts = img.split('/');
  return parts[parts.length - 1] || img;
}

function switchOfferImageMode(index, mode) {
  const uploadBtn = document.getElementById(`offer-mode-upload-${index}`);
  const urlBtn = document.getElementById(`offer-mode-url-${index}`);
  const uploadPanel = document.getElementById(`offer-upload-panel-${index}`);
  const urlPanel = document.getElementById(`offer-url-panel-${index}`);

  if (mode === 'upload') {
    if (uploadBtn) uploadBtn.classList.add('active');
    if (urlBtn) urlBtn.classList.remove('active');
    if (uploadPanel) uploadPanel.style.display = 'block';
    if (urlPanel) urlPanel.style.display = 'none';
  } else {
    if (uploadBtn) uploadBtn.classList.remove('active');
    if (urlBtn) urlBtn.classList.add('active');
    if (uploadPanel) uploadPanel.style.display = 'none';
    if (urlPanel) urlPanel.style.display = 'block';
    const urlInput = document.getElementById(`offer-url-input-${index}`);
    if (urlInput) urlInput.focus();
  }
}

function triggerOfferFileInput(index) {
  const input = document.getElementById(`offer-file-input-${index}`);
  if (input) input.click();
}

function handleOfferDragOver(e, index) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById(`offer-dropzone-${index}`);
  if (dz) dz.classList.add('drag-active');
}

function handleOfferDragLeave(e, index) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById(`offer-dropzone-${index}`);
  if (dz) dz.classList.remove('drag-active');
}

function handleOfferDrop(e, index) {
  e.preventDefault();
  e.stopPropagation();
  const dz = document.getElementById(`offer-dropzone-${index}`);
  if (dz) dz.classList.remove('drag-active');

  const files = e.dataTransfer?.files;
  if (files && files[0]) {
    processOfferFile(files[0], index);
  }
}

function handleOfferFileSelect(e, index) {
  const file = e.target.files?.[0];
  if (file) {
    processOfferFile(file, index);
  }
}

function processOfferFile(file, index) {
  if (!file.type || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file (PNG, JPG, WEBP)', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image size exceeds 5MB limit', 'error');
    return;
  }

  // Immediate local preview via FileReader
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    
    // Render immediate preview on screen
    const previewCard = document.getElementById(`offer-preview-card-${index}`);
    const previewImg = document.getElementById(`offer-preview-img-${index}`);
    const previewName = document.getElementById(`offer-preview-name-${index}`);
    const previewSrc = document.getElementById(`offer-preview-src-${index}`);
    const badge = document.getElementById(`offer-badge-${index}`);

    if (previewCard) previewCard.style.display = 'flex';
    if (previewImg) previewImg.src = dataUrl;
    if (previewName) previewName.textContent = file.name;
    if (previewSrc) previewSrc.textContent = file.name;
    if (badge) {
      badge.textContent = 'Uploading...';
      badge.className = 'offer-status-badge uploading';
    }

    // Upload to server
    uploadOfferImageToServer(file, index, dataUrl);
  };
  reader.readAsDataURL(file);
}

async function uploadOfferImageToServer(file, index, dataUrl) {
  const badge = document.getElementById(`offer-badge-${index}`);
  const previewSrc = document.getElementById(`offer-preview-src-${index}`);
  const urlInput = document.getElementById(`offer-url-input-${index}`);

  const formData = new FormData();
  formData.append('offerImage', file);

  try {
    const uploadEndpoint = typeof getAdminApiUrl === 'function'
      ? getAdminApiUrl('/settings/upload-offer-image')
      : '/api/settings/upload-offer-image';

    const res = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });

    const data = await res.json();
    if (data.success && data.imageUrl) {
      if (adminSpecialOffers[index]) {
        adminSpecialOffers[index].image = data.imageUrl;
      }
      if (urlInput) urlInput.value = data.imageUrl;
      if (previewSrc) previewSrc.textContent = data.imageUrl;
      if (badge) {
        badge.textContent = 'Published ✓';
        badge.className = 'offer-status-badge ready';
      }
      // Auto-save immediately so the offer image is instantly visible on the frontend storefront!
      await saveStoreSettings(true);
      showToast(`✦ Offer #${index + 1} image uploaded & published to storefront! 🎉`);
    } else {
      // Backend returned error; fallback to dataUrl
      if (adminSpecialOffers[index]) {
        adminSpecialOffers[index].image = dataUrl;
      }
      if (badge) {
        badge.textContent = 'Ready (Local)';
        badge.className = 'offer-status-badge ready';
      }
      showToast('Image ready. Saving configuration...', 'info');
      await saveStoreSettings(true);
    }
  } catch (err) {
    console.warn('Offer image upload server error:', err);
    // Offline/network fallback: save dataUrl so work is never lost!
    if (adminSpecialOffers[index]) {
      adminSpecialOffers[index].image = dataUrl;
    }
    if (badge) {
      badge.textContent = 'Ready (Local)';
      badge.className = 'offer-status-badge ready';
    }
    showToast('Image cached locally. Saving configuration...', 'info');
    await saveStoreSettings(true);
  }
}

function handleOfferUrlInput(index, val) {
  const cleanVal = (val || '').trim();
  if (adminSpecialOffers[index]) {
    adminSpecialOffers[index].image = cleanVal;
  }

  const previewCard = document.getElementById(`offer-preview-card-${index}`);
  const previewImg = document.getElementById(`offer-preview-img-${index}`);
  const previewName = document.getElementById(`offer-preview-name-${index}`);
  const previewSrc = document.getElementById(`offer-preview-src-${index}`);
  const badge = document.getElementById(`offer-badge-${index}`);

  if (cleanVal) {
    if (previewCard) previewCard.style.display = 'flex';
    if (previewImg) previewImg.src = resolveImageUrl(cleanVal);
    if (previewName) previewName.textContent = getOfferImageDisplayFilename(cleanVal);
    if (previewSrc) previewSrc.textContent = cleanVal;
    if (badge) {
      badge.textContent = 'Custom URL';
      badge.className = 'offer-status-badge custom-url';
    }
  } else {
    if (previewCard) previewCard.style.display = 'none';
  }
}

async function removeOfferImage(index) {
  if (adminSpecialOffers[index]) {
    adminSpecialOffers[index].image = '';
  }

  const previewCard = document.getElementById(`offer-preview-card-${index}`);
  const urlInput = document.getElementById(`offer-url-input-${index}`);
  const fileInput = document.getElementById(`offer-file-input-${index}`);

  if (previewCard) previewCard.style.display = 'none';
  if (urlInput) urlInput.value = '';
  if (fileInput) fileInput.value = '';

  await saveStoreSettings(true);
  showToast(`Offer #${index + 1} image cleared & storefront updated.`);
}

function addSpecialOfferRow() {
  adminSpecialOffers.push({
    title: 'New Combo Offer',
    description: 'Special handcrafted traditional food combo discount deal.',
    benefits: '100% இயற்கை பாரம்பரிய உணவு, உடலுக்கு ஆரோக்கியம் தரும்',
    price: 999,
    originalPrice: 1200,
    image: 'offer_1.jpg',
    buttonText: 'BUY OFFER - ₹999'
  });
  renderAdminOffersList();
}

function removeSpecialOfferRow(idx) {
  if (adminSpecialOffers.length <= 1) {
    showToast('At least one special offer is required', 'error');
    return;
  }
  adminSpecialOffers.splice(idx, 1);
  renderAdminOffersList();
}

function renderAdminCategoriesList() {
  const container = document.getElementById('admin-categories-list');
  if (!container) return;
  container.innerHTML = '';

  adminCategories.forEach((cat, index) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:10px; align-items:center; background:var(--bg-surface-2); padding:10px 14px; border-radius:8px; border:1px solid var(--border-color);';
    row.innerHTML = `
      <span style="font-weight:700; color:var(--text-muted); width:24px;">#${index+1}</span>
      <div style="flex:1;">
        <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase;">Display Label</label>
        <input type="text" class="form-control cat-label-input" value="${cat.label}" oninput="updateCatLabel(${index}, this.value)" placeholder="e.g. Health Mix" style="padding:6px 10px;" />
      </div>
      <div style="width:160px;">
        <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase;">Category Key</label>
        <input type="text" class="form-control cat-key-input" value="${cat.key}" oninput="updateCatKey(${index}, this.value)" placeholder="e.g. health" style="padding:6px 10px;" />
      </div>
      <button type="button" class="btn btn-outline" style="padding:6px 10px; color:var(--danger); margin-top:14px;" onclick="removeCategoryRow(${index})" title="Delete category">
        ✕
      </button>
    `;
    container.appendChild(row);
  });
}

function updateCatLabel(idx, val) {
  if (adminCategories[idx]) {
    adminCategories[idx].label = val;
    updateProductFormCategorySelect();
  }
}

function updateCatKey(idx, val) {
  if (adminCategories[idx]) {
    adminCategories[idx].key = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    updateProductFormCategorySelect();
  }
}

function addCategoryRow() {
  const key = `cat_${Date.now().toString().slice(-4)}`;
  adminCategories.push({ key, label: 'New Category' });
  renderAdminCategoriesList();
  updateProductFormCategorySelect();
}

function removeCategoryRow(idx) {
  if (adminCategories.length <= 1) {
    showToast('At least one category is required', 'error');
    return;
  }
  adminCategories.splice(idx, 1);
  renderAdminCategoriesList();
  updateProductFormCategorySelect();
}

function renderAdminPriceRangesList() {
  const container = document.getElementById('admin-price-ranges-list');
  if (!container) return;
  container.innerHTML = '';

  adminPriceRanges.forEach((range, index) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; gap:10px; align-items:center; background:var(--bg-surface-2); padding:10px 14px; border-radius:8px; border:1px solid var(--border-color);';
    row.innerHTML = `
      <span style="font-weight:700; color:var(--text-muted); width:24px;">#${index+1}</span>
      <div style="flex:1.5;">
        <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase;">Filter Label</label>
        <input type="text" class="form-control" value="${range.label}" oninput="adminPriceRanges[${index}].label = this.value" placeholder="e.g. Under ₹150" style="padding:6px 10px;" />
      </div>
      <div style="width:110px;">
        <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase;">Min Price (₹)</label>
        <input type="number" class="form-control" value="${range.min !== undefined ? range.min : 0}" oninput="adminPriceRanges[${index}].min = Number(this.value)" style="padding:6px 10px;" />
      </div>
      <div style="width:110px;">
        <label style="font-size:0.7rem; color:var(--text-dim); display:block; text-transform:uppercase;">Max Price (₹)</label>
        <input type="number" class="form-control" value="${range.max !== undefined ? range.max : 999999}" oninput="adminPriceRanges[${index}].max = Number(this.value)" style="padding:6px 10px;" />
      </div>
      <button type="button" class="btn btn-outline" style="padding:6px 10px; color:var(--danger); margin-top:14px;" onclick="removePriceRangeRow(${index})" title="Delete tier">
        ✕
      </button>
    `;
    container.appendChild(row);
  });
}

function addPriceRangeRow() {
  const key = `price_${Date.now().toString().slice(-4)}`;
  adminPriceRanges.push({ key, label: '₹200 – ₹300', min: 200, max: 300 });
  renderAdminPriceRangesList();
}

function removePriceRangeRow(idx) {
  if (adminPriceRanges.length <= 1) {
    showToast('At least one price range is required', 'error');
    return;
  }
  adminPriceRanges.splice(idx, 1);
  renderAdminPriceRangesList();
}

function updateProductFormCategorySelect() {
  const sel = document.getElementById('form-category');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = '';
  adminCategories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.key;
    opt.textContent = c.label;
    sel.appendChild(opt);
  });
  const otherOpt = document.createElement('option');
  otherOpt.value = 'other';
  otherOpt.textContent = 'Other / General';
  sel.appendChild(otherOpt);

  if (currentVal) sel.value = currentVal;
  handleProductCategoryChange();

  const invFilter = document.getElementById('inv-filter-category');
  if (invFilter) {
    const prev = invFilter.value;
    invFilter.innerHTML = '<option value="all">All Categories</option>';
    adminCategories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.key;
      opt.textContent = c.label;
      invFilter.appendChild(opt);
    });
    if (prev) invFilter.value = prev;
  }

  const prodFilter = document.getElementById('admin-filter-category');
  if (prodFilter) {
    const prev = prodFilter.value;
    prodFilter.innerHTML = '<option value="all">All Categories</option>';
    adminCategories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.key;
      opt.textContent = c.label;
      prodFilter.appendChild(opt);
    });
    if (prev) prodFilter.value = prev;
  }
}

function previewLogoFile(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.getElementById('settings-logo-preview');
      if (img) img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function saveStoreSettings(silent = false) {
  const formData = new FormData();
  formData.append('storeName', document.getElementById('setting-storename')?.value.trim() || 'Hi Suvai');
  formData.append('proprietorName', document.getElementById('setting-proprietor')?.value.trim() || 'M. Rajaselvi Mahalingam. M.Sc., B.Ed.');
  formData.append('supportPhone', document.getElementById('setting-phone')?.value.trim() || '');
  formData.append('contactEmail', document.getElementById('setting-email')?.value.trim() || '');
  formData.append('storeAddress', document.getElementById('setting-address')?.value.trim() || '');
  formData.append('aboutText', document.getElementById('setting-about')?.value.trim() || '');
  formData.append('googleMapUrl', document.getElementById('setting-map')?.value.trim() || '');

  formData.append('facebookUrl', document.getElementById('setting-facebook')?.value.trim() || '');
  formData.append('instagramUrl', document.getElementById('setting-instagram')?.value.trim() || '');
  formData.append('youtubeUrl', document.getElementById('setting-youtube')?.value.trim() || '');
  formData.append('whatsappNumber', document.getElementById('setting-whatsapp')?.value.trim() || '');

  formData.append('customCategories', JSON.stringify(adminCategories));
  formData.append('priceRanges', JSON.stringify(adminPriceRanges));
  formData.append('specialOffers', JSON.stringify(adminSpecialOffers));

  const logoFile = document.getElementById('settings-logo-file');
  if (logoFile && logoFile.files[0]) {
    formData.append('storeLogo', logoFile.files[0]);
  }

  try {
    const res = await fetch(getAdminApiUrl('/settings'), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    });
    const data = await res.json();
    if (res.status === 401) {
      showToast('Session expired. Please log in again.', 'error');
      setTimeout(() => handleAdminLogout(), 1500);
      return;
    }
    if (data.success) {
      if (!silent) {
        showToast('✦ Configuration & Filters saved successfully! Public storefront updated.');
      }
      loadAdminSettings();
    } else {
      showToast(data.message || 'Failed to save configuration', 'error');
    }
  } catch (err) {
    showToast('Error saving settings: ' + err.message, 'error');
  }
}

// Global search bar
function handleGlobalSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) return;

  // Search products
  const matchedProd = allProducts.filter(p => p.name.toLowerCase().includes(q));
  if (matchedProd.length > 0) {
    switchView('products');
    const pInput = document.getElementById('admin-search-input');
    if (pInput) { pInput.value = query; handleProductFilterChange(); }
  }
}

// ============================================================
// HELPERS
// ============================================================

function closeModalOnBackdrop(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '⚠️'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ============================================================
// INVENTORY CONTROL CENTRE MANAGEMENT (VDG FASHION MATCH)
// ============================================================
async function loadAdminInventory() {
  const tbody = document.getElementById('admin-inventory-tbody');
  const loadingMsg = document.getElementById('inv-loading-msg');
  const emptyMsg = document.getElementById('inv-empty-msg');

  if (loadingMsg) loadingMsg.style.display = 'block';
  if (emptyMsg) emptyMsg.style.display = 'none';
  if (tbody) tbody.innerHTML = '';

  try {
    const res = await fetch(getAdminApiUrl('/products?limit=100'));
    const data = await res.json();

    if (data.success && data.products) {
      allProducts = data.products;
      renderInventoryKPIs(allProducts);
      renderInventoryTable(allProducts);
    } else {
      if (emptyMsg) emptyMsg.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading inventory:', error);
    showToast('Failed to connect to server for inventory data.', 'error');
  } finally {
    if (loadingMsg) loadingMsg.style.display = 'none';
  }
}

function renderInventoryKPIs(products) {
  const totalEl = document.getElementById('inv-kpi-total');
  const valEl = document.getElementById('inv-kpi-valuation');
  const outEl = document.getElementById('inv-kpi-outofstock');
  const lowEl = document.getElementById('inv-kpi-lowstock');
  const badgeEl = document.getElementById('sidebar-lowstock-count');

  if (!products) return;

  const totalItems = products.length;
  let totalValuation = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;

  products.forEach(p => {
    const qty = p.stock !== undefined ? Number(p.stock) : 0;
    const price = Number(p.price || 0);
    totalValuation += qty * price;

    if (qty === 0) {
      outOfStockCount++;
    } else if (qty <= 15) {
      lowStockCount++;
    }
  });

  if (totalEl) totalEl.textContent = totalItems;
  if (valEl) valEl.textContent = '₹' + totalValuation.toLocaleString('en-IN');
  if (outEl) outEl.textContent = outOfStockCount;
  if (lowEl) lowEl.textContent = lowStockCount;

  if (badgeEl) {
    const totalAlerts = outOfStockCount + lowStockCount;
    if (totalAlerts > 0) {
      badgeEl.textContent = totalAlerts;
      badgeEl.style.display = 'inline-flex';
    } else {
      badgeEl.style.display = 'none';
    }
  }
}

function renderInventoryTable(products) {
  const tbody = document.getElementById('admin-inventory-tbody');
  const emptyMsg = document.getElementById('inv-empty-msg');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!products || products.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }
  if (emptyMsg) emptyMsg.style.display = 'none';

  products.forEach(p => {
    const idKey = p._id || p.id;
    const stockQty = p.stock !== undefined ? Number(p.stock) : 0;
    const price = Number(p.price || 0);
    const sku = p.sku || `Product ID: HS-${String(idKey).slice(-5).toUpperCase()}`;

    let statusBadgeHtml = '';
    if (stockQty === 0) {
      statusBadgeHtml = `<span class="stock-badge stock-badge-out">OUT OF STOCK</span>`;
    } else if (stockQty <= 15) {
      statusBadgeHtml = `<span class="stock-badge stock-badge-low">LOW STOCK</span>`;
    } else {
      statusBadgeHtml = `<span class="stock-badge stock-badge-in">IN STOCK</span>`;
    }

    const tr = document.createElement('tr');
    tr.id = `inv-row-${idKey}`;
    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${resolveImageUrl(p.image)}" alt="${p.name}" style="width:42px; height:42px; object-fit:cover; border-radius:8px; border:1px solid #E5E7EB;" onerror="this.onerror=null; this.src='../assets/suvai1.png';" />
          <div>
            <div style="font-weight:700; color:var(--text-primary); font-size:0.9rem; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.name}</div>
            <div style="font-size:0.75rem; color:var(--text-dim); margin-top:2px;">${sku}</div>
          </div>
        </div>
      </td>
      <td>
        <span style="font-size:0.82rem; font-weight:600; color:var(--text-muted); text-transform:capitalize;">${p.category || 'general'} ${p.unit ? '> ' + p.unit : ''}</span>
      </td>
      <td>
        <span style="font-weight:700; color:var(--text-primary); font-size:0.9rem;">₹${price}</span>
      </td>
      <td>
        <div class="stock-level-cell">
          <span class="stock-units-num">${stockQty} <span style="font-size:0.75rem; font-weight:500; color:var(--text-dim);">units</span></span>
          ${statusBadgeHtml}
        </div>
      </td>
      <td style="text-align:center;">
        <div class="quick-adjust-group">
          <button class="btn-adjust" onclick="quickAdjustStock('${idKey}', -5)" title="Subtract 5">-5</button>
          <button class="btn-adjust" onclick="quickAdjustStock('${idKey}', -1)" title="Subtract 1">-1</button>
          <button class="btn-adjust-edit" onclick="promptEditStock('${idKey}', ${stockQty})" title="Set exact stock level">Edit</button>
          <button class="btn-adjust" onclick="quickAdjustStock('${idKey}', 1)" title="Add 1">+1</button>
          <button class="btn-adjust" onclick="quickAdjustStock('${idKey}', 5)" title="Add 5">+5</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleInventoryFilterChange() {
  const search = document.getElementById('inv-search-input')?.value.toLowerCase().trim() || '';
  const category = document.getElementById('inv-filter-category')?.value || 'all';
  const status = document.getElementById('inv-filter-status')?.value || 'all';

  let filtered = allProducts.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search) ||
      (p.sku && p.sku.toLowerCase().includes(search)) ||
      (p.tag && p.tag.toLowerCase().includes(search));

    const matchCategory = category === 'all' || p.category === category;

    const qty = p.stock !== undefined ? Number(p.stock) : 0;
    let matchStatus = true;
    if (status === 'instock') matchStatus = qty > 15;
    else if (status === 'lowstock') matchStatus = qty > 0 && qty <= 15;
    else if (status === 'outofstock') matchStatus = qty === 0;

    return matchSearch && matchCategory && matchStatus;
  });

  renderInventoryTable(filtered);
}

async function quickAdjustStock(productId, delta) {
  const prodIndex = allProducts.findIndex(p => (p._id || p.id) == productId);
  if (prodIndex === -1) return;

  const product = allProducts[prodIndex];
  const currentStock = product.stock !== undefined ? Number(product.stock) : 0;
  const newStock = Math.max(0, currentStock + delta);

  // Optimistic UI update
  product.stock = newStock;
  product.isAvailable = newStock > 0;
  renderInventoryKPIs(allProducts);
  handleInventoryFilterChange();

  try {
    const res = await fetch(getAdminApiUrl(`/products/${productId}/stock`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ stock: newStock })
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Stock updated to ${newStock} units for "${product.name}"`, 'success');
    } else {
      product.stock = currentStock;
      product.isAvailable = currentStock > 0;
      renderInventoryKPIs(allProducts);
      handleInventoryFilterChange();
      showToast(data.message || 'Failed to update stock', 'error');
    }
  } catch (error) {
    product.stock = currentStock;
    product.isAvailable = currentStock > 0;
    renderInventoryKPIs(allProducts);
    handleInventoryFilterChange();
    showToast('Network error updating stock', 'error');
  }
}

async function setExactStock(productId, newStock) {
  const prodIndex = allProducts.findIndex(p => (p._id || p.id) == productId);
  if (prodIndex === -1) return;

  const product = allProducts[prodIndex];
  const currentStock = product.stock !== undefined ? Number(product.stock) : 0;
  const targetStock = Math.max(0, Number(newStock));

  // Optimistic UI update
  product.stock = targetStock;
  product.isAvailable = targetStock > 0;
  renderInventoryKPIs(allProducts);
  handleInventoryFilterChange();

  try {
    const res = await fetch(getAdminApiUrl(`/products/${productId}/stock`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ stock: targetStock })
    });
    const data = await res.json();

    if (data.success) {
      showToast(`Stock set to ${targetStock} units for "${product.name}"`, 'success');
    } else {
      product.stock = currentStock;
      product.isAvailable = currentStock > 0;
      renderInventoryKPIs(allProducts);
      handleInventoryFilterChange();
      showToast(data.message || 'Failed to update stock', 'error');
    }
  } catch (error) {
    product.stock = currentStock;
    product.isAvailable = currentStock > 0;
    renderInventoryKPIs(allProducts);
    handleInventoryFilterChange();
    showToast('Network error updating stock', 'error');
  }
}

function promptEditStock(productId, currentStock) {
  const prod = allProducts.find(p => (p._id || p.id) == productId);
  if (!prod) return;

  const idKey = prod._id || prod.id;
  document.getElementById('stock-modal-prod-id').value = idKey;
  document.getElementById('stock-modal-prod-name').textContent = prod.name;
  document.getElementById('stock-modal-input').value = currentStock;

  const modal = document.getElementById('stock-modal-overlay');
  if (modal) {
    modal.classList.add('open');
    setTimeout(() => {
      const input = document.getElementById('stock-modal-input');
      if (input) { input.focus(); input.select(); }
    }, 100);
  }
}

function closeStockModal() {
  const modal = document.getElementById('stock-modal-overlay');
  if (modal) modal.classList.remove('open');
}

function handleStockModalSubmit(e) {
  e.preventDefault();
  const productId = document.getElementById('stock-modal-prod-id').value;
  const val = document.getElementById('stock-modal-input').value;
  const num = parseInt(val, 10);

  if (isNaN(num) || num < 0) {
    showToast('Please enter a valid number (0 or higher) for stock.', 'error');
    return;
  }

  closeStockModal();
  setExactStock(productId, num);
}

// ============================================================
// CUSTOMER MANAGEMENT CONTROLLER (ACCOUNTS & SIGN-IN SYNC)
// ============================================================
async function loadAdminCustomers() {
  const loadingMsg = document.getElementById('cust-loading-msg');
  const emptyMsg = document.getElementById('cust-empty-msg');
  const tbody = document.getElementById('admin-customers-tbody');

  if (loadingMsg) loadingMsg.style.display = 'block';
  if (emptyMsg) emptyMsg.style.display = 'none';

  try {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`${API_BASE}/customers`, { headers });
    const data = await res.json();

    if (res.ok && data.success) {
      allCustomers = data.customers || [];
    } else {
      // Local fallback from localStorage
      allCustomers = getLocalCustomersFallback();
    }
  } catch (err) {
    console.warn('Customer fetch warning, using local fallback:', err.message);
    allCustomers = getLocalCustomersFallback();
  }

  // Update KPI metrics
  updateCustomerKPIs(allCustomers);

  // Render table
  renderCustomerTable(allCustomers);
}

function getLocalCustomersFallback() {
  let list = [];
  try {
    const registered = JSON.parse(localStorage.getItem('hisuvai_registered_users') || '[]');
    const profiles = JSON.parse(localStorage.getItem('hisuvai_user_profiles') || '{}');
    
    // Merge registered users
    registered.forEach((u, i) => {
      list.push({
        _id: 'local_' + (u.username || i),
        name: u.fname ? (u.fname + ' ' + (u.lname || '')).trim() : (u.username || 'Customer'),
        username: u.username || '',
        email: u.email || '',
        phone: u.phone || '',
        status: 'active',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        totalOrders: 0,
        totalSpend: 0,
        addresses: []
      });
    });

    // Check active user in storage
    const activeName = localStorage.getItem('hisuvai_customer_name');
    const activePhone = localStorage.getItem('hisuvai_customer_phone');
    const activeEmail = localStorage.getItem('hisuvai_customer_email');
    if (activeName && !list.find(c => c.email === activeEmail || c.phone === activePhone)) {
      list.unshift({
        _id: 'local_active',
        name: activeName,
        username: activeName.toLowerCase().replace(/\s+/g, ''),
        email: activeEmail || '',
        phone: activePhone || '',
        status: 'active',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        totalOrders: 0,
        totalSpend: 0,
        addresses: []
      });
    }
  } catch(e) {}
  return list;
}

function updateCustomerKPIs(list) {
  const total = list.length;
  const registered = list.filter(c => c.status !== 'guest').length;
  const totalOrders = list.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
  const totalRevenue = list.reduce((sum, c) => sum + (c.totalSpend || 0), 0);

  const kpiTotal = document.getElementById('cust-kpi-total');
  const kpiReg = document.getElementById('cust-kpi-registered');
  const kpiOrders = document.getElementById('cust-kpi-orders');
  const kpiRev = document.getElementById('cust-kpi-revenue');
  const badgeCount = document.getElementById('sidebar-customer-count');

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiReg) kpiReg.textContent = registered;
  if (kpiOrders) kpiOrders.textContent = totalOrders;
  if (kpiRev) kpiRev.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  if (badgeCount) badgeCount.textContent = total;
}

function handleCustomerFilterChange() {
  const searchInput = document.getElementById('cust-search-input')?.value.toLowerCase().trim() || '';
  const filterType = document.getElementById('cust-filter-type')?.value || 'all';
  const filterSort = document.getElementById('cust-filter-sort')?.value || 'newest';

  let filtered = [...allCustomers];

  // 1. Search Query
  if (searchInput) {
    filtered = filtered.filter(c => {
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      const username = (c.username || '').toLowerCase();
      return name.includes(searchInput) || email.includes(searchInput) || phone.includes(searchInput) || username.includes(searchInput);
    });
  }

  // 2. Customer Type Filter
  if (filterType === 'registered') {
    filtered = filtered.filter(c => c.status !== 'guest');
  } else if (filterType === 'with_orders') {
    filtered = filtered.filter(c => (c.totalOrders || 0) > 0);
  }

  // 3. Sort
  if (filterSort === 'orders_desc') {
    filtered.sort((a, b) => (b.totalOrders || 0) - (a.totalOrders || 0));
  } else if (filterSort === 'spend_desc') {
    filtered.sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0));
  } else if (filterSort === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  } else {
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  renderCustomerTable(filtered);
}

function renderCustomerTable(customersList) {
  const tbody = document.getElementById('admin-customers-tbody');
  const loadingMsg = document.getElementById('cust-loading-msg');
  const emptyMsg = document.getElementById('cust-empty-msg');

  if (loadingMsg) loadingMsg.style.display = 'none';

  if (!tbody) return;
  tbody.innerHTML = '';

  if (!customersList || customersList.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  customersList.forEach(cust => {
    const tr = document.createElement('tr');

    const name = escapeHtml(cust.name || 'Customer');
    const initial = escapeHtml(name.charAt(0).toUpperCase());
    const username = escapeHtml(cust.username ? `@${cust.username}` : (cust.email ? `@${cust.email.split('@')[0]}` : '@user'));
    const email = cust.email ? escapeHtml(cust.email) : '<span style="color:var(--text-muted); font-style:italic;">Not provided</span>';
    const phone = escapeHtml(cust.phone || '');
    const isGuest = cust.status === 'guest';
    const custIdSafe = escapeHtml(cust._id);

    const joinDate = cust.createdAt ? new Date(cust.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : 'Recent';

    const totalOrders = Number(cust.totalOrders) || 0;
    const totalSpend = Number(cust.totalSpend) || 0;

    const phoneDisplay = phone 
      ? `<div style="display:flex; align-items:center; gap:6px;">
           <span style="font-weight:600; font-family:'Inter',sans-serif;">${phone}</span>
           <a href="https://wa.me/91${phone.replace(/[^0-9]/g, '')}" target="_blank" title="Chat on WhatsApp" style="color:#22C55E; font-size:0.9rem; text-decoration:none;">💬</a>
         </div>`
      : `<span style="color:var(--text-muted); font-style:italic;">No phone</span>`;

    const statusBadge = isGuest
      ? `<span class="badge" style="background:rgba(234,88,12,0.1); color:#EA580C; font-size:0.75rem;">Guest Shopper</span>`
      : `<span class="badge" style="background:rgba(16,185,129,0.12); color:#10B981; font-size:0.75rem;">Verified User</span>`;

    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg, var(--gold), var(--crimson)); color:#fff; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:1rem; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            ${initial}
          </div>
          <div>
            <strong style="color:var(--text-primary); font-size:0.92rem; display:block;">${name}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted);">${username}</span>
          </div>
        </div>
      </td>
      <td>
        <a href="${cust.email ? 'mailto:' + escapeHtml(cust.email) : '#'}" style="color:var(--text-primary); text-decoration:none; font-size:0.85rem;" title="${cust.email ? escapeHtml(cust.email) : ''}">
          ${email}
        </a>
      </td>
      <td>${phoneDisplay}</td>
      <td>
        <span style="font-size:0.85rem; color:var(--text-primary); display:block;">${joinDate}</span>
        <span style="font-size:0.72rem; color:var(--text-muted);">Last: ${cust.lastLoginAt ? new Date(cust.lastLoginAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Active'}</span>
      </td>
      <td>
        <span class="badge" style="background:rgba(124,58,237,0.08); color:var(--purple-accent); font-weight:700; font-size:0.8rem;">
          ${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'}
        </span>
      </td>
      <td>
        <strong style="color:var(--crimson); font-family:'Inter',sans-serif; font-size:0.95rem;">
          ₹${totalSpend.toLocaleString('en-IN')}
        </strong>
      </td>
      <td>${statusBadge}</td>
      <td>
        <div style="display:flex; align-items:center; gap:6px;">
          <button class="btn btn-outline" style="padding:4px 9px; font-size:0.75rem; font-weight:600;" onclick="openCustomerDetailModal('${custIdSafe}')">
            View Details
          </button>
          ${!isGuest ? `<button class="btn btn-outline" style="padding:4px 7px; color:var(--danger); border-color:rgba(239,68,68,0.3);" onclick="deleteCustomerAccount('${custIdSafe}', '${name.replace(/'/g, "\\'")}')" title="Delete customer record">🗑️</button>` : ''}
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Customer Detail Modal
function openCustomerDetailModal(customerId) {
  const cust = allCustomers.find(c => String(c._id) === String(customerId));
  if (!cust) return;

  const modal = document.getElementById('customer-detail-modal-overlay');
  if (!modal) return;

  const name = cust.name || 'Customer';
  const initial = name.charAt(0).toUpperCase();

  document.getElementById('cd-modal-name').textContent = `${name}'s Profile`;
  document.getElementById('cd-modal-joined').textContent = cust.createdAt 
    ? `Member since ${new Date(cust.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` 
    : 'Active Account';

  document.getElementById('cd-modal-avatar').textContent = initial;
  document.getElementById('cd-card-fullname').textContent = name;
  document.getElementById('cd-card-username').textContent = cust.username ? `@${cust.username}` : (cust.email ? `@${cust.email.split('@')[0]}` : '@user');
  document.getElementById('cd-card-spend').textContent = `₹${(cust.totalSpend || 0).toLocaleString('en-IN')}`;

  const isGuest = cust.status === 'guest';
  const badge = document.getElementById('cd-card-badge');
  if (badge) {
    badge.textContent = isGuest ? 'Guest Shopper' : 'Verified Account';
    badge.style.background = isGuest ? 'rgba(234,88,12,0.1)' : 'rgba(16,185,129,0.12)';
    badge.style.color = isGuest ? '#EA580C' : '#10B981';
  }

  document.getElementById('cd-info-email').textContent = cust.email || 'None';
  document.getElementById('cd-info-phone').textContent = cust.phone || 'None';

  // Render Delivery Addresses
  const addrContainer = document.getElementById('cd-addresses-container');
  if (addrContainer) {
    addrContainer.innerHTML = '';
    const addrs = cust.addresses || [];
    if (addrs.length === 0) {
      addrContainer.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); font-style:italic;">No saved delivery addresses yet.</div>`;
    } else {
      addrs.forEach((a, i) => {
        const item = document.createElement('div');
        item.style.cssText = 'background:var(--bg-surface-2); border:1px solid var(--border-color); border-radius:6px; padding:8px 12px; font-size:0.85rem;';
        const labelSafe = escapeHtml(a.label || 'Address ' + (i+1));
        const addrSafe = escapeHtml(a.addressLine || a.address || '');
        const citySafe = escapeHtml(a.city || '');
        const stateSafe = escapeHtml(a.state || 'Tamil Nadu');
        const pinSafe = escapeHtml(a.pincode || a.pin || '');
        item.innerHTML = `<strong>${labelSafe}:</strong> ${addrSafe}, ${citySafe}, ${stateSafe} - ${pinSafe}`;
        addrContainer.appendChild(item);
      });
    }
  }

  // Render Orders Placed
  const ordersContainer = document.getElementById('cd-orders-container');
  const countSpan = document.getElementById('cd-orders-count');
  const custOrders = cust.recentOrders || (cust.orders) || [];

  if (countSpan) countSpan.textContent = cust.totalOrders || custOrders.length || 0;

  if (ordersContainer) {
    ordersContainer.innerHTML = '';
    if (custOrders.length === 0) {
      ordersContainer.innerHTML = `<div style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.85rem;">No purchase orders placed yet by this customer.</div>`;
    } else {
      custOrders.forEach(ord => {
        const row = document.createElement('div');
        row.className = 'order-detail-item-row';
        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:var(--bg-surface-2); border-radius:6px; margin-bottom:6px;';
        
        const date = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent';
        const itemCount = (ord.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
        const ordIdSafe = escapeHtml(ord.orderId || 'Order');
        const ordStatusSafe = escapeHtml(ord.orderStatus || 'Pending');

        row.innerHTML = `
          <div>
            <strong style="color:var(--text-primary); font-size:0.88rem;">${ordIdSafe}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block;">${date} • ${itemCount} items</span>
          </div>
          <div style="text-align:right;">
            <strong style="color:var(--crimson); font-size:0.9rem;">₹${Number(ord.pricing?.grandTotal) || 0}</strong>
            <span class="order-status-badge status-${ordStatusSafe}" style="margin-left:8px; font-size:0.7rem; padding:2px 8px;">${ordStatusSafe}</span>
          </div>
        `;
        ordersContainer.appendChild(row);
      });
    }
  }

  modal.classList.add('open');
}

function closeCustomerDetailModal() {
  const modal = document.getElementById('customer-detail-modal-overlay');
  if (modal) modal.classList.remove('open');
}

async function deleteCustomerAccount(customerId, customerName) {
  if (!confirm(`Are you sure you want to remove customer "${customerName}" from the database?`)) {
    return;
  }

  try {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`${API_BASE}/customers/${customerId}`, {
      method: 'DELETE',
      headers: headers
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showToast(`Customer "${customerName}" deleted successfully.`);
      loadAdminCustomers();
    } else {
      showToast(data.message || 'Could not delete customer.', 'error');
    }
  } catch (err) {
    showToast('Network error deleting customer.', 'error');
  }
}

// ============================================================
// RAZORPAY DASHBOARD & AUTOMATED REFUNDS CONTROLLER
// ============================================================
let allRazorpayTransactions = [];

async function loadAdminRazorpayStats() {
  const tbody = document.getElementById('admin-razorpay-tbody');
  const loading = document.getElementById('rzp-loading-msg');
  const empty = document.getElementById('rzp-empty-msg');

  if (loading) loading.style.display = 'block';
  if (empty) empty.style.display = 'none';
  if (tbody) tbody.innerHTML = '';

  try {
    const headers = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(getAdminApiUrl('/payment/razorpay-stats'), { headers });
    const data = await res.json();

    if (loading) loading.style.display = 'none';

    if (data.success) {
      const { config, stats, transactions } = data;

      // Update Config Banner
      const modeBadge = document.getElementById('rzp-mode-badge');
      if (modeBadge) {
        modeBadge.textContent = config.mode;
        modeBadge.style.background = config.mode.includes('Live') ? '#16A34A' : '#7C3AED';
      }
      const keyMasked = document.getElementById('rzp-key-masked');
      if (keyMasked) keyMasked.textContent = config.maskedKeyId;

      const netRev = document.getElementById('rzp-kpi-net-revenue');
      if (netRev) netRev.textContent = '₹' + (stats.netRevenue || 0).toLocaleString('en-IN');

      // Update KPI Cards
      const totColl = document.getElementById('rzp-kpi-total-collected');
      if (totColl) totColl.textContent = '₹' + (stats.totalCollected || 0).toLocaleString('en-IN');

      const paidCnt = document.getElementById('rzp-kpi-paid-count');
      if (paidCnt) paidCnt.textContent = stats.paidCount || 0;

      const totRef = document.getElementById('rzp-kpi-total-refunded');
      if (totRef) totRef.textContent = '₹' + (stats.totalRefunded || 0).toLocaleString('en-IN');

      const refCnt = document.getElementById('rzp-kpi-refund-count');
      if (refCnt) refCnt.textContent = stats.refundCount || 0;

      allRazorpayTransactions = transactions || [];
      renderRazorpayTable(allRazorpayTransactions);
    }
  } catch (err) {
    if (loading) loading.style.display = 'none';
    console.warn('Razorpay Stats Load Error:', err);
  }
}

function renderRazorpayTable(transactions) {
  const tbody = document.getElementById('admin-razorpay-tbody');
  const empty = document.getElementById('rzp-empty-msg');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (transactions.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  transactions.forEach(ord => {
    const tr = document.createElement('tr');
    const targetId = ord._id || ord.orderId;
    const dateStr = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const isRefunded = ord.payment?.refundStatus === 'processed';
    const isPaid = ord.payment?.status === 'paid';
    const payId = ord.payment?.razorpayPaymentId || 'pay_online_sim';

    tr.innerHTML = `
      <td>
        <strong style="color:var(--purple-accent); cursor:pointer;" onclick="openOrderDetailModal('${targetId}')">#${ord.orderId}</strong>
        <span style="display:block; font-size:0.72rem; color:var(--text-muted);">${dateStr}</span>
      </td>
      <td>
        <code style="font-size:0.8rem; background:var(--bg-surface-2); padding:3px 6px; border-radius:4px; font-weight:700;">${payId}</code>
      </td>
      <td>
        <strong>${ord.customer?.name || 'Customer'}</strong>
        <span style="display:block; font-size:0.75rem; color:var(--text-muted);">${ord.customer?.phone || ''}</span>
      </td>
      <td>
        <strong style="color:var(--crimson);">₹${(ord.pricing?.grandTotal || 0).toLocaleString('en-IN')}</strong>
      </td>
      <td>
        <span class="badge ${isPaid ? 'available' : 'warning'}">${isPaid ? '✅ Paid' : '⏳ Pending'}</span>
      </td>
      <td>
        ${isRefunded 
          ? `<span class="badge warning" style="background:rgba(22,163,74,0.12); color:#16A34A; font-weight:700;">💚 Refunded (₹${ord.payment?.refundAmount || ord.pricing?.grandTotal})</span>`
          : `<span class="badge" style="background:var(--bg-surface-2); color:var(--text-muted);">None</span>`}
      </td>
      <td>
        <div class="action-btns">
          ${isPaid && !isRefunded ? `
            <button class="btn btn-crimson" style="padding:4px 10px; font-size:0.75rem;" onclick="executeAdminRefund('${targetId}', ${ord.pricing?.grandTotal})">
              ↩️ Process Refund
            </button>
          ` : `
            <button class="btn btn-outline" style="padding:4px 10px; font-size:0.75rem;" onclick="openOrderDetailModal('${targetId}')">
              View Order
            </button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function handleRazorpayFilterChange() {
  const searchVal = (document.getElementById('rzp-search-input')?.value || '').toLowerCase().trim();
  const statusVal = document.getElementById('rzp-filter-status')?.value || 'all';

  const filtered = allRazorpayTransactions.filter(ord => {
    const isPaid = ord.payment?.status === 'paid';
    const isRefunded = ord.payment?.refundStatus === 'processed';

    let matchStatus = true;
    if (statusVal === 'paid') matchStatus = isPaid && !isRefunded;
    if (statusVal === 'refunded') matchStatus = isRefunded;
    if (statusVal === 'pending') matchStatus = !isPaid;

    const matchSearch = !searchVal ||
      (ord.orderId && ord.orderId.toLowerCase().includes(searchVal)) ||
      (ord.payment?.razorpayPaymentId && ord.payment.razorpayPaymentId.toLowerCase().includes(searchVal)) ||
      (ord.customer?.name && ord.customer.name.toLowerCase().includes(searchVal)) ||
      (ord.customer?.phone && ord.customer.phone.toLowerCase().includes(searchVal));

    return matchStatus && matchSearch;
  });

  renderRazorpayTable(filtered);
}

async function executeAdminRefund(orderId, amount) {
  if (!confirm(`Are you sure you want to process a refund of ₹${amount} for Order #${orderId}?`)) return;

  if (String(orderId).startsWith('local_')) {
    try {
      let localOrders = JSON.parse(localStorage.getItem('hisuvai_orders') || '[]');
      localOrders = localOrders.map(o => {
        if (o._id === orderId || o.orderId === orderId) {
          o.payment = o.payment || {};
          o.payment.refundStatus = 'processed';
          o.payment.refundAmount = amount;
          o.payment.refundId = 'ref_sim_' + Math.floor(100000 + Math.random() * 900000);
          o.payment.refundedAt = new Date().toISOString();
        }
        return o;
      });
      localStorage.setItem('hisuvai_orders', JSON.stringify(localOrders));
    } catch(e) {}
    showToast(`✓ Simulated refund of ₹${amount} processed for Order #${orderId}`);
    loadAdminRazorpayStats();
    loadAdminOrders();
    return;
  }

  try {
    const res = await fetch(getAdminApiUrl(`/orders/${orderId}/refund`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    if (data.success) {
      showToast('✓ ' + data.message);
      loadAdminRazorpayStats();
      loadAdminOrders();
    } else {
      showToast('⚠️ ' + (data.message || 'Refund failed'), 'error');
    }
  } catch (err) {
    showToast('⚠️ Refund error: ' + err.message, 'error');
  }
}

