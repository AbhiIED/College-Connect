module.exports = {
  apps: [
    {
      name: "college-connect-backend",
      script: "src/server.js",
      instances: 1, // Change to "max" or an integer for clustering if multiple CPU cores are available
      exec_mode: "fork", // Can use "cluster" if instances > 1
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 5000
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      combine_logs: true
    }
  ]
};
