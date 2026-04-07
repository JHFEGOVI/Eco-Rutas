module.exports = {
  apps: [{
    name: 'ecorrutas-backend',
    script: './server.js',
    cwd: '/var/www/Eco-Rutas/backend',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
