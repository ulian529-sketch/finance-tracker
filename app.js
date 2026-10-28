// Categories configuration
const EXPENSE_CATEGORIES = [
    { name: 'Еда', icon: '🍔' },
    { name: 'Транспорт', icon: '🚗' },
    { name: 'Дом', icon: '🏠' },
    { name: 'Здоровье', icon: '💊' },
    { name: 'Развлечения', icon: '🎮' },
    { name: 'Покупки', icon: '🛍️' },
    { name: 'Связь', icon: '📱' },
    { name: 'Образование', icon: '📚' },
    { name: 'Другое', icon: '💸' }
];

const INCOME_CATEGORIES = [
    { name: 'Зарплата', icon: '💰' },
    { name: 'Подработка', icon: '💼' },
    { name: 'Подарок', icon: '🎁' },
    { name: 'Продажа', icon: '💵' },
    { name: 'Другое', icon: '💳' }
];

// App state
let state = {
    balance: 0,
    transactions: [],
    currentType: 'expense',
    selectedCategory: null,
    editingTransaction: null
};

// DOM elements
const elements = {
    balance: document.getElementById('balance'),
    totalIncome: document.getElementById('totalIncome'),
    totalExpense: document.getElementById('totalExpense'),
    amountInput: document.getElementById('amountInput'),
    addBtn: document.getElementById('addBtn'),
    categoriesContainer: document.getElementById('categories'),
    transactionsList: document.getElementById('transactionsList'),
    recentTransactionsList: document.getElementById('recentTransactionsList'),
    avgPerDay: document.getElementById('avgPerDay'),
    forecast: document.getElementById('forecast'),
    comparison: document.getElementById('comparison'),
    topCategories: document.getElementById('topCategories'),
    topExpenses: document.getElementById('topExpenses'),
    editModal: document.getElementById('editModal'),
    addModal: document.getElementById('addModal'),
    editAmount: document.getElementById('editAmount'),
    editCategory: document.getElementById('editCategory'),
    deleteBtn: document.getElementById('deleteBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    saveBtn: document.getElementById('saveBtn'),
    addCancelBtn: document.getElementById('addCancelBtn'),
    navAddBtn: document.getElementById('navAddBtn'),
    navMoreBtn: document.getElementById('navMoreBtn')
};

// Initialize app
function init() {
    loadData();
    setupEventListeners();
    renderCategories();
    render();

    // Show home tab by default
    switchTab('tabHome');

    // Set home button as active
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.tab === 'tabHome') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('financeData');
    if (saved) {
        state = JSON.parse(saved);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('financeData', JSON.stringify(state));
}

// Setup event listeners
function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            if (targetTab) {
                switchTab(targetTab);

                // Update active nav button
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // Add button in navigation
    elements.navAddBtn.addEventListener('click', openAddModal);

    // More button
    elements.navMoreBtn.addEventListener('click', () => {
        alert('Дополнительные настройки пока не доступны');
    });

    // Type toggle
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentType = btn.dataset.type;
            state.selectedCategory = null;
            renderCategories();
        });
    });

    // Add button
    elements.addBtn.addEventListener('click', addTransaction);

    // Add cancel button
    elements.addCancelBtn.addEventListener('click', closeAddModal);

    // Amount input - enter key
    elements.amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTransaction();
        }
    });

    // Modal buttons
    elements.cancelBtn.addEventListener('click', closeEditModal);
    elements.deleteBtn.addEventListener('click', deleteTransaction);
    elements.saveBtn.addEventListener('click', saveTransaction);

    // Click outside modal to close
    elements.editModal.addEventListener('click', (e) => {
        if (e.target === elements.editModal) {
            closeEditModal();
        }
    });

    elements.addModal.addEventListener('click', (e) => {
        if (e.target === elements.addModal) {
            closeAddModal();
        }
    });
}

// Switch tabs
function switchTab(tabId) {
    console.log('Switching to tab:', tabId);
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        console.log('Removed active from:', tab.id);
    });
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        console.log('Added active to:', tabId);
    } else {
        console.error('Tab not found:', tabId);
    }
}

// Open add modal
function openAddModal() {
    elements.addModal.classList.add('active');
    renderCategories();
}

// Close add modal
function closeAddModal() {
    elements.addModal.classList.remove('active');
    elements.amountInput.value = '';
    state.selectedCategory = null;
}

// Close edit modal
function closeEditModal() {
    elements.editModal.classList.remove('active');
    state.editingTransaction = null;
}

// Render categories
function renderCategories() {
    const categories = state.currentType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    elements.categoriesContainer.innerHTML = categories.map(cat => `
        <div class="category-btn ${state.selectedCategory === cat.name ? 'selected' : ''}"
             onclick="selectCategory('${cat.name}')">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-name">${cat.name}</div>
        </div>
    `).join('');
}

// Select category
function selectCategory(name) {
    state.selectedCategory = name;
    renderCategories();
}

// Add transaction
function addTransaction() {
    const amount = parseFloat(elements.amountInput.value);

    if (!amount || amount <= 0) {
        alert('Введите сумму');
        return;
    }

    if (!state.selectedCategory) {
        alert('Выберите категорию');
        return;
    }

    const transaction = {
        id: Date.now(),
        amount: amount,
        type: state.currentType,
        category: state.selectedCategory,
        date: new Date().toISOString(),
        icon: getCategoryIcon(state.selectedCategory, state.currentType)
    };

    state.transactions.unshift(transaction);

    if (state.currentType === 'expense') {
        state.balance -= amount;
    } else {
        state.balance += amount;
    }

    // Reset input
    elements.amountInput.value = '';
    state.selectedCategory = null;

    saveData();
    render();
    closeAddModal();
}

// Get category icon
function getCategoryIcon(categoryName, type) {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const cat = categories.find(c => c.name === categoryName);
    return cat ? cat.icon : '💸';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.abs(amount)) + ' ₽';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.floor((today - txDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// Render all
function render() {
    renderBalance();
    renderTransactions();
    renderRecentTransactions();
    renderAnalytics();
}

// Render balance
function renderBalance() {
    elements.balance.textContent = formatCurrency(state.balance);

    const totalIncome = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    elements.totalIncome.textContent = formatCurrency(totalIncome);
    elements.totalExpense.textContent = formatCurrency(totalExpense);
}

// Render transactions
function renderTransactions() {
    if (state.transactions.length === 0) {
        elements.transactionsList.innerHTML = '<div class="empty-state">Пока нет транзакций</div>';
        return;
    }

    elements.transactionsList.innerHTML = state.transactions.map(tx => `
        <div class="transaction-item" onclick="openEditModal(${tx.id})">
            <div class="transaction-info">
                <div class="transaction-icon">${tx.icon}</div>
                <div class="transaction-details">
                    <div class="transaction-category">${tx.category}</div>
                    <div class="transaction-date">${formatDate(tx.date)}</div>
                </div>
            </div>
            <div class="transaction-amount ${tx.type}">
                ${tx.type === 'income' ? '+' : '−'}${formatCurrency(tx.amount)}
            </div>
        </div>
    `).join('');
}

// Render recent transactions (last 5)
function renderRecentTransactions() {
    const recent = state.transactions.slice(0, 5);

    if (recent.length === 0) {
        elements.recentTransactionsList.innerHTML = '<div class="empty-state">Пока нет транзакций</div>';
        return;
    }

    elements.recentTransactionsList.innerHTML = recent.map(tx => `
        <div class="transaction-item" onclick="openEditModal(${tx.id})">
            <div class="transaction-info">
                <div class="transaction-icon">${tx.icon}</div>
                <div class="transaction-details">
                    <div class="transaction-category">${tx.category}</div>
                    <div class="transaction-date">${formatDate(tx.date)}</div>
                </div>
            </div>
            <div class="transaction-amount ${tx.type}">
                ${tx.type === 'income' ? '+' : '−'}${formatCurrency(tx.amount)}
            </div>
        </div>
    `).join('');
}

// Render analytics
function renderAnalytics() {
    // Get current month transactions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTx = state.transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const currentMonthExpenses = currentMonthTx
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Average per day
    const daysInMonth = now.getDate();
    const avgPerDay = daysInMonth > 0 ? currentMonthExpenses / daysInMonth : 0;
    elements.avgPerDay.textContent = formatCurrency(avgPerDay);

    // Forecast
    const daysInMonthTotal = new Date(currentYear, currentMonth + 1, 0).getDate();
    const forecast = avgPerDay * daysInMonthTotal;
    elements.forecast.textContent = formatCurrency(forecast);

    // Previous month comparison
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevMonthTx = state.transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === prevMonth && txDate.getFullYear() === prevYear;
    });

    renderComparison(currentMonthTx, prevMonthTx);
    renderTopCategories(currentMonthTx);
    renderTopExpenses(currentMonthTx);
}

// Render comparison
function renderComparison(currentTx, prevTx) {
    const categoryGroups = {};

    currentTx.filter(t => t.type === 'expense').forEach(tx => {
        if (!categoryGroups[tx.category]) {
            categoryGroups[tx.category] = { current: 0, prev: 0 };
        }
        categoryGroups[tx.category].current += tx.amount;
    });

    prevTx.filter(t => t.type === 'expense').forEach(tx => {
        if (!categoryGroups[tx.category]) {
            categoryGroups[tx.category] = { current: 0, prev: 0 };
        }
        categoryGroups[tx.category].prev += tx.amount;
    });

    const comparisons = Object.entries(categoryGroups)
        .map(([category, data]) => {
            if (data.prev === 0) return null;
            const diff = ((data.current - data.prev) / data.prev) * 100;
            return { category, diff };
        })
        .filter(item => item !== null)
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
        .slice(0, 3);

    if (comparisons.length === 0) {
        elements.comparison.innerHTML = '<div class="empty-state">Недостаточно данных для сравнения</div>';
        return;
    }

    elements.comparison.innerHTML = comparisons.map(item => `
        <div class="comparison-item">
            <span class="comparison-label">${item.category}</span>
            <span class="comparison-value ${item.diff > 0 ? 'negative' : 'positive'}">
                ${item.diff > 0 ? '+' : ''}${item.diff.toFixed(0)}%
            </span>
        </div>
    `).join('');
}

// Render top categories
function renderTopCategories(transactions) {
    const categoryTotals = {};

    transactions.filter(t => t.type === 'expense').forEach(tx => {
        if (!categoryTotals[tx.category]) {
            categoryTotals[tx.category] = { amount: 0, count: 0, icon: tx.icon };
        }
        categoryTotals[tx.category].amount += tx.amount;
        categoryTotals[tx.category].count++;
    });

    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1].amount - a[1].amount)
        .slice(0, 5);

    if (topCategories.length === 0) {
        elements.topCategories.innerHTML = '<div class="empty-state">Нет данных</div>';
        return;
    }

    elements.topCategories.innerHTML = topCategories.map(([name, data]) => `
        <div class="top-item">
            <div class="top-item-info">
                <div class="top-item-icon">${data.icon}</div>
                <div class="top-item-details">
                    <div class="top-item-name">${name}</div>
                    <div class="top-item-count">${data.count} ${declension(data.count, ['транзакция', 'транзакции', 'транзакций'])}</div>
                </div>
            </div>
            <div class="top-item-amount">${formatCurrency(data.amount)}</div>
        </div>
    `).join('');
}

// Render top expenses
function renderTopExpenses(transactions) {
    const topExpenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    if (topExpenses.length === 0) {
        elements.topExpenses.innerHTML = '<div class="empty-state">Нет данных</div>';
        return;
    }

    elements.topExpenses.innerHTML = topExpenses.map(tx => `
        <div class="top-item">
            <div class="top-item-info">
                <div class="top-item-icon">${tx.icon}</div>
                <div class="top-item-details">
                    <div class="top-item-name">${tx.category}</div>
                    <div class="top-item-count">${formatDate(tx.date)}</div>
                </div>
            </div>
            <div class="top-item-amount">${formatCurrency(tx.amount)}</div>
        </div>
    `).join('');
}

// Declension helper
function declension(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
}

// Open edit modal
function openEditModal(id) {
    state.editingTransaction = state.transactions.find(t => t.id === id);
    if (!state.editingTransaction) return;

    elements.editAmount.value = state.editingTransaction.amount;
    elements.editCategory.value = state.editingTransaction.category;
    elements.editModal.classList.add('active');
}

// Close modals (legacy function for compatibility)
function closeModal() {
    closeEditModal();
}

// Delete transaction
function deleteTransaction() {
    if (!state.editingTransaction) return;

    const tx = state.editingTransaction;

    if (tx.type === 'expense') {
        state.balance += tx.amount;
    } else {
        state.balance -= tx.amount;
    }

    state.transactions = state.transactions.filter(t => t.id !== tx.id);

    saveData();
    render();
    closeEditModal();
}

// Save transaction
function saveTransaction() {
    if (!state.editingTransaction) return;

    const newAmount = parseFloat(elements.editAmount.value);
    const newCategory = elements.editCategory.value.trim();

    if (!newAmount || newAmount <= 0) {
        alert('Введите корректную сумму');
        return;
    }

    if (!newCategory) {
        alert('Введите категорию');
        return;
    }

    const tx = state.editingTransaction;
    const oldAmount = tx.amount;

    // Revert old transaction from balance
    if (tx.type === 'expense') {
        state.balance += oldAmount;
    } else {
        state.balance -= oldAmount;
    }

    // Apply new transaction
    tx.amount = newAmount;
    tx.category = newCategory;
    tx.icon = getCategoryIcon(newCategory, tx.type) || tx.icon;

    if (tx.type === 'expense') {
        state.balance -= newAmount;
    } else {
        state.balance += newAmount;
    }

    saveData();
    render();
    closeEditModal();
}

// Initialize on load
init();
