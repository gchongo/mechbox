module.exports = {
  apps: [
    {
      name: 'mechbox-auth',
      script: 'server/index.js',
      cwd: __dirname + '/..',
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
