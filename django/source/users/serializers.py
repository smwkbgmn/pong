import datetime as dt

from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework import serializers

from .models import UserModel, UserRoleModel

def create_response_data(detail: dict, code: str):
    data = {
        'detail': detail,
        'code': code,
		}
    return data

class CreateUserSerializer(serializers.Serializer):
    user_id = serializers.CharField(max_length=100, help_text='아이디')
    name = serializers.CharField(max_length=100, help_text='이름')
    email = serializers.EmailField(max_length=100, required=False, help_text='이메일')
    image = serializers.CharField(max_length=100, required=False, help_text='이미지')

    def validate(self, data):
        if UserModel.objects.filter(user_id=data.get('user_id')).exists():
            raise serializers.ValidationError(create_response_data('Account Already Exists', 'exist_account'))
        return data

    def create(self, validated_data):
        validated_data['role'] = UserRoleModel.objects.get_or_create(id=2, name='user')[0]
        user = UserModel.objects.create(**validated_data)
        user.save()

        return create_response_data(user, 'ok')




class LoginSerializer(serializers.Serializer):
    user_id = serializers.CharField(max_length=100, help_text='아이디')
    name = serializers.CharField(max_length=100, help_text='이름')
    email = serializers.EmailField(max_length=100, required=False, help_text='이메일')
    image = serializers.CharField(max_length=100, required=False, help_text='이미지')
    

    def validate(self, data):
        user = authenticate(user_id=data.get('user_id'))
        if user is None:
            raise serializers.ValidationError(create_response_data('Not Exist ID', 'not_exist_id'))
        
        if user.name != data['name']:
            user.name = data['name']
        if user.email != data['email']:
            user.email = data['email']
        if user.image != data['image']:
            user.image = data['image']

        # 최근 로그인시간 갱신
        user.last_login = dt.datetime.now()
        user.save()

        detail = {
            'user_id': user.user_id,
            'name': user.name,
            'email': user.email,
            'image': user.image,
        }
        
        data = {
            'detail': detail,
            'code': 'ok'
		}
        return create_response_data(detail, 'ok')


class LogoutSerializer(serializers.Serializer):
    def validate(self, data):
        
        data = {
            'detail': 'logout',
            'code': 'ok'
				}
        return data
class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('user_id', 'name', 'email', 'image', 'created_at', 'last_login')
        read_only_fields = ('user_id', 'name', 'email', 'created_at', 'last_login')
