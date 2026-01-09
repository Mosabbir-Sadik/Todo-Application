let todos = [];
let currentFilter = 'all';
let editingId = null;
const STORAGE_KEY = 'todo-app-v1';
let lastAllCompleted = false;

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

// Load todos from storage on page load
function init() {
    loadTodos();
    renderAndUpdate();
}

function loadTodos() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                todos = parsed;
            }
        }
    } catch (error) {
        console.warn('Unable to load todos from storage', error);
    }
}

function persistTodos() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
        console.warn('Unable to save todos to storage', error);
    }
}

function renderAndUpdate() {
    renderTodos();
    const stats = updateStats();
    handleAllComplete(stats);
}

// Add or update todo
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('Please enter a todo!');
        return;
    }

    if (editingId !== null) {
        const todo = todos.find(t => t.id === editingId);
        if (todo) {
            todo.text = text;
        }
        editingId = null;
        addBtn.textContent = 'Add';
    } else {
        const newTodo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(newTodo);
    }

    todoInput.value = '';
    persistTodos();
    renderAndUpdate();
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    persistTodos();
    renderAndUpdate();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        persistTodos();
        renderAndUpdate();
    }
}

// Edit todo
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todoInput.value = todo.text;
        todoInput.focus();
        editingId = id;
        addBtn.textContent = 'Update';
    }
}

// Filter todos
function filterTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// Render todos
function renderTodos() {
    const filteredTodos = filterTodos();

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No todos to display</p>
            </div>
        `;
        return;
    }

    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="edit-btn" onclick="editTodo(${todo.id})">Edit</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

// Update statistics
function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;

    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    clearCompletedBtn.disabled = completed === 0;

    return { total, active, completed };
}

function handleAllComplete(stats) {
    const allDone = stats.total > 0 && stats.active === 0;
    if (allDone && !lastAllCompleted) {
        playChime();
        showCompletionToast();
    }
    lastAllCompleted = allDone;
}

function playChime() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
    } catch (error) {
        console.warn('Chime playback failed', error);
    }
}

function showCompletionToast() {
    const existing = document.querySelector('.completion-toast');
    if (existing) {
        existing.remove();
    }
    const toast = document.createElement('div');
    toast.className = 'completion-toast';
    toast.textContent = 'সব কাজ শেষ! 🎉 Great job!';
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
    }, 1800);
    setTimeout(() => {
        toast.remove();
    }, 2600);
}

// Clear completed todos
function clearCompleted() {
    if (confirm('Are you sure you want to delete all completed todos?')) {
        todos = todos.filter(todo => !todo.completed);
        persistTodos();
        renderAndUpdate();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderAndUpdate();
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// Initialize app
init();
