/**
 * KUTIR MART - Customer Account Portal Controller
 * Manages Profile, Orders History, Wishlist, and Addresses.
 */

class KutirAccount {
  constructor() {
    this.currentTab = 'orders';
  }

  open(tab = 'orders') {
    this.currentTab = tab;
    this.switchTab(tab);
    
    const modal = document.getElementById('account-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  close() {
    const modal = document.getElementById('account-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    ['profile', 'orders', 'wishlist', 'addresses'].forEach(t => {
      const tabBtn = document.getElementById(`acc-tab-${t}`);
      const content = document.getElementById(`acc-content-${t}`);
      if (tabBtn) {
        if (t === tab) {
          tabBtn.className = 'w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#003d29] text-white flex items-center gap-3 transition shadow-sm';
        } else {
          tabBtn.className = 'w-full text-left px-4 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-3 transition';
        }
      }
      if (content) {
        content.classList.toggle('hidden', t !== tab);
      }
    });

    if (tab === 'profile') this.renderProfile();
    else if (tab === 'orders') this.renderOrders();
    else if (tab === 'wishlist') this.renderWishlist();
    else if (tab === 'addresses') this.renderAddresses();
  }

  renderProfile() {
    const user = window.kutirStore.getUser();
    const nameInput = document.getElementById('user-profile-name');
    const emailInput = document.getElementById('user-profile-email');
    const phoneInput = document.getElementById('user-profile-phone');

    if (nameInput) nameInput.value = user.name || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';

    const avatarEl = document.getElementById('user-profile-avatar');
    if (avatarEl) avatarEl.src = user.avatar || 'assets/jerry.png';
  }

  saveProfile(e) {
    if (e) e.preventDefault();
    const user = window.kutirStore.getUser();
    user.name = document.getElementById('user-profile-name').value.trim();
    user.email = document.getElementById('user-profile-email').value.trim();
    user.phone = document.getElementById('user-profile-phone').value.trim();
    
    window.kutirStore.saveUser(user);
    window.kutirApp.showToast('Profile updated successfully!', 'success');
  }

  renderOrders() {
    const orders = window.kutirStore.getOrders();
    const container = document.getElementById('account-orders-list');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <i class="fa-solid fa-box-open text-2xl"></i>
          </div>
          <p class="text-base font-semibold text-gray-700">No orders yet</p>
          <p class="text-xs text-gray-400 mt-1">Start shopping and discover artisan products!</p>
          <button onclick="window.kutirAccount.close()" class="mt-4 px-5 py-2 bg-[#003d29] text-white text-xs font-semibold rounded-full hover:bg-black transition">Shop Now</button>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const statusColors = {
        'Placed': 'bg-blue-50 text-blue-700 border-blue-200',
        'Processing': 'bg-amber-50 text-amber-700 border-amber-200',
        'Shipped': 'bg-purple-50 text-purple-700 border-purple-200',
        'Out for Delivery': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200'
      };

      const statusBadge = statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700';

      return `
        <div class="border border-gray-200 rounded-2xl p-4 mb-4 bg-white shadow-xs hover:border-[#003d29]/40 transition">
          <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-[#003d29]">${order.id}</span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge}">${order.orderStatus}</span>
              </div>
              <p class="text-xs text-gray-400 mt-0.5">Placed on ${new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-gray-400">Total:</span>
              <span class="font-bold text-base text-[#231f1e] ml-1">$${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="py-3 flex flex-wrap gap-2">
            ${order.items.map(item => `
              <div class="flex items-center gap-2 p-1.5 bg-gray-50 rounded-xl border border-gray-100 pr-3">
                <img src="${item.image}" class="w-10 h-10 object-cover rounded-lg" />
                <div>
                  <p class="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[140px]">${item.title}</p>
                  <p class="text-[11px] text-gray-400">Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span class="text-xs text-gray-500"><i class="fa-solid fa-credit-card mr-1 text-gray-400"></i> ${order.paymentMethod}</span>
            <div class="flex gap-2">
              <button onclick="window.kutirAccount.close(); window.kutirTracking.open('${order.id}');" class="px-3 py-1.5 bg-[#d2f7ec] text-[#003d29] hover:bg-[#003d29] hover:text-white rounded-full text-xs font-semibold transition flex items-center gap-1.5">
                <i class="fa-solid fa-location-crosshairs"></i> Track Order
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderWishlist() {
    const wishlistIds = window.kutirStore.getWishlist();
    const container = document.getElementById('account-wishlist-grid');
    if (!container) return;

    const products = window.kutirStore.getProducts().filter(p => wishlistIds.includes(p.id));

    if (products.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
            <i class="fa-regular fa-heart text-2xl"></i>
          </div>
          <p class="text-base font-semibold text-gray-700">Your wishlist is empty</p>
          <p class="text-xs text-gray-400 mt-1">Explore our catalog and save your favorites!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="border border-gray-200 rounded-2xl p-3 bg-white hover:shadow-md transition group relative">
        <button onclick="window.kutirStore.toggleWishlist('${product.id}'); window.kutirAccount.renderWishlist();" class="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/90 text-rose-500 shadow-sm flex items-center justify-center hover:bg-rose-50 text-xs">
          <i class="fa-solid fa-trash"></i>
        </button>
        <img src="${product.image}" class="w-full h-36 object-cover rounded-xl bg-gray-50 mb-2.5" />
        <span class="text-[10px] uppercase font-bold text-[#003d29] tracking-wider bg-[#d2f7ec]/60 px-2 py-0.5 rounded-full">${product.category}</span>
        <h4 class="font-semibold text-xs text-[#231f1e] mt-1.5 line-clamp-1">${product.title}</h4>
        <div class="flex items-center justify-between mt-2">
          <span class="font-bold text-sm text-[#003d29]">$${product.price.toFixed(2)}</span>
          <button onclick="window.kutirStore.addToCart('${product.id}'); window.kutirApp.showToast('Added to cart!', 'success');" class="px-3 py-1 bg-[#003d29] text-white rounded-full text-xs font-semibold hover:bg-black transition">
            <i class="fa-solid fa-cart-plus mr-1"></i> Add
          </button>
        </div>
      </div>
    `).join('');
  }

  renderAddresses() {
    const user = window.kutirStore.getUser();
    const container = document.getElementById('account-addresses-list');
    if (!container) return;

    if (!user.addresses || user.addresses.length === 0) {
      container.innerHTML = '<p class="text-xs text-gray-400">No saved addresses yet.</p>';
      return;
    }

    container.innerHTML = user.addresses.map(addr => `
      <div class="border rounded-2xl p-4 mb-3 relative ${addr.isDefault ? 'border-[#003d29] bg-[#d2f7ec]/10' : 'border-gray-200 bg-white'}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs uppercase px-2 py-0.5 rounded ${addr.isDefault ? 'bg-[#003d29] text-white' : 'bg-gray-100 text-gray-700'}">${addr.title}</span>
            ${addr.isDefault ? '<span class="text-[11px] text-[#003d29] font-semibold"><i class="fa-solid fa-circle-check"></i> Default Address</span>' : ''}
          </div>
          <button onclick="window.kutirStore.deleteAddress('${addr.id}'); window.kutirAccount.renderAddresses();" class="text-xs text-red-500 hover:text-red-700 p-1">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <p class="text-sm font-semibold text-[#231f1e] mt-2">${addr.fullName} <span class="font-normal text-xs text-gray-500">(${addr.phone})</span></p>
        <p class="text-xs text-gray-600 mt-1">${addr.street}, ${addr.city} - ${addr.postalCode}, ${addr.country}</p>
      </div>
    `).join('');
  }

  saveNewAddress(e) {
    if (e) e.preventDefault();
    const title = document.getElementById('new-addr-title').value.trim() || 'Home';
    const fullName = document.getElementById('new-addr-name').value.trim();
    const phone = document.getElementById('new-addr-phone').value.trim();
    const street = document.getElementById('new-addr-street').value.trim();
    const city = document.getElementById('new-addr-city').value.trim();
    const postal = document.getElementById('new-addr-postal').value.trim();

    if (!fullName || !phone || !street || !city) {
      window.kutirApp.showToast('Please fill out all address fields', 'warning');
      return;
    }

    window.kutirStore.addAddress({
      title,
      fullName,
      phone,
      street,
      city,
      postalCode: postal,
      country: 'Bangladesh',
      isDefault: false
    });

    document.getElementById('new-address-form').reset();
    this.renderAddresses();
    window.kutirApp.showToast('New address saved!', 'success');
  }
}

window.kutirAccount = new KutirAccount();
