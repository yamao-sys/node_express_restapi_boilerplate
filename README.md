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


バリデーションチェック
【参考】
https://orkhan.gitbook.io/typeorm/docs/validation
https://qiita.com/t-kubodera/items/2839ec4e4fe667b43f18
https://zenn.dev/engineerhikaru/books/0a615c1248a2ea/viewer/da7ce1

アソシエーション
【参考】
https://qiita.com/jnst/items/9a4c1a9f15b165e0e420

Controller, modelの作成
・routing-controllersなるものがあるらしいが、少しメンテナンスされているか不安のため自作でいく
https://github.com/typestack/routing-controllers
