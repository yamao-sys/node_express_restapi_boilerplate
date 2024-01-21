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

seeding
【実行】
npx ts-node src/db/seeds/seed.ts

参考: https://www.devist.xyz/posts/how-to-seed-a-database-with-type-orm-and-faker-in-2023
