let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function addToCart(name, price, image) {
    const item = {
        id: Date.now(),
        name: name,
        price: price,
        image: image
    };
    
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    showNotification('Item adicionado ao carrinho!');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Seu carrinho está vazio</p>';
        if (cartTotalElement) cartTotalElement.textContent = 'R$ 0,00';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        total += item.price;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Item adicionado ao carrinho</p>
            </div>
            <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
            <button onclick="removeFromCart(${item.id})" style="margin-left: 1rem; padding: 0.5rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Remover</button>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    if (cartTotalElement) {
        cartTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
}

function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    loadCartItems();
}

function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelector(`[data-method="${method}"]`).classList.add('selected');
    localStorage.setItem('selectedPayment', method);
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const selectedPayment = localStorage.getItem('selectedPayment');
    if (!selectedPayment) {
        alert('Selecione uma forma de pagamento!');
        return;
    }
    
    const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price, 0),
        payment: selectedPayment,
        status: 'preparando',
        date: new Date().toLocaleDateString()
    };
    
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    clearCart();
    showNotification('Pedido realizado com sucesso!');
    
    setTimeout(() => {
        window.location.href = 'orders.html';
    }, 2000);
}

function loadOrders() {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Você ainda não fez nenhum pedido</p>';
        return;
    }
    
    ordersContainer.innerHTML = '';
    
    orders.reverse().forEach(order => {
        const statusClass = `status-${order.status}`;
        const statusText = order.status === 'preparando' ? 'Preparando' : 
                          order.status === 'entregue' ? 'Entregue' : 'Pendente';
        
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <div class="order-header">
                <div class="order-id">Pedido #${order.id}</div>
                <div class="order-status ${statusClass}">${statusText}</div>
            </div>
            <div class="order-content">
                ${order.items.map(item => `
                    <div style="display: flex; align-items: center; margin-bottom: 0.5rem;">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 1rem;">
                        <div>
                            <div style="font-weight: 500;">${item.name}</div>
                            <div style="color: #e91e63;">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                        </div>
                    </div>
                `).join('')}
                <div style="text-align: right; margin-top: 1rem; font-size: 1.2rem; font-weight: bold; color: #e91e63;">
                    Total: R$ ${order.total.toFixed(2).replace('.', ',')}
                </div>
                <div style="text-align: right; margin-top: 0.5rem; color: #666;">
                    ${order.date} - ${order.payment}
                </div>
            </div>
        `;
        
        ordersContainer.appendChild(orderElement);
    });
}

function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        address: formData.get('address')
    };
    
    if (userData.password !== userData.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }
    
    localStorage.setItem('userData', JSON.stringify(userData));
    showNotification('Cadastro realizado! Redirecionando...');
    
    setTimeout(() => {
        window.location.href = 'verification.html';
    }, 2000);
}

function handleVerification(event) {
    event.preventDefault();
    
    const code = new FormData(event.target).get('code');
    
    if (code.length !== 6) {
        alert('O código deve ter 6 dígitos!');
        return;
    }
    
    showNotification('Conta verificada com sucesso!');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 2000);
}

function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    const savedUserData = JSON.parse(localStorage.getItem('userData'));
    
    if (savedUserData && savedUserData.email === loginData.email && savedUserData.password === loginData.password) {
        localStorage.setItem('isLoggedIn', 'true');
        showNotification('Login realizado com sucesso!');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } else {
        alert('E-mail ou senha incorretos!');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    loadCartItems();
    loadOrders();
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    const verificationForm = document.getElementById('verification-form');
    if (verificationForm) {
        verificationForm.addEventListener('submit', handleVerification);
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectPaymentMethod(this.dataset.method);
        });
    });
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;
document.head.appendChild(style); 