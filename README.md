Node.js習得用リポジトリ

mysql2 driverの背景
参考: https://qiita.com/harukin721/items/99c606364a012cceb0d8

migration
【作成】
npx ts-node ./node_modules/.bin/typeorm migration:generate -d src/data-source.ts src/db/migrations/file_suffix

【認識されているかチェック】
npx ts-node ./node_modules/.bin/typeorm migration:show -d src/data-source.ts

【実行】
npx ts-node ./node_modules/.bin/typeorm migration:run -d src/data-source.ts
