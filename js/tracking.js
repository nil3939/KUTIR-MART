/**
 * KUTIR MART - Live Order Tracking Controller
 */

class KutirTracking {
  constructor() {}

  open(orderId = '') {
    const modal = document.getElementById('tracking-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    if (orderId) {
      const input = document.getElementById('tracking-search-input');
      if (input) input.value = orderId;
      this.trackOrder(orderId);
    } else {
      // Default to most recent order if available
      const orders = window.kutirStore.getOrders();
      if (orders.length > 0) {
        this.trackOrder(orders[0].id);
        const input = document.getElementById('tracking-search-input');
        if (input) input.value = orders[0].id;
      }
    }
  }

  close() {
    const modal = document.getElementById('tracking-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
  }

  trackOrder(orderId) {
    const id = orderId || document.getElementById('tracking-search-input')?.value.trim();
    if (!id) {
      window.kutirApp.showToast('Please enter an Order ID (e.g. KM-8841)', 'warning');
      return;
    }

    const order = window.kutirStore.getOrderById(id);
    const resultContainer = document.getElementById('tracking-results-content');
    const notFoundContainer = document.getElementById('tracking-not-found');

    if (!order) {
      if (resultContainer) resultContainer.classList.add('hidden');
      if (notFoundContainer) notFoundContainer.classList.remove('hidden');
      return;
    }

    if (notFoundContainer) notFoundContainer.classList.add('hidden');
    if (resultContainer) resultContainer.classList.remove('hidden');

    // Populate order meta
    document.getElementById('track-disp-id').textContent = order.id;
    document.getElementById('track-disp-date').textContent = new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    document.getElementById('track-disp-status').textContent = order.orderStatus;
    document.getElementById('track-disp-address').textContent = order.shippingAddress;
    document.getElementById('track-disp-total').textContent = `$${order.total.toFixed(2)}`;

    // Status badge color
    const statusEl = document.getElementById('track-disp-status');
    if (statusEl) {
      statusEl.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase ' + 
        (order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
         order.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
         order.orderStatus === 'Out for Delivery' ? 'bg-indigo-100 text-indigo-800' :
         'bg-amber-100 text-amber-800');
    }

    // Build 5-step Timeline
    const steps = [
      { name: 'Order Placed', desc: 'We have received your order' },
      { name: 'Processing', desc: 'Items verified & packed in warehouse' },
      { name: 'Shipped', desc: 'Package handed over to courier partner' },
      { name: 'Out for Delivery', desc: 'Delivery agent is heading to your doorstep' },
      { name: 'Delivered', desc: 'Package delivered & signed' }
    ];

    const timelineContainer = document.getElementById('tracking-timeline-steps');
    if (timelineContainer) {
      const currentStepIdx = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].indexOf(order.orderStatus);

      timelineContainer.innerHTML = steps.map((s, idx) => {
        const isDone = idx <= currentStepIdx;
        const isCurrent = idx === currentStepIdx;
        const stepTime = order.trackingSteps && order.trackingSteps[idx] ? order.trackingSteps[idx].time : (isDone ? 'Completed' : 'Pending');

        return `
          <div class="relative flex items-start group">
            <!-- Vertical connecting line -->
            ${idx !== steps.length - 1 ? `
              <div class="absolute left-4 top-8 -bottom-4 w-0.5 ${idx < currentStepIdx ? 'bg-[#003d29]' : 'bg-gray-200'}"></div>
            ` : ''}

            <!-- Icon circle -->
            <div class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
              isDone ? 'bg-[#003d29] text-white shadow-md shadow-[#003d29]/20' : 'bg-gray-100 text-gray-400 border border-gray-200'
            }">
              ${isDone ? '<i class="fa-solid fa-check text-xs"></i>' : (idx + 1)}
            </div>

            <!-- Text Content -->
            <div class="ml-4 flex-1 pb-6">
              <div class="flex items-center justify-between">
                <h5 class="text-sm font-bold ${isCurrent ? 'text-[#003d29]' : (isDone ? 'text-gray-900' : 'text-gray-400')}">
                  ${s.name}
                  ${isCurrent ? '<span class="ml-2 text-[10px] bg-[#d2f7ec] text-[#003d29] px-2 py-0.5 rounded-full font-semibold">Active</span>' : ''}
                </h5>
                <span class="text-xs text-gray-400 font-medium">${stepTime}</span>
              </div>
              <p class="text-xs text-gray-500 mt-0.5">${s.desc}</p>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Items in Tracking summary
    const itemsList = document.getElementById('tracking-items-list');
    if (itemsList) {
      itemsList.innerHTML = order.items.map(item => `
        <div class="flex items-center justify-between py-2 border-b border-gray-100 text-xs">
          <div class="flex items-center gap-3">
            <img src="${item.image}" class="w-10 h-10 object-cover rounded-lg border border-gray-100" />
            <div>
              <p class="font-semibold text-gray-800">${item.title}</p>
              <p class="text-gray-400">Qty: ${item.quantity}</p>
            </div>
          </div>
          <span class="font-bold text-[#003d29]">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `).join('');
    }
  }
}

window.kutirTracking = new KutirTracking();
