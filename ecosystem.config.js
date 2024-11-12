module.exports = {
  apps: [
    {
      name: "alwayon-dashboard",
      script: "node_modules/next/dist/bin/next",
      args: "start --port 3005",
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/output.log",
      time: true,
    },
  ],
};
