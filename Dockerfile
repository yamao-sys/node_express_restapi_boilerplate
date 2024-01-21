FROM node:latest
WORKDIR /simple_todo
# ホストのpackage.jsonとpackage-lock.jsonを
# コンテナの/appにコピー
COPY ./package*.json ./

CMD bash -c "npm install --legacy-peer-deps && npm run dev"
