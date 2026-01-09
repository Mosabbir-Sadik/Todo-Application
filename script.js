
        let todos = [];
        let currentFilter = 'all';
        let editingId = null;

        const todoInput = document.getElementById('todoInput');
        const addBtn = document.getElementById('addBtn');
        const todoList = document.getElementById('todoList');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const clearCompletedBtn = document.getElementById('clearCompleted');
        const totalCount = document.getElementById('totalCount');
        const activeCount = document.getElementById('activeCount');
        const completedCount = document.getElementById('completedCount');

        // Load todos from memory on page load
        function init() {
            renderTodos();
            updateStats();
        }

        // Add or update todo
        function addTodo() {
            const text = todoInput.value.trim();
            
            if (text === '') {
                alert('Please enter a todo!');
                return;
            }

            if (editingId !== null) {
                // Update existing todo
                const todo = todos.find(t => t.id === editingId);
                if (todo) {
                    todo.text = text;
                }
                editingId = null;
                addBtn.textContent = 'Add';
            } else {
                // Add new todo
                const newTodo = {
                    id: Date.now(),
                    text: text,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                todos.push(newTodo);
            }

            todoInput.value = '';
            renderTodos();
            updateStats();
        }

        // Delete todo
        function deleteTodo(id) {
            todos = todos.filter(todo => todo.id !== id);
            renderTodos();
            updateStats();
        }

        // Toggle todo completion
        function toggleTodo(id) {
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                renderTodos();
                updateStats();
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
            switch(currentFilter) {
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
        }

        // Clear completed todos
        function clearCompleted() {
            if (confirm('Are you sure you want to delete all completed todos?')) {
                todos = todos.filter(todo => !todo.completed);
                renderTodos();
                updateStats();
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
                renderTodos();
            });
        });

        clearCompletedBtn.addEventListener('click', clearCompleted);

        // Initialize app
        init();
    