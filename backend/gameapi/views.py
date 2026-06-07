from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
import json
from django.shortcuts import get_object_or_404
from .models import Room, Score, BlocklyResult, Submission
from .models import Progress, SimulationRun, DeviceState
from .models import Attempt, Asset, ActivityLog, Leaderboard, Setting, RoomSetting
from .models import UserProfile, StudentProfile, TeacherProfile

# Helper function to check if user is authenticated
def get_user_from_token(request):
    """Extract user from token in Authorization header or session"""
    # Check session-based auth first
    if request.user.is_authenticated:
        return request.user
    
    # Check token-based auth
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header.startswith('Token '):
        token = auth_header[6:]
        try:
            from django.contrib.auth.models import User
            # Simple token validation (in production, use Django REST Framework's Token)
            user = User.objects.get(auth_token__key=token) if hasattr(User, 'auth_token') else None
            return user
        except:
            return None
    
    return None

@csrf_exempt
def register(request):
    """Register a new user"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            email = data.get('email', '').strip()
            
            if not username or not password:
                return JsonResponse({
                    "status": "error",
                    "message": "Username dan password harus diisi"
                }, status=400)
            
            if len(password) < 6:
                return JsonResponse({
                    "status": "error",
                    "message": "Password minimal 6 karakter"
                }, status=400)
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                return JsonResponse({
                    "status": "error",
                    "message": "Username sudah ada. Pilih username lain."
                }, status=400)
            
            # Create new user
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email
            )
            
            return JsonResponse({
                "status": "success",
                "message": "Registrasi berhasil. Silakan login.",
                "user_id": user.id,
                "username": user.username
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Format data tidak valid"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e) or "Terjadi kesalahan saat registrasi"
            }, status=500)
    
    return JsonResponse({
        "status": "error",
        "message": "Method tidak diizinkan"
    }, status=405)

@csrf_exempt
def login(request):
    """Login user and return session"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username', '').strip()
            password = data.get('password', '').strip()
            
            if not username or not password:
                return JsonResponse({
                    "status": "error",
                    "message": "Username dan password harus diisi"
                }, status=400)
            
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if user is None:
                return JsonResponse({
                    "status": "error",
                    "message": "Username atau password salah"
                }, status=401)
            
            # Set session
            from django.contrib.auth import login as django_login
            django_login(request, user)
            
            return JsonResponse({
                "status": "success",
                "message": "Login berhasil",
                "user_id": user.id,
                "username": user.username,
                "email": user.email
            })
            
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Format data tidak valid"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "status": "error",
                "message": str(e) or "Terjadi kesalahan saat login"
            }, status=500)
    
    return JsonResponse({
        "status": "error",
        "message": "Method tidak diizinkan"
    }, status=405)

@csrf_exempt
def logout(request):
    """Logout user"""
    if request.method == 'POST':
        from django.contrib.auth import logout as django_logout
        django_logout(request)
        return JsonResponse({
            "status": "success",
            "message": "Logout berhasil"
        })
    
    return JsonResponse({
        "status": "error",
        "message": "Method not allowed"
    }, status=405)

@csrf_exempt
def check_auth(request):
    """Check if user is authenticated"""
    if request.user.is_authenticated:
        return JsonResponse({
            "status": "success",
            "authenticated": True,
            "user_id": request.user.id,
            "username": request.user.username,
            "email": request.user.email
        })
    else:
        return JsonResponse({
            "status": "success",
            "authenticated": False
        })

@csrf_exempt
def score(request):
    # Check if user is authenticated
    if not request.user.is_authenticated:
        return JsonResponse({
            "status": "error",
            "message": "Anda harus login terlebih dahulu"
        }, status=401)
    
    if request.method == 'GET':
        return JsonResponse({"high_score": 12345})
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Mengambil teks JavaScript hasil terjemahan Blockly
            code = data.get('code', '')
            
            print(f"Kode yang diterima dari frontend:\n{code}")
            
            # Secara bawaan, kita anggap jawaban siswa SALAH terlebih dahulu
            is_correct = False
            
            # 1. Koreksi untuk Kipas Angin Pintar (Suhu > 25 -> Nyala)
            # Syarat: Harus ada blok IF, Sensor Suhu, tanda >, angka 25, dan blok Nyalakan
            syarat_kipas = ["if", "sensorsuhu()", ">", "25", "digitalwrite(high)"]
            
            # 2. Koreksi untuk Komputer Otomatis (Gerakan && Cahaya < 50 -> Nyala)
            syarat_komputer = ["if", "adagerakan()", "sensorcahaya()", "<", "50", "digitalwrite(high)"]
            
            # Kita ubah kode yang masuk menjadi huruf kecil semua agar lebih mudah dicocokkan
            kode_huruf_kecil = code.lower().replace(" ", "")
            
            # Cek apakah kode siswa mengandung semua syarat kipas angin
            if all(kata.lower().replace(" ", "") in kode_huruf_kecil for kata in syarat_kipas):
                is_correct = True
                print("Evaluasi: Jawaban Kipas BENAR")
                
            # Cek apakah kode siswa mengandung semua syarat komputer otomatis
            elif all(kata.lower().replace(" ", "") in kode_huruf_kecil for kata in syarat_komputer):
                is_correct = True
                print("Evaluasi: Jawaban Komputer BENAR")
            else:
                print("Evaluasi: Jawaban SALAH atau Kurang Lengkap")

            # Kirimkan hasil koreksi sebenarnya kembali ke layar game
            return JsonResponse({
                "status": "success",
                "message": "Evaluasi kode selesai",
                "correct": is_correct, 
                "code": code
            })
            
        except json.JSONDecodeError:
            return JsonResponse({"error": "Data JSON tidak valid"}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)


# --- Simple CRUD endpoints for Room and Score (examples) ---


@csrf_exempt
def rooms_list_create(request):
    # GET: list rooms, POST: create room (must be authenticated)
    if request.method == 'GET':
        rooms = Room.objects.all().values('id', 'name', 'slug', 'owner_id', 'description', 'settings', 'created_at', 'updated_at')
        return JsonResponse({'rooms': list(rooms)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            name = data.get('name')
            slug = data.get('slug')
            description = data.get('description', '')
            settings = data.get('settings')
            if not name or not slug:
                return JsonResponse({'status': 'error', 'message': 'name and slug are required'}, status=400)
            # prevent duplicate slug
            existing = Room.objects.filter(slug=slug).first()
            if existing:
                return JsonResponse({'status': 'exists', 'room_id': existing.id})
            room = Room.objects.create(name=name, slug=slug, owner=request.user, description=description, settings=settings)
            return JsonResponse({'status': 'success', 'room_id': room.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def room_detail(request, pk):
    room = get_object_or_404(Room, pk=pk)

    if request.method == 'GET':
        data = {
            'id': room.id,
            'name': room.name,
            'slug': room.slug,
            'owner_id': room.owner_id,
            'description': room.description,
            'settings': room.settings,
            'created_at': room.created_at,
            'updated_at': room.updated_at,
        }
        return JsonResponse({'room': data})

    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if room.owner_id != request.user.id:
            return JsonResponse({'status': 'error', 'message': 'Only owner can update room'}, status=403)
        try:
            data = json.loads(request.body)
            room.name = data.get('name', room.name)
            room.description = data.get('description', room.description)
            if 'settings' in data:
                room.settings = data.get('settings')
            room.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if room.owner_id != request.user.id:
            return JsonResponse({'status': 'error', 'message': 'Only owner can delete room'}, status=403)
        room.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def scores_list_create(request):
    # GET: list recent scores, POST: create score (authenticated)
    if request.method == 'GET':
        scores = Score.objects.all().order_by('-graded_at').values('id', 'user_id', 'room_id', 'task_id', 'score_value', 'max_score', 'graded_at')[:100]
        return JsonResponse({'scores': list(scores)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            room_id = data.get('room_id')
            task_id = data.get('task_id')
            score_value = data.get('score_value', 0)
            max_score = data.get('max_score', 0)
            score = Score.objects.create(user=request.user, room_id=room_id, task_id=task_id, score_value=score_value, max_score=max_score)
            return JsonResponse({'status': 'success', 'score_id': score.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def score_detail(request, pk):
    score = get_object_or_404(Score, pk=pk)

    if request.method == 'GET':
        data = {
            'id': score.id,
            'user_id': score.user_id,
            'room_id': score.room_id,
            'task_id': score.task_id,
            'score_value': score.score_value,
            'max_score': score.max_score,
            'graded_at': score.graded_at,
        }
        return JsonResponse({'score': data})

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        # allow deletion by owner of score or staff/superuser
        if request.user.id != score.user_id and not request.user.is_staff and not request.user.is_superuser:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        score.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def blocklyresults_list_create(request):
    if request.method == 'GET':
        results = BlocklyResult.objects.all().order_by('-created_at').values('id', 'user_id', 'problem_id', 'result', 'created_at')[:100]
        return JsonResponse({'blockly_results': list(results)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            br = BlocklyResult.objects.create(
                user=request.user,
                problem_id=data.get('problem_id'),
                workspace_xml=data.get('workspace_xml'),
                generated_code=data.get('generated_code'),
                result=data.get('result'),
                output=data.get('output'),
                run_time=data.get('run_time')
            )
            return JsonResponse({'status': 'success', 'id': br.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def blocklyresult_detail(request, pk):
    br = get_object_or_404(BlocklyResult, pk=pk)

    if request.method == 'GET':
        data = {
            'id': br.id,
            'user_id': br.user_id,
            'problem_id': br.problem_id,
            'generated_code': br.generated_code,
            'result': br.result,
            'output': br.output,
            'run_time': br.run_time,
            'created_at': br.created_at,
        }
        return JsonResponse({'blockly_result': data})

    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if br.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            br.generated_code = data.get('generated_code', br.generated_code)
            br.result = data.get('result', br.result)
            br.output = data.get('output', br.output)
            if 'run_time' in data:
                br.run_time = data.get('run_time')
            br.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if br.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        br.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def submissions_list_create(request):
    if request.method == 'GET':
        subs = Submission.objects.all().order_by('-submitted_at').values('id', 'user_id', 'task_id', 'status', 'submitted_at')[:100]
        return JsonResponse({'submissions': list(subs)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            sub = Submission.objects.create(
                user=request.user,
                task_id=data.get('task_id'),
                attachment=data.get('attachment'),
                status=data.get('status', 'pending'),
                feedback=data.get('feedback')
            )
            return JsonResponse({'status': 'success', 'id': sub.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def submission_detail(request, pk):
    sub = get_object_or_404(Submission, pk=pk)

    if request.method == 'GET':
        data = {
            'id': sub.id,
            'user_id': sub.user_id,
            'task_id': sub.task_id,
            'attachment': sub.attachment,
            'status': sub.status,
            'feedback': sub.feedback,
            'submitted_at': sub.submitted_at,
        }
        return JsonResponse({'submission': data})

    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if sub.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            sub.attachment = data.get('attachment', sub.attachment)
            sub.status = data.get('status', sub.status)
            sub.feedback = data.get('feedback', sub.feedback)
            sub.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if sub.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        sub.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def progress_list_create(request):
    if request.method == 'GET':
        items = Progress.objects.all().order_by('-last_updated').values('id', 'user_id', 'room_id', 'task_id', 'progress_percent', 'current_step', 'last_updated')[:100]
        return JsonResponse({'progress': list(items)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            room_id = data.get('room_id')
            if room_id is None:
                return JsonResponse({'status': 'error', 'message': 'room_id is required'}, status=400)
            prog = Progress.objects.create(
                user=request.user,
                room_id=room_id,
                task_id=data.get('task_id'),
                progress_percent=data.get('progress_percent', 0.0),
                current_step=data.get('current_step')
            )
            return JsonResponse({'status': 'success', 'id': prog.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def progress_detail(request, pk):
    p = get_object_or_404(Progress, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'progress': {
            'id': p.id,
            'user_id': p.user_id,
            'room_id': p.room_id,
            'task_id': p.task_id,
            'progress_percent': p.progress_percent,
            'current_step': p.current_step,
            'last_updated': p.last_updated,
        }})

    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if p.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            if 'progress_percent' in data:
                p.progress_percent = data.get('progress_percent')
            p.current_step = data.get('current_step', p.current_step)
            p.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if p.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        p.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def simulationruns_list_create(request):
    if request.method == 'GET':
        items = SimulationRun.objects.all().order_by('-started_at').values('id', 'user_id', 'room_id', 'started_at', 'ended_at', 'score')[:100]
        return JsonResponse({'simulation_runs': list(items)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            room_id = data.get('room_id')
            if room_id is None:
                return JsonResponse({'status': 'error', 'message': 'room_id is required'}, status=400)
            sr = SimulationRun.objects.create(
                user=request.user,
                room_id=room_id,
                state_snapshot=data.get('state_snapshot'),
                score=data.get('score')
            )
            return JsonResponse({'status': 'success', 'id': sr.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def simulationrun_detail(request, pk):
    s = get_object_or_404(SimulationRun, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'simulation_run': {
            'id': s.id,
            'user_id': s.user_id,
            'room_id': s.room_id,
            'started_at': s.started_at,
            'ended_at': s.ended_at,
            'score': s.score,
            'state_snapshot': s.state_snapshot,
        }})

    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if s.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            if 'ended_at' in data:
                s.ended_at = data.get('ended_at')
            if 'score' in data:
                s.score = data.get('score')
            if 'state_snapshot' in data:
                s.state_snapshot = data.get('state_snapshot')
            s.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if s.user_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        s.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def devicestates_list_create(request):
    if request.method == 'GET':
        items = DeviceState.objects.all().order_by('-timestamp').values('id', 'device_id', 'room_id', 'state', 'timestamp')[:100]
        return JsonResponse({'device_states': list(items)})

    if request.method == 'POST':
        # device states may be sent by external device; allow unauthenticated POST optionally
        try:
            data = json.loads(request.body)
            ds = DeviceState.objects.create(
                device_id=data.get('device_id'),
                room_id=data.get('room_id'),
                state=data.get('state')
            )
            return JsonResponse({'status': 'success', 'id': ds.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def devicestate_detail(request, pk):
    d = get_object_or_404(DeviceState, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'device_state': {
            'id': d.id,
            'device_id': d.device_id,
            'room_id': d.room_id,
            'state': d.state,
            'timestamp': d.timestamp,
        }})

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        d.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def attempts_list_create(request):
    if request.method == 'GET':
        items = Attempt.objects.all().order_by('-created_at').values('id', 'submission_id', 'attempt_no', 'result', 'time_taken', 'created_at')[:100]
        return JsonResponse({'attempts': list(items)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            submission_id = data.get('submission_id')
            if submission_id is None:
                return JsonResponse({'status': 'error', 'message': 'submission_id is required'}, status=400)
            at = Attempt.objects.create(submission_id=submission_id, attempt_no=data.get('attempt_no', 1), result=data.get('result'), time_taken=data.get('time_taken'))
            return JsonResponse({'status': 'success', 'id': at.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def attempt_detail(request, pk):
    a = get_object_or_404(Attempt, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'attempt': {'id': a.id, 'submission_id': a.submission_id, 'attempt_no': a.attempt_no, 'result': a.result, 'time_taken': a.time_taken, 'created_at': a.created_at}})

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        a.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def assets_list_create(request):
    if request.method == 'GET':
        items = Asset.objects.all().order_by('-created_at').values('id', 'owner_id', 'file_name', 'path', 'mime_type', 'created_at')[:100]
        return JsonResponse({'assets': list(items)})

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            asset = Asset.objects.create(owner=request.user, file_name=data.get('file_name'), path=data.get('path'), mime_type=data.get('mime_type'))
            return JsonResponse({'status': 'success', 'id': asset.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def asset_detail(request, pk):
    obj = get_object_or_404(Asset, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'asset': {'id': obj.id, 'owner_id': obj.owner_id, 'file_name': obj.file_name, 'path': obj.path, 'mime_type': obj.mime_type, 'created_at': obj.created_at}})

    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if obj.owner_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            obj.file_name = data.get('file_name', obj.file_name)
            obj.path = data.get('path', obj.path)
            obj.mime_type = data.get('mime_type', obj.mime_type)
            obj.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        if obj.owner_id != request.user.id and not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        obj.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def activitylogs_list_create(request):
    if request.method == 'GET':
        items = ActivityLog.objects.all().order_by('-timestamp').values('id', 'user_id', 'action', 'object_type', 'object_id', 'timestamp')[:100]
        return JsonResponse({'activity_logs': list(items)})

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_id = data.get('user_id') if data.get('user_id') else (request.user.id if request.user.is_authenticated else None)
            al = ActivityLog.objects.create(user_id=user_id, action=data.get('action'), object_type=data.get('object_type'), object_id=data.get('object_id'), details=data.get('details'))
            return JsonResponse({'status': 'success', 'id': al.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def activitylog_detail(request, pk):
    obj = get_object_or_404(ActivityLog, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'activity_log': {'id': obj.id, 'user_id': obj.user_id, 'action': obj.action, 'details': obj.details, 'timestamp': obj.timestamp}})

    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        obj.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def leaderboards_list_create(request):
    if request.method == 'GET':
        items = Leaderboard.objects.all().order_by('-updated_at').values('id', 'name', 'period', 'updated_at')[:100]
        return JsonResponse({'leaderboards': list(items)})

    if request.method == 'POST':
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Staff authentication required'}, status=403)
        try:
            data = json.loads(request.body)
            lb = Leaderboard.objects.create(name=data.get('name'), period=data.get('period'), summary=data.get('summary'))
            return JsonResponse({'status': 'success', 'id': lb.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def leaderboard_detail(request, pk):
    obj = get_object_or_404(Leaderboard, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'leaderboard': {'id': obj.id, 'name': obj.name, 'period': obj.period, 'summary': obj.summary, 'updated_at': obj.updated_at}})

    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Staff authentication required'}, status=403)
        try:
            data = json.loads(request.body)
            obj.name = data.get('name', obj.name)
            obj.period = data.get('period', obj.period)
            if 'summary' in data:
                obj.summary = data.get('summary')
            obj.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    if request.method == 'DELETE':
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Staff authentication required'}, status=403)
        obj.delete()
        return JsonResponse({'status': 'success'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def settings_list_create(request):
    if request.method == 'GET':
        items = Setting.objects.all().values('id', 'key', 'value', 'updated_at')[:100]
        return JsonResponse({'settings': list(items)})
    if request.method == 'POST':
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Staff authentication required'}, status=403)
        try:
            data = json.loads(request.body)
            s = Setting.objects.create(key=data.get('key'), value=data.get('value'))
            return JsonResponse({'status': 'success', 'id': s.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def setting_detail(request, pk):
    obj = get_object_or_404(Setting, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'setting': {'id': obj.id, 'key': obj.key, 'value': obj.value, 'updated_at': obj.updated_at}})
    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Staff authentication required'}, status=403)
        try:
            data = json.loads(request.body)
            obj.value = data.get('value', obj.value)
            obj.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    if request.method == 'DELETE':
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({'status': 'error', 'message': 'Staff authentication required'}, status=403)
        obj.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def roomsettings_list_create(request):
    if request.method == 'GET':
        items = RoomSetting.objects.all().values('id', 'room_id', 'key', 'value', 'updated_at')[:100]
        return JsonResponse({'room_settings': list(items)})
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            room_id = data.get('room_id')
            if room_id is None:
                return JsonResponse({'status': 'error', 'message': 'room_id required'}, status=400)
            rs = RoomSetting.objects.create(room_id=room_id, key=data.get('key'), value=data.get('value'))
            return JsonResponse({'status': 'success', 'id': rs.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def roomsetting_detail(request, pk):
    obj = get_object_or_404(RoomSetting, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'room_setting': {'id': obj.id, 'room_id': obj.room_id, 'key': obj.key, 'value': obj.value}})
    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            obj.key = data.get('key', obj.key)
            obj.value = data.get('value', obj.value)
            obj.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    if request.method == 'DELETE':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        obj.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def userprofiles_list_create(request):
    if request.method == 'GET':
        items = UserProfile.objects.all().values('id', 'user_id', 'extra_data')[:100]
        return JsonResponse({'user_profiles': list(items)})
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            up = UserProfile.objects.create(user=request.user, extra_data=data.get('extra_data'))
            return JsonResponse({'status': 'success', 'id': up.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def userprofile_detail(request, pk):
    obj = get_object_or_404(UserProfile, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'user_profile': {'id': obj.id, 'user_id': obj.user_id, 'extra_data': obj.extra_data}})
    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated or request.user.id != obj.user_id:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            obj.extra_data = data.get('extra_data', obj.extra_data)
            obj.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    if request.method == 'DELETE':
        if not request.user.is_authenticated or request.user.id != obj.user_id:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        obj.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def studentprofiles_list_create(request):
    if request.method == 'GET':
        items = StudentProfile.objects.all().values('id', 'user_id', 'student_id', 'student_class', 'major')[:100]
        return JsonResponse({'student_profiles': list(items)})
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            sp = StudentProfile.objects.create(user=request.user, student_id=data.get('student_id'), student_class=data.get('student_class'), major=data.get('major'))
            return JsonResponse({'status': 'success', 'id': sp.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def studentprofile_detail(request, pk):
    obj = get_object_or_404(StudentProfile, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'student_profile': {'id': obj.id, 'user_id': obj.user_id, 'student_id': obj.student_id, 'student_class': obj.student_class, 'major': obj.major}})
    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated or request.user.id != obj.user_id:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            obj.student_id = data.get('student_id', obj.student_id)
            obj.student_class = data.get('student_class', obj.student_class)
            obj.major = data.get('major', obj.major)
            obj.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    if request.method == 'DELETE':
        if not request.user.is_authenticated or request.user.id != obj.user_id:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        obj.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def teacherprofiles_list_create(request):
    if request.method == 'GET':
        items = TeacherProfile.objects.all().values('id', 'user_id', 'staff_id', 'department')[:100]
        return JsonResponse({'teacher_profiles': list(items)})
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'status': 'error', 'message': 'Authentication required'}, status=401)
        try:
            data = json.loads(request.body)
            tp = TeacherProfile.objects.create(user=request.user, staff_id=data.get('staff_id'), department=data.get('department'))
            return JsonResponse({'status': 'success', 'id': tp.id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def teacherprofile_detail(request, pk):
    obj = get_object_or_404(TeacherProfile, pk=pk)
    if request.method == 'GET':
        return JsonResponse({'teacher_profile': {'id': obj.id, 'user_id': obj.user_id, 'staff_id': obj.staff_id, 'department': obj.department}})
    if request.method in ('PUT', 'PATCH'):
        if not request.user.is_authenticated or request.user.id != obj.user_id:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        try:
            data = json.loads(request.body)
            obj.staff_id = data.get('staff_id', obj.staff_id)
            obj.department = data.get('department', obj.department)
            obj.save()
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    if request.method == 'DELETE':
        if not request.user.is_authenticated or request.user.id != obj.user_id:
            return JsonResponse({'status': 'error', 'message': 'Not permitted'}, status=403)
        obj.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'Method not allowed'}, status=405)