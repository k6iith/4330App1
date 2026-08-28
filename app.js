// load assignments from localStorage
let assignments = JSON.parse(localStorage.getItem('assignments')) || [];
let currentFilter = 'all';

const form = document.getElementById('assignment-form');
const listEl = document.getElementById('assignments-list');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

// save to localStorage
function saveAssignments() {
    localStorage.setItem('assignments', JSON.stringify(assignments));
}

// generate a simple id
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// add new assignment
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const assignment = {
        id: generateId(),
        subject: document.getElementById('subject').value.trim(),
        description: document.getElementById('description').value.trim(),
        dueDate: document.getElementById('due-date').value,
        priority: document.getElementById('priority').value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    assignments.push(assignment);
    saveAssignments();
    renderAssignments();
    form.reset();

    // reset priority to medium
    document.getElementById('priority').value = 'medium';
});

// toggle assignment completion
function toggleComplete(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        assignment.completed = !assignment.completed;
        saveAssignments();
        renderAssignments();
    }
}

// delete assignment
function deleteAssignment(id) {
    assignments = assignments.filter(a => a.id !== id);
    saveAssignments();
    renderAssignments();
}

// format date nicely
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// check if assignment is overdue
function isOverdue(dateStr, completed) {
    if (completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr + 'T00:00:00');
    return due < today;
}

// render all assignments
function renderAssignments() {
    // filter based on current filter
    let filtered = assignments;
    if (currentFilter === 'pending') {
        filtered = assignments.filter(a => !a.completed);
    } else if (currentFilter === 'completed') {
        filtered = assignments.filter(a => a.completed);
    }

    // sort: incomplete first, then by due date
    filtered.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    listEl.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
    }

    filtered.forEach(assignment => {
        const card = document.createElement('div');
        card.className = 'assignment-card' + (assignment.completed ? ' completed' : '');

        const overdue = isOverdue(assignment.dueDate, assignment.completed);
        const dueDateText = overdue ? `Overdue - ${formatDate(assignment.dueDate)}` : formatDate(assignment.dueDate);

        card.innerHTML = `
            <div class="checkbox ${assignment.completed ? 'checked' : ''}" onclick="toggleComplete('${assignment.id}')"></div>
            <div class="assignment-info">
                <h3>${assignment.description}</h3>
                <div class="assignment-meta">
                    <span class="subject-tag">${assignment.subject}</span>
                    <span style="${overdue ? 'color: #e74c3c; font-weight: 600;' : ''}">${dueDateText}</span>
                </div>
            </div>
            <span class="priority-badge ${assignment.priority}">${assignment.priority}</span>
            <button class="delete-btn" onclick="deleteAssignment('${assignment.id}')" title="Delete">✕</button>
        `;

        listEl.appendChild(card);
    });
}

// filter button clicks
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderAssignments();
    });
});

// set default date to today
document.getElementById('due-date').valueAsDate = new Date();

// initial render
renderAssignments();
