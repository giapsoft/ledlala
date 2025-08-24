lucide.createIcons();
const formatDate = (timestamp) => {
      const date = new Date(timestamp);
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
document.addEventListener('DOMContentLoaded', function () {
  // --- DỮ LIỆU SẢN PHẨM & TRẠNG THÁI ---
  const products = [
    { id: 'kalimba17', name: 'Bộ LED cho đàn Kalimba 17 phím', startPrice: 119000, maxPrice: 219000 },
    { id: 'kalimba21', name: 'Bộ LED cho đàn Kalimba 21 phím', startPrice: 129000, maxPrice: 229000 },
    { id: 'tank15', name: 'Bộ LED cho trống lưỡi thép 15 nốt', startPrice: 149000, maxPrice: 249000 },
    { id: 'tank13', name: 'Bộ LED cho trống lưỡi thép 13 nốt', startPrice: 139000, maxPrice: 239000 },
    { id: 'tank11', name: 'Bộ LED cho trống lưỡi thép 11 nốt', startPrice: 129000, maxPrice: 229000 },
    { id: 'tank8', name: 'Bộ LED cho trống lưỡi 8 nốt', startPrice: 119000, maxPrice: 219000 },
  ];

  const productsData = {
    kalimba: {
      name: "Đàn Kalimba",
      idPrefix: "kalimba",
      variants: [{ value: 17, text: "17 phím" }, { value: 21, text: "21 phím" }]
    },
    tankdrum: {
      name: "Trống Lưỡi Thép",
      idPrefix: "tank",
      variants: [{ value: 8, text: "8 nốt" }, { value: 11, text: "11 nốt" }, { value: 13, text: "13 nốt" }, { value: 15, text: "15 nốt" }]
    }
  };

  const validRefs = ['trangbt', 'lamnt', 'lent', 'giapnt', 'thuynt'];
  const SHIPPING_COST = 20000;
  const startTime = new Date('2025-08-24T19:00:00').getTime();

  let selectedId = 'kalimba17';
  let currentPrice = 0;
  let isRefValid = false;

  // --- LẤY CÁC PHẦN TỬ DOM ---
  const orderForm = document.getElementById('orderForm');
  // DOM cho phần chọn sản phẩm
  const typeContainer = document.getElementById('instrument-type-container');
  const variantsWrapper = document.getElementById('variants-wrapper');
  const productNameDivs = document.querySelectorAll('.product-name');
  // DOM cho phần giá động
  const startPriceDiv = document.getElementById('start-price');
  const maxPriceDiv = document.getElementById('max-price');
  const currentPriceEl = document.getElementById('current-price');
  const progressBarEl = document.getElementById('progress-bar');
  const countdownEl = document.getElementById('countdown');
  const ctaPriceEl = document.getElementById('cta-price');
  const startDateDisplayEl = document.getElementById('start-date-display');
  startDateDisplayEl.innerText = formatDate(startTime);
  const endDateDisplayEl = document.getElementById('end-date-display');
  const footerCountdownBarEls = document.querySelectorAll('.countdown-bar');
  // DOM cho phần đơn hàng
  const shippingCostEl = document.getElementById('shipping-cost');
  const totalPriceEl = document.getElementById('total-price');
  const qtyInput = document.getElementById('quantity-input');
  const qtyMinusBtn = document.getElementById('qty-minus');
  const qtyPlusBtn = document.getElementById('qty-plus');
  // DOM cho các trường ẩn của form
  const hiddenTotalPriceEl = document.getElementById('tong_tien_thanh_toan');
  const hiddenOrderDetailsEl = document.getElementById('chi_tiet_don_hang');
  const hiddenRefCodeEl = document.getElementById('ref_code');


  // --- HÀM TÍNH TOÁN & CẬP NHẬT ---

  function updateOrder() {
    const quantity = parseInt(qtyInput.value) || 1;
    const subtotal = quantity * currentPrice;
    const shippingCost = subtotal > 0 ? SHIPPING_COST : 0;
    const finalTotal = subtotal + shippingCost;

    shippingCostEl.textContent = shippingCost.toLocaleString('vi-VN') + 'đ';
    totalPriceEl.textContent = finalTotal.toLocaleString('vi-VN') + 'đ';

    hiddenTotalPriceEl.value = finalTotal;
    hiddenOrderDetailsEl.value = JSON.stringify({ [selectedId]: quantity });
  }

  function updatePriceDisplay() {
    const now = Date.now();
    const elapsedTimeMs = now - startTime;
    const selectedProduct = products.find(p => p.id === selectedId);

    if (!selectedProduct || elapsedTimeMs < 0) {
      currentPrice = selectedProduct ? selectedProduct.startPrice : 0;
      progressBarEl.style.width = `0%`;
      countdownEl.parentElement.innerHTML = '<span class="font-bold text-white">Chương trình sắp bắt đầu!</span>';
    } else {
      const { startPrice, maxPrice } = selectedProduct;
      const increaseAmount = 1;
      const increaseIntervalMs = 30 * 1000;
      
      const numberOfIncreases = Math.floor(elapsedTimeMs / increaseIntervalMs);
      currentPrice = startPrice + (numberOfIncreases * increaseAmount);
      if (currentPrice > maxPrice) {
        currentPrice = maxPrice;
      }
      
      const totalIncrease = maxPrice - startPrice;
      const totalMs = increaseIntervalMs * totalIncrease;
      const endTime = startTime + totalMs;
      endDateDisplayEl.innerText = formatDate(endTime);

      const currentIncrease = currentPrice - startPrice;
      const progressPercentage = totalIncrease > 0 ? (currentIncrease / totalIncrease) * 100 : 100;
      progressBarEl.style.width = `${progressPercentage}%`;

      if (currentPrice < maxPrice) {
        const timeUntilNextIncrease = increaseIntervalMs - (elapsedTimeMs % increaseIntervalMs);
        countdownEl.textContent = Math.ceil(timeUntilNextIncrease / 1000);
        const countdownBarPercentage = (timeUntilNextIncrease / increaseIntervalMs) * 100;
        footerCountdownBarEls.forEach(bar => bar.style.width = `${countdownBarPercentage}%`);
      } else {
        countdownEl.parentElement.innerHTML = '<span class="font-bold text-white">Đã đạt giá cuối cùng!</span>';
      }
    }

    const saleOffPrice = isRefValid ? currentPrice - 20000 : currentPrice;
    const formattedPrice = (saleOffPrice > 0 ? saleOffPrice : 0).toLocaleString('vi-VN') + 'đ';
    currentPriceEl.textContent = formattedPrice;
    ctaPriceEl.textContent = formattedPrice;

    updateOrder();
  }

  function updateUI() {
    const info = getProductInfoFromId(selectedId);
    if (!info) return;

    const selectedProductData = products.find(p => p.id === selectedId);
    if (!selectedProductData) return;

    productNameDivs.forEach(div => div.innerText = selectedProductData.name);
    startPriceDiv.innerText = selectedProductData.startPrice.toLocaleString('vi-VN') + "đ";
    maxPriceDiv.innerText = selectedProductData.maxPrice.toLocaleString('vi-VN') + "đ";
    
    typeContainer.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === info.typeKey);
    });

    variantsWrapper.querySelectorAll('.variant-group').forEach(group => {
      group.classList.toggle('hidden', group.id !== `${info.typeKey}-variants`);
    });

    variantsWrapper.querySelectorAll('.variant-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === selectedId);
    });

    qtyInput.value = 1; // Reset số lượng về 1 khi đổi sản phẩm
    updatePriceDisplay();
  }

  function renderUI() {
    for (const typeKey in productsData) {
      const product = productsData[typeKey];
      const typeBtn = document.createElement('div');
      typeBtn.className = 'option-btn';
      typeBtn.textContent = product.name;
      typeBtn.dataset.type = typeKey;
      typeContainer.appendChild(typeBtn);

      const variantGroup = document.createElement('div');
      variantGroup.id = `${typeKey}-variants`;
      variantGroup.className = 'variant-group';

      const title = document.createElement('h4');
      title.textContent = `Chọn Phiên Bản ${product.name}`;
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'options-container';

      product.variants.forEach(variant => {
        const variantBtn = document.createElement('div');
        variantBtn.className = 'option-btn variant-option';
        variantBtn.textContent = variant.text;
        variantBtn.dataset.id = `${product.idPrefix}${variant.value}`;
        optionsContainer.appendChild(variantBtn);
      });

      variantGroup.append(title, optionsContainer);
      variantsWrapper.appendChild(variantGroup);
    }
  }

  function getProductInfoFromId(id) {
    for (const typeKey in productsData) {
      const product = productsData[typeKey];
      if (id.startsWith(product.idPrefix)) {
        const variantValue = parseInt(id.replace(product.idPrefix, ''), 10);
        const variant = product.variants.find(v => v.value === variantValue);
        if (variant) return { typeKey, product, variant };
      }
    }
    return null;
  }

  // --- GẮN SỰ KIỆN ---

  qtyPlusBtn.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value, 10) + 1;
    updateOrder();
  });

  qtyMinusBtn.addEventListener('click', () => {
    let currentQty = parseInt(qtyInput.value, 10);
    if (currentQty > 1) {
      qtyInput.value = currentQty - 1;
      updateOrder();
    }
  });

  qtyInput.addEventListener('input', () => {
    if (parseInt(qtyInput.value, 10) < 1 || isNaN(parseInt(qtyInput.value, 10))) {
      qtyInput.value = 1;
    }
    updateOrder();
  });

  typeContainer.addEventListener('click', (event) => {
    const clickedBtn = event.target.closest('.option-btn');
    if (!clickedBtn) return;

    const typeKey = clickedBtn.dataset.type;
    const currentInfo = getProductInfoFromId(selectedId);
    
    if (currentInfo && currentInfo.typeKey !== typeKey) {
      const firstVariant = productsData[typeKey].variants[0];
      selectedId = `${productsData[typeKey].idPrefix}${firstVariant.value}`;
      updateUI();
    }
  });

  variantsWrapper.addEventListener('click', (event) => {
    const clickedBtn = event.target.closest('.variant-option');
    if (!clickedBtn) return;
    selectedId = clickedBtn.dataset.id;
    updateUI();
  });

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    updateOrder();
    if (!hiddenOrderDetailsEl.value || hiddenOrderDetailsEl.value === '{}') {
      alert('Bạn vui lòng chọn ít nhất một sản phẩm.');
      return;
    }
    fetch(orderForm.action, {
      method: 'POST',
      mode: 'no-cors',
      body: new FormData(orderForm)
    }).then(() => {
      alert('Đơn hàng của bạn đã được gửi đi! Cảm ơn bạn.');
      orderForm.reset();
      updateUI(); // Reset giao diện về trạng thái ban đầu
    }).catch(error => {
      console.error('Error:', error);
      alert('Đã có lỗi xảy ra, vui lòng thử lại.');
    });
  });

  // --- KHỞI CHẠY ---
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode && validRefs.find((r) => r.toLowerCase() === refCode.toLowerCase())) {
    isRefValid = true;
    hiddenRefCodeEl.value = refCode.toUpperCase();
  }

  renderUI();
  updateUI();
  setInterval(updatePriceDisplay, 1000);
});