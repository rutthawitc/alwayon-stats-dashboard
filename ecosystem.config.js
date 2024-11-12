import { join } from "path";

export const apps = [
  {
    name: "alwayon-dashboard",
    script: join(__dirname, "node_modules/next/dist/bin/next"),
    args: "start --port 3005",
    instances: 1,
    exec_mode: "cluster",
    watch: false,
    interpreter: "/home/rutthawitc/.nvm/versions/node/v20.18.0/bin/node",
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3005,
      NODE_VERSION: process.version, // เพิ่ม Node version เข้าไปใน env
    },
  },
];
