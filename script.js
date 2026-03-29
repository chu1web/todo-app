/**
 * Premium To-Do List Logic
 * Author: Antigravity AI
 * Description: Handles task CRUD operations and LocalStorage persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    
    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const saveEditBtn = document.getElementById('save-edit');
    const cancelEditBtn = document.getElementById('cancel-edit');

    // --- Application State ---
    let tasks = JSON.parse(localStorage.getItem('premium_todo_tasks')) || [];
    let currentEditId = null;

    // --- Core Functions ---

    /**
     * Save current tasks to LocalStorage
     */
    function saveTasks() {
        localStorage.setItem('premium_todo_tasks', JSON.stringify(tasks));
    }

    /**
     * Render the task list to the DOM
     */
    function renderTasks() {
        todoList.innerHTML = '';
        
        tasks.sort((a, b) => b.id - a.id); // Show newest first

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHtml(task.text)}</span>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" title="編輯">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="action-btn delete-btn" title="刪除">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;

            todoList.appendChild(li);
        });

        // Re-initialize icons from Lucide CDN
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Add a new task
     */
    function addTask() {
        const text = todoInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        saveTasks();
        todoInput.value = '';
        renderTasks();
    }

    /**
     * Delete a task with animation
     */
    function deleteTask(id) {
        const item = document.querySelector(`.todo-item[data-id="${id}"]`);
        item.classList.add('removing');
        
        // Wait for animation to finish
        item.addEventListener('animationend', () => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        });
    }

    /**
     * Toggle task completed status
     */
    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    /**
     * Open Edit Modal
     */
    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            currentEditId = id;
            editInput.value = task.text;
            editModal.style.display = 'flex';
            editInput.focus();
        }
    }

    /**
     * Save Edited Task
     */
    function saveEdit() {
        const newText = editInput.value.trim();
        if (newText !== '' && currentEditId !== null) {
            tasks = tasks.map(task => {
                if (task.id === currentEditId) {
                    return { ...task, text: newText };
                }
                return task;
            });
            saveTasks();
            renderTasks();
            closeEditModal();
        }
    }

    /**
     * Close Edit Modal
     */
    function closeEditModal() {
        editModal.style.display = 'none';
        currentEditId = null;
    }

    /**
     * Utility: Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Event Listeners ---

    // Add Button Click
    addBtn.addEventListener('click', addTask);

    // Enter Key for Input
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // List Item Interactions (Event Delegation)
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const item = target.closest('.todo-item');
        if (!item) return;
        const id = parseInt(item.dataset.id);

        // Checkbox Click
        if (target.classList.contains('todo-checkbox')) {
            toggleTask(id);
        }
        
        // Delete Button Click
        if (target.closest('.delete-btn')) {
            deleteTask(id);
        }

        // Edit Button Click
        if (target.closest('.edit-btn')) {
            openEditModal(id);
        }
    });

    // Modal Actions
    saveEditBtn.addEventListener('click', saveEdit);
    cancelEditBtn.addEventListener('click', closeEditModal);
    
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeEditModal();
    });

    // --- Initial Render ---
    renderTasks();
});
