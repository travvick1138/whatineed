from django.shortcuts import render
from django.http import JsonResponse,HttpResponse
from django.db.models import lookups
from django.contrib.auth import authenticate, login
from web.models import Thing, Purchase
from django.contrib.auth.models import User
import datetime # not sure if this is needed

# Create your views here.

# Given a barcode number return object with information about that product
def barcode(request, barcode_number):
    try:
        # Return Success format from jsonapi.org/format
        data = dict(Thing.objects.filter(barcode = barcode_number).values().first())
        json_object = {'data':data, 'self': '/api/thing/' + barcode_number}
    except TypeError:
        # Return Error format from jsonapi.org/format
        data = None
        title = 'No Item Found'
        detail = 'There was no item in our records that matched the barcode you supplied.'
        error = {'status':"404 Not Found", 'title':title,'detail':detail}
        json_object = {'errors' : error, 'data': data}
    return JsonResponse(json_object)

def purchase(request):
    pass

def things_list(request, user_id):
    data = Purchase.objects.filter(owner_id = user_id).order_by('purchase_date').iterator() #sort by predicted_replace_days
    object_list = []
    for i in data:
        purchase_id = i.id
        purchase_thing_id = i.thing_id.id
        name = i.thing_id.name
        status = i.state
        last_purchased = i.purchase_date # requires further processing
        src = i.thing_id.product_image # image

        new_object = {
            "id": purchase_thing_id,
            "name": name,
            "status": status,
            "last_purchased": last_purchased,
            "src": src,
            "purchase_id": purchase_id,
        }

        object_list.append(new_object)

    json_object = {'data':object_list}
    return JsonResponse(json_object)

# Login authentication
def login(request):
    try:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password).__dict__
        user_id = user['id']
        json_object = {'data':{'user_id':user_id}}
        return JsonResponse(json_object)
    except:
        json_object = {'errors':{'title' : 'No Post Data', 'detail' : 'there was no post data in your request'}}
        return JsonResponse(json_object)
