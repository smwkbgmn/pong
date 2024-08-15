from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import *
from .lib.permission import LoginRequired



class UserView(APIView):
		permission_classes = [AllowAny]

		'''
		계정 정보
		'''
		def get(self, request):
			'''
			로그인한 계정 정보 조회

			---
			사용자 계정 ID, 이메일, 가입일자, 최근 로그인 일자 조회
			'''
			serializer = UserInfoSerializer(request.user)
			response_data = serializer.data

			return Response(data=response_data, status=status.HTTP_200_OK)


		def delete(self, request, *args, **kwargs):
			'''
			계정 삭제

			---
			'''
			request.user.delete()

			return Response(status=status.HTTP_204_NO_CONTENT)

		def get_or_create_user(self, data: dict):
			serializer = CreateUserSerializer(data=data)

			if not serializer.is_valid():
					return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

			user = serializer.validated_data
			serializer.create(validated_data=user)

			return Response(data=user, status=status.HTTP_201_CREATED)

		def post(self, request):
			'''
			계정 조회 및 등록

			---
			'''
			return self.get_or_create_user(data=request.data)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def object(self, data: dict):
        serializer = LoginSerializer(data=data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data

        return Response(data=user, status=status.HTTP_200_OK)

    def post(self, request):
        '''
        로그인

        ---
        '''
        return self.object(data=request.data)


class LogoutView(APIView):
    permission_classes = [LoginRequired]

    def post(self, request):
        '''
        로그아웃

        ---
        '''
        serializer = LogoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.validated_data.blacklist()

        return Response(status=status.HTTP_200_OK)
