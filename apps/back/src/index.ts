import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log(`ORIAA API running on PORT: ${env.PORT}`);
});