const todoFunction = (method, action_url, data) => {
    /*
        This is a common function to do all ajax calls and display success toastr as per the action.
        It takes 3 parameters:
            method : get or post
            action_url : url that you want to hit
            data : data that you want to send along with the ajax call

     */
    console.log(method, action_url, data)
    // e.preventDefault();
    $.ajax({
        url: action_url,
        method: method,
        data: data,
        beforeSend: () => {
            $('.loader').show();
        },
        complete: () => {
            $('.loader').hide();
        },
        success: (response) => {
            if (method === 'get') {
                loadTaskList(response.todos);

            } else if (method === 'post') {
                if (data.action === 'add') {
                    if (!response.task.already_exist) {
                        toastr.error('Already exists!', 'Error', {duration: 1000});
                    } else {
                        $('#pending_count').text(parseInt($('#pending_count').text()) + 1);
                        appendTask(response.task);
                        toastr.success('Successfully added', 'Success', {duration: 1000});
                    }
                    $('#name').val('');

                } else if (data.action === 'update') {
                    $('.task-' + data.task_id).hide();
                    appendTask(response.task);
                    toastr.success('Successfully updated', 'Success', {duration: 1000});

                } else if (data.action === 'approve') {
                    $('.task-' + data.task_id + ' .approve').removeClass('text-warning').addClass('text-success').attr('onclick', 'approveTask(' + data.task_id + ', "Approved")')
                    $('#approved_count').text(parseInt($('#approved_count').text()) + 1);
                    $('#pending_count').text(parseInt($('#pending_count').text()) - 1);
                    cancelEdit();
                    toastr.success('Successfully approved.', 'Success', {duration: 1000});

                } else if (data.action === 'delete') {
                    $('.task-' + data.task_id).hide();
                    toastr.success('Successfully deleted!', 'Success', {duration: 1000});
                }
            }
        },
        error: (error) => {
            toastr.error('Successfully deleted!', 'Error', {duration: 1000});
        }
    })

}


const appendTask = (task) => {
    /*
    This function is for appending a single task to the list of tasks and its being called after add task action.
    This will also increase the pending no. of task by 1.
     */
    let todoList = $('#todoList');
    todoList.prepend(
        `
                    <li class="todoListItem task-${task.id}">
                            <span class="todoTask todoTask-${task.id}">
                                    <input type="text" readonly value="${task.name}">
                                    <i class="bi bi-pencil" onclick="enableEditTask(${task.id})"></i>
                                    <div class="edit-btns">
                                        <span class="text-primary badge" onclick="addUpdateTask(${task.id})"> Update </span>
                                        <span class="text-danger badge" onclick="cancelEdit(${task.id}, '${task.name}');"> Cancel </span>
                                    </div>
                            </span>
                            <div class="actions">
                                <small class="text-gray"> ${moment(task.created_at).format('DD MMM YYYY hh:mm a')}</small>
                                <div class="action-icons">
                                    <i onclick="approveTask(${task.id})" class="bi bi-patch-check approve text-${task.status === 'Approved' ? 'success' : 'warning'}"></i>
                                    <i onclick="deleteTask(${task.id})" class="bi bi-patch-exclamation delete text-danger"></i>
                                </div>
                            </div>
                    </li>
            `
    )
    cancelEdit();
    $('.no-task-div').hide()
}


const loadTaskList = (listOfTodos) => {
    /*
    This function loads all task as per the filter conditions.
     */
    let todoList = $('#todoList').empty()
    listOfTodos.forEach((task, index) => {
            todoList.append(
                `
                    <li class="todoListItem task-${task[0]}">
                            <span class="todoTask todoTask-${task[0]}">
                                    <input type="text" id="task_name" readonly value="${task[1]}">
                                    <i class="bi bi-pencil" onclick="enableEditTask(${task[0]})"></i>
                                    <div class="edit-btns">
                                       <span class="text-primary badge" onclick="addUpdateTask(${task[0]})"> Update </span>
                                        <span class="text-danger badge" onclick="cancelEdit(${task[0]}, '${task[1]}');"> Cancel </span>
                                    </div>
                            </span>
                            <div class="actions">
                                <small class="text-gray"> ${moment(task[3] + 'Z').format('DD MMM YYYY hh:mm a')}</small>
                                <div class="action-icons">
                                    <i onclick="approveTask(${task[0]}, '${task[2]}')" class="bi bi-patch-check approve text-${task[2] === 'Approved' ? 'success' : 'warning'}"></i>
                                    <i onclick="deleteTask(${task[0]}, '${task[2]}')" class="bi bi-patch-exclamation delete text-danger"></i>
                                </div>
                            </div>
                    </li>
            `
            )
        }
    )
    cancelEdit();
    if (listOfTodos.length === 0) {
        $('.no-task-div').show();
    } else {
        $('.no-task-div').hide();
    }
}


const loadStatic = (url_for_static) => {
    /*
    This function sets task static like pending and approved task count.
     */
    $.ajax({
        url: url_for_static,
        method: 'get',
        success: (response) => {
            let counts = response.counts;
            console.log("'counts ", counts)
            $('#approved_count').text(counts[0]);
            $('#pending_count').text(counts[1]);
        },
        error: (error) => {
            $('#pending_count').text(0);
            $('#approved_count').text(0);
        }
    })
}


const cancelEdit = (task_id = '', previous_text = '') => {
    /*
    This function is used to hide the edit action buttons and remove highlight from the current clicked task.
    If task_id is passed then it will set the previous task text.
    This function is being called when a cancel button is clicked. and it's also called on page load.
     */
    $('.edit-btns').hide();
    $('.todoTask input').attr('readonly', true);
    $('.todoTask input').removeClass('highlight');
    if (task_id) {
        $('.todoTask-' + task_id + ' input').val(previous_text);
    }
}
