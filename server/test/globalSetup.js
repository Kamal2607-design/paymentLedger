const path = require("path");
const { spawnSync } = require("child_process");

module.exports = async () => {
  process.env.NODE_ENV = "test";
  const createDatabase = require("../scripts/createDatabase");
  await createDatabase("test");

  const result = spawnSync("npx", ["sequelize-cli", "db:migrate"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, NODE_ENV: "test" },
    shell: true,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`Test migrations failed:\n${result.stdout}\n${result.stderr}`);
  }
};
