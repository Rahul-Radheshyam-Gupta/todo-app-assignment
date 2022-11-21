import datetime

from django.shortcuts import render
from core.models import Task, PENDING, APPROVED
from django.http import JsonResponse
from django.core.serializers import serialize
from django.db import connection


def home(request):
    if request.GET.get('load_static'):
        with connection.cursor() as cursor:
            cursor.execute('select count(status) as pending_count from core_task group by core_task.status order by core_task.status asc')
            counts = cursor.fetchall()
        return JsonResponse({'counts': counts}, safe=False, status=200)

    if request.GET.get('get_list'):
        # tasks = Task.objects.all()
        # data = serialize("json", tasks)
        print(request.GET)
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        status = request.GET.get('status', 'Pending')
        # data = Task.objects.filter(created_at__date__range=(start_date, end_date), status=status).values('id', 'name',
        #                                                                                                  'created_at',
        #                                                                                                  'status')
        raw_sql = f"select * from core_task where core_task.status='{status}' and strftime('%Y-%m-%d', core_task.created_at) between '{start_date}' and '{end_date}' order by core_task.created_at desc"
        print("raw sql ", raw_sql)
        with connection.cursor() as cursor:
            cursor.execute(raw_sql)
            data = cursor.fetchall()
            print(data)
        return JsonResponse({'todos': data}, safe=False, status=200)

    if request.method == "POST":
        print("Post data", request.POST)
        action = request.POST.get('action', 'add')
        name = request.POST.get('name')
        if action == 'approve':
            # Using filter to avoid the handling exception ObjectDoesNotExist
            Task.objects.filter(id=request.POST.get('task_id')).update(status=APPROVED)
            return JsonResponse({}, status=200)
        elif action == 'delete':
            # Using filter to avoid the handling exception ObjectDoesNotExist
            Task.objects.filter(id=request.POST.get('task_id')).delete()
            return JsonResponse({}, status=200)

        elif action == 'update':
            # If approved task is being edited then update its status to Pending.
            task = Task.objects.get(id=request.POST.get('task_id'))
            task.name = name
            task.status = PENDING
            task.created_at = datetime.datetime.utcnow()
            task.save()
            data = {'id': task.id, 'name': task.name, 'created_at': task.created_at, 'status': task.status}
            return JsonResponse({'task': data}, safe=False, status=200)
        else:
            # Dont create duplicate pending task
            task, created = Task.objects.get_or_create(name=name, status=PENDING)
            data = {'id': task.id, 'name': task.name, 'created_at': task.created_at, 'status': task.status,
                    'already_exist': created}
            return JsonResponse({'task': data}, safe=False, status=200)
        # create task

    return render(request, 'core/home.html', {'tasks': []})
