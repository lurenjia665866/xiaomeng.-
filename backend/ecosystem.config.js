module.exports = {
  apps: [{
    name: "xiaomeng-v4",
    script: "server.js",
    cwd: __dirname,
    instances: 1,
    exec_mode: "fork",
    watch: false,
    env: {
      NODE_ENV: "production",
      PORT: 8765,
      HOST: "0.0.0.0"
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    max_memory_restart: "200M"
  }]
};
