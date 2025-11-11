from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import Option, UserSelection
from .models import User

@login_required
def save_selection(request):
    if request.method == "POST":
        selected_ids = request.POST.getlist("option_ids[]")
        UserSelection.objects.filter(user=request.user).delete()  # 기존 선택 제거
        for opt_id in selected_ids:
            UserSelection.objects.create(user=request.user, option_id=opt_id)
        return render(request, "core/success.html")

def profile_edit(request):
    user = request.user
    if request.method == 'POST':
        user.spec_job = request.POST.get('spec_job')
        user.desired_job = request.POST.get('desired_job')
        user.save()
        return redirect('profile')  # 저장 후 리디렉션
    return render(request, 'profile_edit.html', {'user': user})

# Create your views here.
