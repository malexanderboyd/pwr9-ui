FROM node:12-slim as builder
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package* ./
RUN npm install --silent
RUN npm install react-scripts -g --silent
COPY public/ public/
COPY src/ src/
RUN npm run build

FROM nginx:1.13.9-alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8001

CMD ["nginx", "-g", "daemon off;"]