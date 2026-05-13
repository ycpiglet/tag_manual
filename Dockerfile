FROM nginx:alpine

# nginx 기본 설정 제거 후 프로젝트 설정 적용
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 프로젝트 파일을 컨테이너에 복사
COPY . /usr/share/nginx/html

EXPOSE 80
