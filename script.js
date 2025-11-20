// DOM elements
const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');
const totalTasksSpan = document.getElementById('total-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// App state
let currentFilter = 'all';
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let editMode = { active: false, id: null };

// Initialize app
init();

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// Core functions
function init() {
    renderTodos();
    updateStats();
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    todos.push({
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
    });

    saveTodos();
    todoInput.value = '';
    renderTodos();
    updateStats();
}

function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );

    saveTodos();
    renderTodos();
    updateStats();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateStats();
}

function editTodo(id) {
    editMode = { active: true, id };
    renderTodos();
}

function saveEdit(id, newText) {
    if (!newText.trim()) {
        cancelEdit();
        return;
    }

    todos = todos.map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
    );

    editMode = { active: false, id: null };
    saveTodos();
    renderTodos();
}

function cancelEdit() {
    editMode = { active: false, id: null };
    renderTodos();
}

function renderTodos() {
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
    } else {
        emptyState.classList.remove('show');
    }

    todoList.innerHTML = '';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        // Check if we're in edit mode for this todo
        if (editMode.active && editMode.id === todo.id) {
            li.innerHTML = `
                        <input type="text" class="edit-input" value="${todo.text}">
                        <button class="save-btn">Save</button>
                        <button class="cancel-btn">Cancel</button>
                    `;

            const input = li.querySelector('.edit-input');
            const saveBtn = li.querySelector('.save-btn');
            const cancelBtn = li.querySelector('.cancel-btn');

            // Focus and select the text in the input
            input.focus();
            input.select();

            // Set up event listeners for save and cancel
            saveBtn.addEventListener('click', () => saveEdit(todo.id, input.value));
            cancelBtn.addEventListener('click', cancelEdit);

            // Allow saving with Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit(todo.id, input.value);
                }
            });
        } else {
            li.innerHTML = `
                        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"></div>
                        <span class="todo-text">${todo.text}</span>
                        <div class="todo-actions">
                            <button class="edit-btn">Edit</button>
                            <button class="delete-btn">Delete</button>
                        </div>
                    `;

            const checkbox = li.querySelector('.todo-checkbox');
            const editBtn = li.querySelector('.edit-btn');
            const deleteBtn = li.querySelector('.delete-btn');

            // Set up event listeners
            checkbox.addEventListener('click', () => toggleTodo(todo.id));
            editBtn.addEventListener('click', () => editTodo(todo.id));
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        }

        todoList.appendChild(li);
    });
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}% Complete`;
    totalTasksSpan.textContent = `Total: ${total}`;
    completedTasksSpan.textContent = `Completed: ${completed}`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}
