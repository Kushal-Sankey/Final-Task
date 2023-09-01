const parentTasks = [];
const taskTableBody = document.getElementById('taskTableBody');
const editModal = document.getElementById('editModal');
const subtaskModal = document.getElementById('subtaskModal');
let editedTaskId = '';
let currentParentTaskId = '';
let lastSubtaskId = 0;


function addParentTask() {
    const parentId = document.getElementById('parentTaskId').value;
    const parentName = document.getElementById('parentTaskName').value;
    const parentStartDateInput = document.getElementById('parentStartDate');
    const parentEndDateInput = document.getElementById('parentEndDate');
    const parentStartDate = new Date(parentStartDateInput.value);
    const parentEndDate = new Date(parentEndDateInput.value);
    const parentStatus = document.getElementById('parentStatus').value;


    if (!parentId || !parentName || !parentStartDate || !parentEndDate || !parentStatus) {
        alert('All fields are mandatory');
        return;
    }

    if (isNaN(parentStartDate.getTime()) || isNaN(parentEndDate.getTime())) {
        alert('Please enter Date & Time');
        return;
    }

    if (findTaskById(parentId)) {
        alert('Parent Task ID must be unique');
        return;
    }

    if (parentStartDate > parentEndDate) {
        alert('End Date cannot be before Start Date');
        return;
    }


    if (parentId && parentName && parentStartDate && parentEndDate && parentStatus) {
        const newParentTask = {
            id: parentId,
            name: parentName,
            startDate: parentStartDate,
            endDate: parentEndDate,
            status: parentStatus,
            subTasks: [] // Initialize an empty array for sub-tasks
        };

        parentTasks.push(newParentTask);
        updateUI();
        clearFormFields();
    }
}

function addSubTask() {
    const subTaskName = document.getElementById('subTaskName').value;
    const subStartDateInput = document.getElementById('subStartDate');
    const subEndDateInput = document.getElementById('subEndDate');
    const subStatus = document.getElementById('subStatus').value;

    const subStartDate = new Date(subStartDateInput.value);
    const subEndDate = new Date(subEndDateInput.value);

    if (!currentParentTaskId || !subTaskName || isNaN(subStartDate.getTime()) || isNaN(subEndDate.getTime()) || !subStatus) {
        alert('All fields are mandatory, and date/time must be valid');
        return;
    }

    const parentTask = findTaskById(currentParentTaskId);

    if (!parentTask) {
        alert('Invalid Parent Task ID');
        return;
    }

    if (subStartDate > subEndDate) {
        alert('End Date cannot be before Start Date');
        return;
    }

    if (currentParentTaskId && subTaskName && subStartDate && subEndDate && subStatus) {
        const parentTask = findTaskById(currentParentTaskId);

        if (parentTask) {
            const newSubTask = {
                id: generateSubTaskId(),
                name: subTaskName,
                startDate: subStartDate,
                endDate: subEndDate,
                status: subStatus
            };

            parentTask.subTasks.push(newSubTask);
            updateUI();
            closeSubtaskModal();
            clearFormFields(); // Close the subtask modal
        }
    }
}

function generateSubTaskId() {
    lastSubtaskId++;
    return `subtask-${lastSubtaskId}`;
    
}

function updateUI() {
    taskTableBody.innerHTML = '';

    parentTasks.forEach(parentTask => {
        const parentRow = createTaskRow(parentTask, false); // Parent task
        taskTableBody.appendChild(parentRow);

        if (parentTask.subTasks) {
            parentTask.subTasks.forEach(subTask => {
                const subRow = createTaskRow(subTask, true); // Subtask
                taskTableBody.appendChild(subRow);
            });
        }
    });
}

function formatDateAndTime(date) {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function createTaskRow(task, isSubtask = false) {
    const row = document.createElement('tr');
    const statusClass = getStatusClass(task.status);
    row.classList.add(statusClass);

    const formattedStartDate = formatDateAndTime(task.startDate);
    const formattedEndDate = formatDateAndTime(task.endDate);

    row.innerHTML = `
        <td>${task.id}</td>
        <td>${task.name}</td>
        <td>${formattedStartDate}</td>
        <td>${formattedEndDate}</td>
        <td>${task.status}</td>
        <td><button onclick="editTask('${task.id}', ${isSubtask})">Edit</button></td>
        <td><button onclick="deleteTask('${task.id}')">Delete</button></td>
        <td><button onclick="openSubtaskModal('${task.id}')">Add Subtask</button></td>
    `;
    return row;

}

function getStatusClass(status) {
    switch (status) {
        case 'Due-Passed':
            return 'bg-due-passed';
        case 'Completed':
            return 'bg-completed';
        case 'Canceled':
            return 'bg-canceled';
        case 'In-Progress':
            return 'bg-in-progress';
        default:
            return '';
    }
}

function findSubtaskById(subtaskId, parentTask) {
    return parentTask.subTasks.find(subTask => subTask.id === subtaskId);
}


function editTask(taskId, isSubtask) {
    editedTaskId = taskId;
    const taskToEdit = findTaskById(taskId);

    if (taskToEdit) {
        const editTaskNameInput = document.getElementById('editTaskName');
        const editTaskStartDateInput = document.getElementById('editTaskStartDate');
        const editTaskEndDateInput = document.getElementById('editTaskEndDate');
        const editTaskStatusInput = document.getElementById('editTaskStatus');

        if (isSubtask) {
            const subtaskToEdit = findSubtaskById(taskId, taskToEdit);
            if (subtaskToEdit) {
                editTaskNameInput.value = subtaskToEdit.name;
                // Format the date and time in the correct format for the datetime-local input
                editTaskStartDateInput.value = subtaskToEdit.startDate.toISOString().slice(0, 16);
                editTaskEndDateInput.value = subtaskToEdit.endDate.toISOString().slice(0, 16);
                editTaskStatusInput.value = subtaskToEdit.status;

                editModal.style.display = 'block';
            }
        } else {
            editTaskNameInput.value = taskToEdit.name;
            // Format the date and time in the correct format for the datetime-local input
            editTaskStartDateInput.value = taskToEdit.startDate.toISOString().slice(0, 16);
            editTaskEndDateInput.value = taskToEdit.endDate.toISOString().slice(0, 16);
            editTaskStatusInput.value = taskToEdit.status;

            editModal.style.display = 'block';
        }
    }
}

function openSubtaskModal(parentTaskId) {
    currentParentTaskId = parentTaskId;
    subtaskModal.style.display = 'block';
}

function closeSubtaskModal() {
    subtaskModal.style.display = 'none';
    // clearSubTaskFormFields();
}

function saveEditedTask() {
    const editedName = document.getElementById('editTaskName').value;
    const editedStartDate = new Date(document.getElementById('editTaskStartDate').value);
    const editedEndDate = new Date(document.getElementById('editTaskEndDate').value);
    const editedStatus = document.getElementById('editTaskStatus').value;

    const editedTask = findTaskById(editedTaskId);

    if (editedTask) {
        // console.log("Editing Task:", editedTaskId);

        if (editedTaskId.startsWith('subtask')) {
            const parentTask = findParentTaskContaining(editedTaskId);
            
            if (parentTask) {
                const editedSubtask = findSubtaskById(editedTaskId, parentTask);
                
                if (editedSubtask) {
                    // console.log("Edited Subtask:", editedSubtask);
                    editedSubtask.name = editedName;
                    editedSubtask.startDate = editedStartDate;
                    editedSubtask.endDate = editedEndDate;
                    editedSubtask.status = editedStatus;

                    updateUI();
                    editModal.style.display = 'none';
                }
            }
        } else {
            // console.log("Editing Parent Task:", editedTaskId);
            // Editing a parent task
            editedTask.name = editedName;
            editedTask.startDate = editedStartDate;
            editedTask.endDate = editedEndDate;
            editedTask.status = editedStatus;

            updateUI();
            editModal.style.display = 'none';
        }
    }
}


function closeEditedTask() {
    editModal.style.display = 'none';
}


function deleteTask(taskId) {
    const taskToDelete = findTaskById(taskId);

    if (taskToDelete) {
        const parentTask = findParentTaskContaining(taskId);

        if (parentTask) {
            parentTask.subTasks = parentTask.subTasks.filter(subTask => subTask.id !== taskId);
        } else {
            parentTasks.splice(parentTasks.indexOf(taskToDelete), 1);
        }

        updateUI();
    }
}

function findTaskById(taskId) {
    return parentTasks.find(task => task.id === taskId) ||
        parentTasks.find(parentTask => parentTask.subTasks && parentTask.subTasks.find(subTask => subTask.id === taskId));
}

function findParentTaskContaining(taskId) {
    return parentTasks.find(parentTask => parentTask.subTasks && parentTask.subTasks.find(subTask => subTask.id === taskId));
}


function clearFormFields() {
    document.getElementById('parentTaskId').value = '';
    document.getElementById('parentTaskName').value = '';
    document.getElementById('parentStartDate').value = '';
    document.getElementById('parentEndDate').value = '';
    document.getElementById('parentStatus').value = '';
    document.getElementById('subTaskName').value = '';
    document.getElementById('subStartDate').value = '';
    document.getElementById('subEndDate').value = '';
    document.getElementById('subStatus').value = '';
}


