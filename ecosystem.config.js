module.exports = {
  apps: [
    {
      name: "smart_market_backend",
      script: "dist/main.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "prod",
      },
    },
  ],
};
