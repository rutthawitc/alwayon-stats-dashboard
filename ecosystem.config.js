module.exports = {
  apps: [
    {
      name: "alwayon-dashboard",
      cwd: "/home/rutthawitc/alwayon-stats-dashboard",
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork", // เปลี่ยนเป็น fork mode
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3005,
      },
      // เพิ่มการจัดการ restart
      min_uptime: "60s",
      max_restarts: 5,
      restart_delay: 4000,
      // เพิ่ม error handling
      error_file: "logs/error.log",
      out_file: "logs/output.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      // เพิ่ม node options
      node_args: "--max-old-space-size=2048",
      // ตรวจสอบ status
      wait_ready: true,
      listen_timeout: 50000,
    },
  ],
};
