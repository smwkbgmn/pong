FROM nginx:alpine

# Nginx 설정 파일 복사
COPY conf/default.conf /etc/nginx/conf.d/default.conf

# SSL 인증서와 비밀 키 파일 복사
COPY ssl/server.crt /etc/nginx/ssl/server.crt
COPY ssl/server.key /etc/nginx/ssl/server.key

# Nginx 사용자와 권한 설정
RUN chmod 600 /etc/nginx/ssl/server.key

# 컨테이너가 시작될 때 Nginx를 실행하도록 설정
CMD ["nginx", "-g", "daemon off;"]
