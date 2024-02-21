import { runSeeders } from "typeorm-extension"
import { AppDataSource } from "../../data-source"

AppDataSource.initialize().then(async () => {
  await AppDataSource.synchronize(true)
  try {
    await runSeeders(AppDataSource)
  } catch (e) {
    console.error("Error during runSeeders:", e)
    throw e
  }
  process.exit()
})
