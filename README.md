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


単体テスト
【参考】
https://qiita.com/taisuke101700/items/149429774f9983296fa1
https://qiita.com/noriaki/items/5d800ea1813c465a0a11
https://qiita.com/mangano-ito/items/99dedf88d972e7e631b7
https://zenn.dev/dove/articles/26cfbc647e1897
https://supersoftware.jp/tech/20220826/16969/
https://qiita.com/shun_xx/items/6c4fb4f0bfa62db8fd82
https://github.com/nestjs/nest/issues/409
