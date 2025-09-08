# Use uma imagem oficial do Node.js
FROM node:20-alpine

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie os arquivos de dependência
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Instale o Angular CLI globalmente
RUN npm install -g @angular/cli

# Copie o resto do código da sua aplicação para o diretório de trabalho
COPY . .

# Expõe a porta padrão do Angular dev server
EXPOSE 4200

# Comando para iniciar o servidor de desenvolvimento
# O '--host 0.0.0.0' é ESSENCIAL para que o servidor seja acessível de fora do container
CMD ["ng", "serve", "--host", "0.0.0.0"]