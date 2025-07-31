FROM node:18

WORKDIR /app

COPY nextjs/package*.json ./
RUN npm install

COPY nextjs .

EXPOSE 3000

CMD ["npm", "run", "dev"]