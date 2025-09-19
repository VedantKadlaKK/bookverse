// BookVerse - JavaScript Functionality

// Sample book data
const books = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "fiction",
        price: 299,
        image: "images/book1.jpg",
        description: "A classic American novel set in the Jazz Age"
    },
    {
        id: 2,
        title: "Murder on the Orient Express",
        author: "Agatha Christie",
        genre: "mystery",
        price: 349,
        image: "images/book2.jpg",
        description: "A thrilling murder mystery by the queen of crime"
    },
    {
        id: 3,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        genre: "romance",
        price: 279,
        image: "images/book3.jpg",
        description: "A timeless romance novel"
    },
    {
        id: 4,
        title: "Dune",
        author: "Frank Herbert",
        genre: "sci-fi",
        price: 399,
        image: "images/book4.jpg",
        description: "Epic science fiction saga"
    },
    {
        id: 5,
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "fantasy",
        price: 329,
        image: "images/book5.jpg",
        description: "A magical adventure in Middle-earth"
    },
    {
        id: 6,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        genre: "non-fiction",
        price: 449,
        image: "images/book6.jpg",
        description: "A brief history of humankind"
    },
    {
        id: 7,
        title: "The Silent Patient",
        author: "Alex Michaelides",
        genre: "mystery",
        price: 379,
        image: "images/book7.jpg",
        description: "A psychological thriller"
    },
    {
        id: 8,
        title: "Neuromancer",
        author: "William Gibson",
        genre: "sci-fi",
        price: 359,
        image: "images/book8.jpg",
        description: "Cyberpunk classic"
    }
];

// Application state
let cart = JSON.parse(localStorage.getItem('bookverse_cart')) || [];
let orders = JSON.parse(localStorage.getItem('bookverse_orders')) || [];
let filteredBooks = [...books];

// DOM elements
const booksGrid = document.getElementById('booksGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.querySelector('.cart-count');
const cartTotal = document.getElementById('cartTotal');
const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderBooks();
    updateCartUI();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', debounce(filterBooks, 300));
    
    // Genre filter
    genreFilter.addEventListener('change', filterBooks);
    
    // Order form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function generateOrderId() {
    return 'BV' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Book rendering and filtering
function renderBooks() {
    if (!booksGrid) return;
    
    booksGrid.innerHTML = '';
    
    if (filteredBooks.length === 0) {
        booksGrid.innerHTML = `
            <div class="no-books">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p>No books found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    filteredBooks.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.innerHTML = `
            <img src="${book.image}" alt="${book.title}" class="book-image" loading="lazy">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author">by ${book.author}</p>
            <span class="book-genre">${book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}</span>
            <p class="book-price">₹${book.price}</p>
            <button class="add-to-cart" onclick="addToCart(${book.id})">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
            <button class="pay-now" onclick="buyNow(${book.id})">
                <i class="fas fa-bolt"></i> Buy Now
            </button>
        `;
        booksGrid.appendChild(bookCard);
    });
}

function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;
    
    filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                            book.author.toLowerCase().includes(searchTerm);
        const matchesGenre = !selectedGenre || book.genre === selectedGenre;
        
        return matchesSearch && matchesGenre;
    });
    
    renderBooks();
}

// Cart functionality
function addToCart(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const existingItem = cart.find(item => item.id === bookId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...book, quantity: 1 });
    }
    
    updateCartUI();
    saveCart();
    showNotification(`${book.title} added to cart!`, 'success');
}

function removeFromCart(bookId) {
    const index = cart.findIndex(item => item.id === bookId);
    if (index > -1) {
        const book = cart[index];
        cart.splice(index, 1);
        updateCartUI();
        saveCart();
        showNotification(`${book.title} removed from cart!`, 'info');
    }
}

function updateQuantity(bookId, change) {
    const item = cart.find(item => item.id === bookId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(bookId);
    } else {
        updateCartUI();
        saveCart();
    }
}

function updateCartUI() {
    if (!cartItems || !cartCount || !cartTotal) return;
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        cartTotal.textContent = '0';
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total;
}

function toggleCart() {
    cartSidebar.classList.toggle('active');
}

function saveCart() {
    localStorage.setItem('bookverse_cart', JSON.stringify(cart));
}

function saveOrders() {
    localStorage.setItem('bookverse_orders', JSON.stringify(orders));
}

// Buy now functionality
function buyNow(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    // Create temporary cart with single item
    const tempCart = [{ ...book, quantity: 1 }];
    showCheckout(tempCart, true);
}

// Checkout process
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    showCheckout(cart, false);
}

function showCheckout(items, isBuyNow = false) {
    const modal = document.getElementById('orderModal');
    const orderSummary = document.getElementById('orderSummary');
    
    if (!modal || !orderSummary) return;
    
    let total = 0;
    let summaryHTML = '<h4>Order Summary</h4>';
    
    items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        summaryHTML += `
            <div class="order-item">
                <span>${item.title} x ${item.quantity}</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });
    
    summaryHTML += `
        <div class="order-item" style="border-top: 2px solid #333; font-weight: bold; margin-top: 1rem; padding-top: 1rem;">
            <span>Total</span>
            <span>₹${total}</span>
        </div>
    `;
    
    orderSummary.innerHTML = summaryHTML;
    
    // Store checkout data
    window.checkoutData = { items, total, isBuyNow };
    
    modal.classList.add('active');
}

function handleOrderSubmission(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const customerEmail = document.getElementById('customerEmail').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const customerAddress = document.getElementById('customerAddress').value;
    
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
        showNotification('Please fill all fields!', 'error');
        return;
    }
    
    const { items, total, isBuyNow } = window.checkoutData;
    
    const order = {
        id: generateOrderId(),
        items: [...items],
        total: total,
        customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress
        },
        date: new Date().toISOString(),
        status: 'pending'
    };
    
    orders.unshift(order);
    saveOrders();
    
    // Clear cart if not buy now
    if (!isBuyNow) {
        cart = [];
        updateCartUI();
        saveCart();
    }
    
    closeModal('orderModal');
    showReceipt(order);
    
    // Clear form
    document.getElementById('orderForm').reset();
}

function showReceipt(order) {
    const modal = document.getElementById('receiptModal');
    const receiptContent = document.getElementById('receiptContent');
    
    if (!modal || !receiptContent) return;
    
    let itemsHTML = '';
    order.items.forEach(item => {
        itemsHTML += `
            <div class="order-item">
                <span>${item.title} x ${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            </div>
        `;
    });
    
    // Create GPay payment link
    const paymentAmount = order.total;
    const paymentNote = `BookVerse Order ${order.id}`;
    const gpayLink = `upi://pay?pa=aryankadlak6@okicici&pn=BookVerse&am=${paymentAmount}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;
    
    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h2><i class="fas fa-book-open"></i> BookVerse</h2>
            <p>Order Receipt</p>
        </div>
        
        <div class="order-id">
            Order ID: ${order.id}
        </div>
        
        <div style="text-align: left; margin: 2rem 0;">
            <h4>Customer Details:</h4>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
            <p><strong>Address:</strong> ${order.customer.address}</p>
        </div>
        
        <div class="receipt-items">
            <h4>Items Ordered:</h4>
            ${itemsHTML}
        </div>
        
        <div class="receipt-total">
            Total Amount: ₹${order.total}
        </div>
        
        <div class="payment-info">
            <h4><i class="fas fa-credit-card"></i> Payment Options</h4>
            <p>Complete your payment using any of the following methods:</p>
            
            <a href="${gpayLink}" class="payment-btn" style="background: #4285f4; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 10px; display: inline-block; margin: 0.5rem;">
                <i class="fab fa-google-pay"></i> Pay with GPay
            </a>
            
            <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                <p><strong>UPI ID:</strong> bookverse@paytm</p>
                <p><strong>Amount:</strong> ₹${order.total}</p>
                <p><strong>Note:</strong> ${paymentNote}</p>
            </div>
            
            <p style="font-size: 0.9rem; color: #666;">
                You can also contact us via WhatsApp or email for alternative payment methods.
            </p>
        </div>
        
        <div class="tracking-info">
            <h4><i class="fas fa-truck"></i> Order Status</h4>
            <p><strong>Current Status:</strong> <span class="order-status status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></p>
            <p><strong>Order Date:</strong> ${formatDate(order.date)} at ${formatTime(order.date)}</p>
            <p>You will receive order updates via email and SMS.</p>
        </div>
        
        <div style="margin: 2rem 0; padding: 1rem; border: 1px dashed #ccc; border-radius: 10px;">
            <h4>Contact Information</h4>
            <p><i class="fas fa-phone"></i> +91 7998262006
            </p>
            <p><i class="fas fa-envelope"></i> info@bookverse.com</p>
            <p><i class="fab fa-whatsapp"></i> WhatsApp Support</p>
        </div>
        
        <button onclick="window.print()" class="submit-btn" style="margin: 1rem 0;">
            <i class="fas fa-print"></i> Print Receipt
        </button>
    `;
    
    modal.classList.add('active');
    
    showNotification('Order placed successfully!', 'success');
    
    // Simulate order status updates
    setTimeout(() => {
        updateOrderStatus(order.id, 'processing');
    }, 5000);
    
    setTimeout(() => {
        updateOrderStatus(order.id, 'shipped');
    }, 15000);
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveOrders();
        showNotification(`Order ${orderId} is now ${newStatus}!`, 'info');
    }
}

function showOrders() {
    const modal = document.getElementById('ordersModal');
    const ordersList = document.getElementById('ordersList');
    
    if (!modal || !ordersList) return;
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="fas fa-clipboard-list" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <p>No orders found</p>
                <p>Start shopping to see your orders here!</p>
            </div>
        `;
    } else {
        ordersList.innerHTML = '';
        
        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            
            let itemsText = order.items.map(item => `${item.title} (x${item.quantity})`).join(', ');
            if (itemsText.length > 100) {
                itemsText = itemsText.substring(0, 100) + '...';
            }
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <strong>Order #${order.id}</strong>
                    <span class="order-status status-${order.status}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
                <p><strong>Date:</strong> ${formatDate(order.date)}</p>
                <p><strong>Items:</strong> ${itemsText}</p>
                <p><strong>Total:</strong> ₹${order.total}</p>
                <p><strong>Status:</strong> ${getStatusDescription(order.status)}</p>
                <div style="margin-top: 1rem;">
                    <button onclick="trackOrder('${order.id}')" class="submit-btn" style="padding: 0.5rem 1rem; margin-right: 0.5rem;">
                        <i class="fas fa-truck"></i> Track Order
                    </button>
                    <button onclick="reorderItems('${order.id}')" class="submit-btn" style="padding: 0.5rem 1rem; background: var(--accent-color);">
                        <i class="fas fa-redo"></i> Reorder
                    </button>
                </div>
            `;
            
            ordersList.appendChild(orderCard);
        });
    }
    
    modal.classList.add('active');
}

function getStatusDescription(status) {
    const descriptions = {
        pending: 'Order received and being processed',
        processing: 'Order is being prepared for shipment',
        shipped: 'Order has been shipped and is on the way',
        delivered: 'Order has been successfully delivered'
    };
    return descriptions[status] || status;
}

function trackOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const trackingSteps = [
        { status: 'pending', label: 'Order Placed', icon: 'fas fa-check-circle' },
        { status: 'processing', label: 'Processing', icon: 'fas fa-cog' },
        { status: 'shipped', label: 'Shipped', icon: 'fas fa-truck' },
        { status: 'delivered', label: 'Delivered', icon: 'fas fa-home' }
    ];
    
    const currentIndex = trackingSteps.findIndex(step => step.status === order.status);
    
    let trackingHTML = `
        <div style="text-align: center; margin: 2rem 0;">
            <h3>Tracking Order #${order.id}</h3>
            <p>Order Date: ${formatDate(order.date)}</p>
        </div>
        
        <div class="tracking-timeline" style="margin: 2rem 0;">
    `;
    
    trackingSteps.forEach((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        trackingHTML += `
            <div class="tracking-step" style="display: flex; align-items: center; margin: 1rem 0; padding: 1rem; background: ${isCompleted ? '#e8f5e8' : '#f8f9fa'}; border-radius: 10px; ${isCurrent ? 'border-left: 4px solid var(--secondary-color);' : ''}">
                <i class="${step.icon}" style="font-size: 1.5rem; color: ${isCompleted ? '#28a745' : '#ccc'}; margin-right: 1rem;"></i>
                <div>
                    <strong>${step.label}</strong>
                    ${isCurrent ? '<p style="color: var(--secondary-color); margin: 0;">Current Status</p>' : ''}
                </div>
            </div>
        `;
    });
    
    trackingHTML += `
        </div>
        
        <div style="text-align: center; margin: 2rem 0; padding: 1rem; background: var(--light-gray); border-radius: 10px;">
            <h4>Estimated Delivery</h4>
            <p>${getEstimatedDelivery(order.status)}</p>
        </div>
        
        <div style="text-align: center; margin: 1rem 0;">
            <p>For any queries, contact our support:</p>
            <a href="https://wa.me/917998262006" style="color: var(--secondary-color); text-decoration: none;">
                <i class="fab fa-whatsapp"></i> WhatsApp Support
            </a>
        </div>
    `;
    
    showCustomModal('Order Tracking', trackingHTML);
}

function getEstimatedDelivery(status) {
    const now = new Date();
    let deliveryDate = new Date(now);
    
    switch (status) {
        case 'pending':
            deliveryDate.setDate(now.getDate() + 5);
            break;
        case 'processing':
            deliveryDate.setDate(now.getDate() + 3);
            break;
        case 'shipped':
            deliveryDate.setDate(now.getDate() + 2);
            break;
        case 'delivered':
            return 'Order has been delivered';
        default:
            deliveryDate.setDate(now.getDate() + 5);
    }
    
    return formatDate(deliveryDate);
}

function reorderItems(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Add all items from the order to cart
    order.items.forEach(item => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push({ ...item });
        }
    });
    
    updateCartUI();
    saveCart();
    closeModal('ordersModal');
    toggleCart();
    
    showNotification('Items added to cart for reorder!', 'success');
}

function showCustomModal(title, content) {
    // Create a temporary modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Navigation functions
function toggleMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Close modals when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (!cartSidebar.contains(e.target) && !e.target.closest('.cart-btn')) {
        cartSidebar.classList.remove('active');
    }
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.closest('.notification').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 4000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
    `;
    
    const closeBtn = notification.querySelector('button');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle',
        warning: 'exclamation-triangle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    return colors[type] || '#17a2b8';
}

// Add notification animations to CSS
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Search suggestions (optional enhancement)
function createSearchSuggestions() {
    const searchContainer = document.querySelector('.search-box');
    if (!searchContainer) return;
    
    const suggestionsList = document.createElement('div');
    suggestionsList.className = 'search-suggestions';
    suggestionsList.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    `;
    
    searchContainer.appendChild(suggestionsList);
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length < 2) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        const suggestions = books.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        ).slice(0, 5);
        
        if (suggestions.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }
        
        suggestionsList.innerHTML = suggestions.map(book => `
            <div class="suggestion-item" style="padding: 0.8rem; cursor: pointer; border-bottom: 1px solid #eee;" 
                 onclick="selectSuggestion('${book.title}')">
                <strong>${book.title}</strong>
                <br><small>by ${book.author}</small>
            </div>
        `).join('');
        
        suggestionsList.style.display = 'block';
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });
}

function selectSuggestion(title) {
    searchInput.value = title;
    filterBooks();
    document.querySelector('.search-suggestions').style.display = 'none';
}

// Initialize search suggestions
createSearchSuggestions();

// Lazy loading for book images (performance optimization)
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Analytics and tracking (placeholder)
function trackEvent(eventName, eventData) {
    // Placeholder for analytics tracking
    console.log(`Event: ${eventName}`, eventData);
}

// Track important events
document.addEventListener('DOMContentLoaded', () => {
    trackEvent('page_view', { page: 'home' });
});

// Export functions for global use
window.bookverse = {
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCart,
    buyNow,
    checkout,
    showOrders,
    trackOrder,
    closeModal,
    toggleMenu
};

// Performance monitoring
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration}ms`);
        }
    }
});

observer.observe({ entryTypes: ['measure'] });

// Add error handling for the entire application
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('Something went wrong. Please try again.', 'error');
});

// Initialize application features
document.addEventListener('DOMContentLoaded', () => {
    // Add any additional initialization here
    console.log('BookVerse application loaded successfully!');
});