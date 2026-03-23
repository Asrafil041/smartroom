from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def score(request):
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