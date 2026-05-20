FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Hugging Face Spaces chạy trên port 7860 theo mặc định
EXPOSE 7860
ENV PORT=7860

# Tự động đăng ký slash commands trước khi chạy bot
CMD ["sh", "-c", "node src/register-commands.js && node src/index.js"]
