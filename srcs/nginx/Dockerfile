FROM nginx:1.27.2

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./frontend /usr/share/nginx/html

EXPOSE 80

WORKDIR /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]