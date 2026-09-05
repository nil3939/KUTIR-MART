/**
 * KUTIR MART - Admin Dashboard & Management Controller
 * Handles Dashboard Analytics, Products, Categories, Inventory, Coupons, Orders, and Reviews.
 */

class KutirAdmin {
  constructor() {
    this.currentView = 'dashboard';
    this.salesChart = null;
    this.editingProductId = null;
  }

  init() {
    this.switchView('dashboard');
    this.renderKPIs();
    this.renderRecentOrders();
    this.initSalesChart();

    window.addEventListener('kutir:store_updated', () => {
      this.renderKPIs();
      if (this.currentView === 'dashboard') {
        this.renderRecentOrders();
        this.updateSalesChart();
      } else if (this.currentView === 'products') {
        this.renderProductsTable();
      } else if (this.currentView === 'categories') {
        this.renderCategoriesTable();
      } else if (this.currentView === 'inventory') {
        this.renderInventoryTable();
      } else if (this.currentView === 'orders') {
        this.renderAllOrdersTable();
      } else if (this.currentView === 'coupons') {
        this.renderCouponsTable();
      }
    });

    console.log('Kutir Mart Admin Engine initialized.');
  }

  switchView(viewName) {
    this.currentView = viewName;
    const views = ['dashboard', 'products', 'categories', 'inventory', 'orders', 'coupons', 'analytics'];

    views.forEach(v => {
      const container = document.getElementById(`admin-view-${v}`);
      const navItem = document.getElementById(`admin-nav-${v}`);
      if (container) container.classList.toggle('hidden', v !== viewName);
      if (navItem) {
        if (v === viewName) {
          navItem.className = 'w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#003d29] text-white font-semibold text-sm shadow-sm transition';
        } else {
          navItem.className = 'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-100 font-medium text-sm transition';
        }
      }
    });

    // Page title update
    const titleEl = document.getElementById('admin-header-title');
    const descEl = document.getElementById('admin-header-desc');
    const titles = {
      dashboard: { title: 'Dashboard Overview', desc: 'Real-time sales performance and operations monitoring' },
      products: { title: 'Products Management', desc: 'Manage your product catalog, prices, and visual assets' },
      categories: { title: 'Categories Management', desc: 'Organize your store collections and navigation taxonomy' },
      inventory: { title: 'Inventory & Stock Control', desc: 'Monitor stock levels, set alerts, and handle restocking' },
      orders: { title: 'Orders Fulfillment', desc: 'Process customer shipments and update live tracking' },
      coupons: { title: 'Promotions & Coupons', desc: 'Create promotional discounts and marketing offers' },
      analytics: { title: 'Analytics & Insights', desc: 'Store performance metrics and sales intelligence' }
    };

    if (titleEl && titles[viewName]) titleEl.textContent = titles[viewName].title;
    if (descEl && titles[viewName]) descEl.textContent = titles[viewName].desc;

    if (viewName === 'products') this.renderProductsTable();
    else if (viewName === 'categories') this.renderCategoriesTable();
    else if (viewName === 'inventory') this.renderInventoryTable();
    else if (viewName === 'orders') this.renderAllOrdersTable();
    else if (viewName === 'coupons') this.renderCouponsTable();
    else if (viewName === 'analytics') this.renderAnalytics();
  }

  // --- KPIs ---
  renderKPIs() {
    const orders = window.kutirStore.getOrders();
    const products = window.kutirStore.getProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;

    const revEl = document.getElementById('kpi-revenue');
    const ordEl = document.getElementById('kpi-orders');
    const prodEl = document.getElementById('kpi-products');
    const stockEl = document.getElementById('kpi-low-stock');

    if (revEl) revEl.textContent = `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (ordEl) ordEl.textContent = orders.length;
    if (prodEl) prodEl.textContent = products.length;
    if (stockEl) stockEl.textContent = lowStockCount;
  }

  // --- Chart.js Sales Graph ---
  initSalesChart() {
    const ctx = document.getElementById('salesRevenueChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const orders = window.kutirStore.getOrders();
    // Group last 7 days or sample curve
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [1250, 1890, 1420, 2300, 3100, 4200, 3850];

    this.salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue ($)',
          data: data,
          borderColor: '#003d29',
          backgroundColor: 'rgba(0, 61, 41, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#003d29',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: '#f3f4f6' },
            ticks: { callback: v => '$' + v }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  updateSalesChart() {
    if (this.salesChart) {
      this.salesChart.update();
    }
  }

  // --- Recent Orders ---
  renderRecentOrders() {
    const orders = window.kutirStore.getOrders();
    const container = document.getElementById('admin-recent-orders-list');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="p-6 text-center text-gray-400">No orders placed yet</td></tr>';
      return;
    }

    container.innerHTML = orders.slice(0, 5).map(order => `
      <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition text-xs">
        <td class="p-3.5 font-bold text-[#003d29]">${order.id}</td>
        <td class="p-3.5">
          <div class="font-semibold text-gray-800">${order.customerName}</div>
          <div class="text-[11px] text-gray-400">${order.phone}</div>
        </td>
        <td class="p-3.5">${order.items.length} items</td>
        <td class="p-3.5 font-bold text-gray-900">$${order.total.toFixed(2)}</td>
        <td class="p-3.5">
          <select onchange="window.kutirAdmin.changeOrderStatus('${order.id}', this.value)" class="text-xs font-semibold py-1 px-2.5 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#003d29] cursor-pointer">
            <option value="Placed" ${order.orderStatus === 'Placed' ? 'selected' : ''}>Placed</option>
            <option value="Processing" ${order.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${order.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Out for Delivery" ${order.orderStatus === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td class="p-3.5 text-right">
          <button onclick="window.kutirAdmin.viewOrderDetails('${order.id}')" class="px-2.5 py-1 text-xs bg-gray-100 hover:bg-[#003d29] hover:text-white rounded-lg transition font-medium">
            Details
          </button>
        </td>
      </tr>
    `).join('');
  }

  changeOrderStatus(orderId, status) {
    window.kutirStore.updateOrderStatus(orderId, status);
    this.showAdminToast(`Order ${orderId} updated to "${status}"!`);
  }

  // --- Products CRUD ---
  renderProductsTable() {
    const products = window.kutirStore.getProducts();
    const container = document.getElementById('admin-products-tbody');
    if (!container) return;

    container.innerHTML = products.map(p => `
      <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition text-xs">
        <td class="p-3.5">
          <div class="flex items-center gap-3">
            <img src="${p.image}" class="w-11 h-11 object-cover rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0" />
            <div>
              <h5 class="font-bold text-gray-900">${p.title}</h5>
              <span class="text-[11px] text-gray-400 font-medium">${p.brand || 'Kutir'}</span>
            </div>
          </div>
        </td>
        <td class="p-3.5"><span class="px-2.5 py-0.5 rounded-full bg-[#d2f7ec] text-[#003d29] font-semibold text-[11px]">${p.category}</span></td>
        <td class="p-3.5 font-bold text-gray-900">$${p.price.toFixed(2)}</td>
        <td class="p-3.5">
          <span class="font-bold ${p.stock < 10 ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200' : 'text-emerald-700'}">${p.stock} units</span>
        </td>
        <td class="p-3.5">
          <div class="flex items-center gap-1 text-amber-500 font-medium">
            <i class="fa-solid fa-star text-[10px]"></i> ${p.rating}
          </div>
        </td>
        <td class="p-3.5 text-right space-x-1">
          <button onclick="window.kutirAdmin.openProductModal('${p.id}')" class="px-3 py-1 bg-gray-100 hover:bg-[#003d29] hover:text-white rounded-lg transition font-medium text-xs">Edit</button>
          <button onclick="window.kutirAdmin.deleteProduct('${p.id}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition font-medium text-xs">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  openProductModal(productId = null) {
    this.editingProductId = productId;
    const modal = document.getElementById('admin-product-modal');
    const form = document.getElementById('admin-product-form');
    const titleEl = document.getElementById('admin-product-modal-title');

    form.reset();

    if (productId) {
      titleEl.textContent = 'Edit Product';
      const p = window.kutirStore.getProductById(productId);
      if (p) {
        document.getElementById('prod-input-title').value = p.title;
        document.getElementById('prod-input-category').value = p.category;
        document.getElementById('prod-input-price').value = p.price;
        document.getElementById('prod-input-original-price').value = p.originalPrice || '';
        document.getElementById('prod-input-stock').value = p.stock;
        document.getElementById('prod-input-brand').value = p.brand || '';
        document.getElementById('prod-input-image').value = p.image;
        document.getElementById('prod-input-desc').value = p.description;
        document.getElementById('prod-input-deal').checked = !!p.isDeal;
        document.getElementById('prod-input-popular').checked = !!p.isPopular;
      }
    } else {
      titleEl.textContent = 'Add New Product';
    }

    modal.classList.remove('hidden');
  }

  closeProductModal() {
    const modal = document.getElementById('admin-product-modal');
    if (modal) modal.classList.add('hidden');
  }

  saveProduct(e) {
    e.preventDefault();
    const title = document.getElementById('prod-input-title').value.trim();
    const category = document.getElementById('prod-input-category').value;
    const price = parseFloat(document.getElementById('prod-input-price').value) || 0;
    const originalPrice = parseFloat(document.getElementById('prod-input-original-price').value) || (price * 1.2);
    const stock = parseInt(document.getElementById('prod-input-stock').value) || 0;
    const brand = document.getElementById('prod-input-brand').value.trim() || 'Kutir Mart';
    const image = document.getElementById('prod-input-image').value.trim() || 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80';
    const desc = document.getElementById('prod-input-desc').value.trim();
    const isDeal = document.getElementById('prod-input-deal').checked;
    const isPopular = document.getElementById('prod-input-popular').checked;

    const productData = {
      id: this.editingProductId || ('km-p' + Date.now()),
      title,
      category,
      price,
      originalPrice,
      stock,
      brand,
      image,
      description: desc,
      rating: 4.8,
      reviewsCount: 12,
      isDeal,
      isPopular,
      specs: ['High quality build', '100% Genuine product', 'Official Warranty']
    };

    window.kutirStore.saveProduct(productData);
    this.closeProductModal();
    this.renderProductsTable();
    this.showAdminToast(`Product "${title}" saved successfully!`);
  }

  deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
      window.kutirStore.deleteProduct(id);
      this.renderProductsTable();
      this.showAdminToast('Product deleted.');
    }
  }

  // --- Categories CRUD ---
  renderCategoriesTable() {
    const categories = window.kutirStore.getCategories();
    const container = document.getElementById('admin-categories-tbody');
    if (!container) return;

    container.innerHTML = categories.map(c => `
      <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition text-xs">
        <td class="p-3.5">
          <div class="flex items-center gap-3">
            <img src="${c.image}" class="w-10 h-10 object-cover rounded-xl" />
            <span class="font-bold text-gray-900">${c.name}</span>
          </div>
        </td>
        <td class="p-3.5"><i class="fa-solid ${c.icon || 'fa-tag'} text-gray-500"></i> ${c.icon || 'fa-tag'}</td>
        <td class="p-3.5 font-bold text-[#003d29]">${c.count} items</td>
        <td class="p-3.5 text-right">
          <button onclick="window.kutirAdmin.deleteCategory('${c.id}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition font-medium text-xs">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  addCategoryPrompt() {
    const name = prompt('Enter Category Name (e.g. Home Decor):');
    if (!name) return;
    const image = prompt('Enter Category Image URL:', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80');

    window.kutirStore.saveCategory({
      name,
      icon: 'fa-box',
      image: image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
      count: 25
    });

    this.renderCategoriesTable();
    this.showAdminToast(`Category "${name}" added!`);
  }

  deleteCategory(id) {
    if (confirm('Delete this category?')) {
      window.kutirStore.deleteCategory(id);
      this.renderCategoriesTable();
      this.showAdminToast('Category deleted.');
    }
  }

  // --- Inventory Management ---
  renderInventoryTable() {
    const products = window.kutirStore.getProducts();
    const container = document.getElementById('admin-inventory-tbody');
    if (!container) return;

    container.innerHTML = products.map(p => `
      <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition text-xs">
        <td class="p-3.5">
          <div class="flex items-center gap-3">
            <img src="${p.image}" class="w-10 h-10 object-cover rounded-xl" />
            <div>
              <p class="font-bold text-gray-800">${p.title}</p>
              <p class="text-[11px] text-gray-400">${p.category}</p>
            </div>
          </div>
        </td>
        <td class="p-3.5 font-semibold text-gray-700">${p.stock}</td>
        <td class="p-3.5">
          ${p.stock < 5 ? '<span class="px-2 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-full text-[10px]">CRITICAL</span>' :
            p.stock < 10 ? '<span class="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-full text-[10px]">LOW</span>' :
            '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">IN STOCK</span>'}
        </td>
        <td class="p-3.5">
          <div class="flex items-center gap-1">
            <button onclick="window.kutirAdmin.adjustStock('${p.id}', -5)" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700">-5</button>
            <button onclick="window.kutirAdmin.adjustStock('${p.id}', -1)" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700">-1</button>
            <button onclick="window.kutirAdmin.adjustStock('${p.id}', 1)" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700">+1</button>
            <button onclick="window.kutirAdmin.adjustStock('${p.id}', 10)" class="w-7 h-7 bg-[#d2f7ec] text-[#003d29] hover:bg-[#003d29] hover:text-white rounded-lg font-bold transition">+10</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  adjustStock(productId, delta) {
    const products = window.kutirStore.getProducts();
    const prod = products.find(p => p.id === productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock + delta);
      window.kutirStore.saveProduct(prod);
      this.renderInventoryTable();
      this.renderKPIs();
      this.showAdminToast(`Updated stock for ${prod.title} to ${prod.stock}`);
    }
  }

  // --- All Orders View ---
  renderAllOrdersTable() {
    const orders = window.kutirStore.getOrders();
    const container = document.getElementById('admin-all-orders-tbody');
    if (!container) return;

    container.innerHTML = orders.map(order => `
      <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition text-xs">
        <td class="p-3.5 font-bold text-[#003d29]">${order.id}</td>
        <td class="p-3.5">${new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
        <td class="p-3.5">
          <p class="font-semibold text-gray-800">${order.customerName}</p>
          <p class="text-[11px] text-gray-400">${order.shippingAddress}</p>
        </td>
        <td class="p-3.5 font-bold text-gray-900">$${order.total.toFixed(2)}</td>
        <td class="p-3.5">
          <select onchange="window.kutirAdmin.changeOrderStatus('${order.id}', this.value)" class="text-xs font-semibold py-1 px-2 rounded-lg border border-gray-300 bg-white">
            <option value="Placed" ${order.orderStatus === 'Placed' ? 'selected' : ''}>Placed</option>
            <option value="Processing" ${order.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${order.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Out for Delivery" ${order.orderStatus === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.orderStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td class="p-3.5 text-right">
          <button onclick="window.kutirAdmin.viewOrderDetails('${order.id}')" class="px-3 py-1 bg-[#003d29] text-white rounded-lg font-medium text-xs hover:bg-black transition">Invoice</button>
        </td>
      </tr>
    `).join('');
  }

  viewOrderDetails(orderId) {
    const order = window.kutirStore.getOrderById(orderId);
    if (!order) return;

    alert(`Order ID: ${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.shippingAddress}\nStatus: ${order.orderStatus}\nTotal: $${order.total.toFixed(2)}\nPayment: ${order.paymentMethod}`);
  }

  // --- Coupons CRUD ---
  renderCouponsTable() {
    const coupons = window.kutirStore.getCoupons();
    const container = document.getElementById('admin-coupons-tbody');
    if (!container) return;

    container.innerHTML = coupons.map(c => `
      <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition text-xs">
        <td class="p-3.5 font-mono font-bold text-[#003d29]">${c.code}</td>
        <td class="p-3.5 font-semibold text-gray-800">${c.type === 'percentage' ? `${c.value}% Off` : `$${c.value} Flat`}</td>
        <td class="p-3.5 text-gray-500">Min $${c.minSpend || 0}</td>
        <td class="p-3.5">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${c.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}">
            ${c.active ? 'ACTIVE' : 'EXPIRED'}
          </span>
        </td>
        <td class="p-3.5 text-right">
          <button onclick="window.kutirAdmin.deleteCoupon('${c.code}')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-lg transition font-medium text-xs">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  createCouponPrompt() {
    const code = prompt('Enter Coupon Code (e.g. FLASH30):');
    if (!code) return;
    const value = parseInt(prompt('Discount percentage (e.g. 30):', '30')) || 10;
    const minSpend = parseInt(prompt('Minimum spend amount ($):', '100')) || 50;

    window.kutirStore.saveCoupon({
      code: code.toUpperCase(),
      type: 'percentage',
      value: value,
      minSpend: minSpend,
      maxDiscount: 100,
      active: true,
      desc: `${value}% Off orders above $${minSpend}`
    });

    this.renderCouponsTable();
    this.showAdminToast(`Coupon ${code.toUpperCase()} created!`);
  }

  deleteCoupon(code) {
    if (confirm(`Delete coupon ${code}?`)) {
      window.kutirStore.deleteCoupon(code);
      this.renderCouponsTable();
      this.showAdminToast('Coupon deleted.');
    }
  }

  // --- Analytics View ---
  renderAnalytics() {
    const orders = window.kutirStore.getOrders();
    const products = window.kutirStore.getProducts();

    const catSales = {};
    orders.forEach(o => {
      o.items.forEach(i => {
        const prod = products.find(p => p.id === i.productId || p.id === i.id);
        const cat = prod ? prod.category : 'Other';
        catSales[cat] = (catSales[cat] || 0) + (i.price * i.quantity);
      });
    });

    const container = document.getElementById('analytics-category-breakdown');
    if (!container) return;

    container.innerHTML = Object.entries(catSales).map(([cat, total]) => `
      <div class="flex items-center justify-between p-3 bg-gray-50 rounded-2xl mb-2">
        <span class="font-semibold text-xs text-gray-800">${cat}</span>
        <span class="font-bold text-xs text-[#003d29]">$${total.toFixed(2)}</span>
      </div>
    `).join('');
  }

  showAdminToast(msg) {
    const el = document.createElement('div');
    el.className = 'fixed bottom-6 right-6 z-50 bg-[#231f1e] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-bounce';
    el.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i> <span>${msg}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

window.kutirAdmin = new KutirAdmin();
