/**
 * KUTIR MART - Multi-step Checkout Controller
 */

class KutirCheckout {
  constructor() {
    this.currentStep = 1;
    this.appliedCoupon = null;
    this.selectedAddressId = null;
    this.paymentMethod = 'bKash';
    this.shippingCost = 0.00; // Free above $100 or standard $15
  }

  open() {
    const cart = window.kutirStore.getCart();
    if (cart.length === 0) {
      window.kutirApp.showToast('Your cart is empty! Add items first.', 'info');
      return;
    }
    this.currentStep = 1;
    this.loadSavedAddresses();
    this.renderStep();
    this.updateOrderSummary();
    
    // Close cart drawer if open
    window.kutirApp.closeCart();
    
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }
  }

  close() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  setStep(step) {
    if (step === 2) {
      // Validate Step 1 form
      if (!this.validateStep1()) return;
    }
    if (step === 3) {
      // Validate Step 2
      if (!this.validateStep2()) return;
    }
    this.currentStep = step;
    this.renderStep();
  }

  loadSavedAddresses() {
    const user = window.kutirStore.getUser();
    const container = document.getElementById('saved-addresses-list');
    if (!container) return;

    if (!user.addresses || user.addresses.length === 0) {
      container.innerHTML = '<p class="text-xs text-gray-500 mb-2">No saved addresses found. Please enter shipping info below.</p>';
      return;
    }

    container.innerHTML = user.addresses.map((addr, idx) => `
      <label class="flex items-start p-3 border rounded-xl cursor-pointer hover:border-[#003d29] transition mb-2 ${addr.isDefault ? 'border-[#003d29] bg-[#d2f7ec]/20' : 'border-gray-200'}">
        <input type="radio" name="checkout-addr" value="${addr.id}" ${addr.isDefault ? 'checked' : ''} onchange="window.kutirCheckout.selectAddress('${addr.id}')" class="mt-1 text-[#003d29] focus:ring-[#003d29]">
        <div class="ml-3 text-left">
          <span class="font-semibold text-xs text-[#003d29] uppercase tracking-wide px-1.5 py-0.5 bg-white rounded border border-[#003d29]/20">${addr.title}</span>
          <p class="text-sm font-medium text-[#231f1e] mt-1">${addr.fullName} (${addr.phone})</p>
          <p class="text-xs text-gray-600">${addr.street}, ${addr.city} - ${addr.postalCode}</p>
        </div>
      </label>
    `).join('');

    const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
    if (defaultAddr) {
      this.selectAddress(defaultAddr.id);
    }
  }

  selectAddress(id) {
    this.selectedAddressId = id;
    const user = window.kutirStore.getUser();
    const addr = user.addresses.find(a => a.id === id);
    if (addr) {
      document.getElementById('shipping-name').value = addr.fullName || '';
      document.getElementById('shipping-phone').value = addr.phone || '';
      document.getElementById('shipping-street').value = addr.street || '';
      document.getElementById('shipping-city').value = addr.city || '';
      document.getElementById('shipping-postal').value = addr.postalCode || '';
    }
  }

  validateStep1() {
    const name = document.getElementById('shipping-name').value.trim();
    const phone = document.getElementById('shipping-phone').value.trim();
    const street = document.getElementById('shipping-street').value.trim();
    const city = document.getElementById('shipping-city').value.trim();

    if (!name || !phone || !street || !city) {
      window.kutirApp.showToast('Please fill out all required shipping fields', 'warning');
      return false;
    }
    return true;
  }

  validateStep2() {
    if (this.paymentMethod === 'Card') {
      const cardNum = document.getElementById('card-number')?.value.trim();
      const cardExp = document.getElementById('card-expiry')?.value.trim();
      const cardCvv = document.getElementById('card-cvv')?.value.trim();
      if (!cardNum || cardNum.length < 15 || !cardExp || !cardCvv) {
        window.kutirApp.showToast('Please enter complete mock card details', 'warning');
        return false;
      }
    } else if (['bKash', 'Nagad', 'Rocket'].includes(this.paymentMethod)) {
      const mfsPhone = document.getElementById('mfs-phone')?.value.trim();
      if (!mfsPhone || mfsPhone.length < 11) {
        window.kutirApp.showToast(`Please enter your valid 11-digit ${this.paymentMethod} number`, 'warning');
        return false;
      }
    }
    return true;
  }

  renderStep() {
    // Step indicator badges
    [1, 2, 3].forEach(step => {
      const el = document.getElementById(`step-badge-${step}`);
      const text = document.getElementById(`step-text-${step}`);
      if (el && text) {
        if (step === this.currentStep) {
          el.className = 'w-8 h-8 rounded-full bg-[#003d29] text-white flex items-center justify-center font-bold text-sm shadow-md';
          text.className = 'text-xs font-bold text-[#003d29]';
        } else if (step < this.currentStep) {
          el.className = 'w-8 h-8 rounded-full bg-[#d2f7ec] text-[#003d29] flex items-center justify-center font-bold text-sm';
          text.className = 'text-xs font-semibold text-gray-700';
        } else {
          el.className = 'w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm';
          text.className = 'text-xs font-medium text-gray-400';
        }
      }

      const content = document.getElementById(`checkout-step-${step}-content`);
      if (content) {
        if (step === this.currentStep) content.classList.remove('hidden');
        else content.classList.add('hidden');
      }
    });

    if (this.currentStep === 3) {
      this.renderReviewSummary();
    }
  }

  setPaymentMethod(method) {
    this.paymentMethod = method;
    ['bkash', 'nagad', 'card', 'cod'].forEach(m => {
      const btn = document.getElementById(`pay-tab-${m}`);
      if (btn) {
        if (m.toLowerCase() === method.toLowerCase()) {
          btn.classList.add('border-[#003d29]', 'bg-[#d2f7ec]/20', 'text-[#003d29]');
          btn.classList.remove('border-gray-200', 'text-gray-600');
        } else {
          btn.classList.remove('border-[#003d29]', 'bg-[#d2f7ec]/20', 'text-[#003d29]');
          btn.classList.add('border-gray-200', 'text-gray-600');
        }
      }
    });

    // Toggle fields
    document.getElementById('payment-fields-card')?.classList.toggle('hidden', method !== 'Card');
    document.getElementById('payment-fields-mfs')?.classList.toggle('hidden', !['bKash', 'Nagad', 'Rocket'].includes(method));
    document.getElementById('payment-fields-cod')?.classList.toggle('hidden', method !== 'COD' && method !== 'Cash on Delivery');
    
    const mfsTitle = document.getElementById('mfs-service-name');
    if (mfsTitle) mfsTitle.textContent = method;
  }

  updateOrderSummary() {
    const subtotal = window.kutirStore.getCartTotal();
    this.shippingCost = subtotal > 150 ? 0.00 : (subtotal > 0 ? 15.00 : 0.00);

    let discount = 0;
    if (this.appliedCoupon) {
      discount = this.appliedCoupon.discount;
    }

    const grandTotal = Math.max(0, subtotal - discount + this.shippingCost);

    const subEl = document.getElementById('checkout-subtotal');
    const shipEl = document.getElementById('checkout-shipping');
    const discEl = document.getElementById('checkout-discount');
    const totEl = document.getElementById('checkout-grand-total');

    if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shipEl) shipEl.textContent = this.shippingCost === 0 ? 'FREE' : `$${this.shippingCost.toFixed(2)}`;
    if (discEl) discEl.textContent = discount > 0 ? `-$${discount.toFixed(2)}` : '$0.00';
    if (totEl) totEl.textContent = `$${grandTotal.toFixed(2)}`;

    // Render items in mini summary
    const itemsContainer = document.getElementById('checkout-mini-items');
    if (itemsContainer) {
      const cart = window.kutirStore.getCart();
      itemsContainer.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between text-xs py-1.5 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <img src="${item.image}" class="w-9 h-9 object-cover rounded-lg bg-gray-50 border border-gray-100" />
            <div>
              <p class="font-medium text-gray-800 line-clamp-1">${item.title}</p>
              <p class="text-gray-400">Qty: ${item.quantity}</p>
            </div>
          </div>
          <span class="font-semibold text-[#003d29]">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
    }
  }

  applyCheckoutCoupon() {
    const input = document.getElementById('checkout-coupon-input');
    const code = input ? input.value.trim() : '';
    const subtotal = window.kutirStore.getCartTotal();
    
    const result = window.kutirStore.validateCoupon(code, subtotal);
    if (!result.valid) {
      window.kutirApp.showToast(result.message, 'warning');
      return;
    }

    this.appliedCoupon = result;
    window.kutirApp.showToast(`Coupon ${result.code} applied! Saved $${result.discount.toFixed(2)}`, 'success');
    this.updateOrderSummary();
  }

  renderReviewSummary() {
    const name = document.getElementById('shipping-name')?.value || '';
    const phone = document.getElementById('shipping-phone')?.value || '';
    const street = document.getElementById('shipping-street')?.value || '';
    const city = document.getElementById('shipping-city')?.value || '';
    const postal = document.getElementById('shipping-postal')?.value || '';

    const reviewAddress = document.getElementById('review-shipping-address');
    if (reviewAddress) {
      reviewAddress.innerHTML = `
        <p class="font-semibold text-sm text-[#231f1e]">${name} <span class="font-normal text-gray-500">(${phone})</span></p>
        <p class="text-xs text-gray-600 mt-0.5">${street}, ${city} ${postal ? '- ' + postal : ''}</p>
      `;
    }

    const reviewPayment = document.getElementById('review-payment-method');
    if (reviewPayment) {
      reviewPayment.textContent = this.paymentMethod;
    }
  }

  submitOrder() {
    const cart = window.kutirStore.getCart();
    if (cart.length === 0) {
      window.kutirApp.showToast('Your cart is empty', 'warning');
      return;
    }

    const name = document.getElementById('shipping-name')?.value.trim() || 'Valued Customer';
    const email = document.getElementById('shipping-email')?.value.trim() || 'customer@example.com';
    const phone = document.getElementById('shipping-phone')?.value.trim() || '+880 1700-000000';
    const street = document.getElementById('shipping-street')?.value.trim() || '';
    const city = document.getElementById('shipping-city')?.value.trim() || '';
    const postal = document.getElementById('shipping-postal')?.value.trim() || '';
    const fullAddress = `${street}, ${city} ${postal ? '- ' + postal : ''}`;

    const subtotal = window.kutirStore.getCartTotal();
    const discount = this.appliedCoupon ? this.appliedCoupon.discount : 0;
    const grandTotal = Math.max(0, subtotal - discount + this.shippingCost);

    const orderData = {
      customerName: name,
      email: email,
      phone: phone,
      shippingAddress: fullAddress,
      items: [...cart],
      subtotal: subtotal,
      discount: discount,
      shippingFee: this.shippingCost,
      total: grandTotal,
      paymentMethod: this.paymentMethod
    };

    const newOrder = window.kutirStore.createOrder(orderData);
    this.close();

    // Trigger order confirmation modal
    this.showOrderSuccessModal(newOrder);
  }

  showOrderSuccessModal(order) {
    const modal = document.getElementById('order-success-modal');
    if (!modal) return;

    document.getElementById('success-order-id').textContent = order.id;
    document.getElementById('success-order-total').textContent = `$${order.total.toFixed(2)}`;
    document.getElementById('success-order-date').textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('success-order-payment').textContent = order.paymentMethod;
    document.getElementById('success-order-address').textContent = order.shippingAddress;

    // Track Button Handler
    const trackBtn = document.getElementById('success-track-btn');
    if (trackBtn) {
      trackBtn.onclick = () => {
        modal.classList.add('hidden');
        window.kutirTracking.open(order.id);
      };
    }

    modal.classList.remove('hidden');
  }
}

window.kutirCheckout = new KutirCheckout();
