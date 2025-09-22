const jwt = require('jsonwebtoken');

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.status(401).send('Token no proporcionado.');
    }

    // ¡CAMBIO CLAVE! Ahora usa la misma variable de entorno que al iniciar sesión.
    // El '||' es solo un respaldo para tu desarrollo local.
    const secret = process.env.JWT_SECRET || 'secreto_super_secreto';

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).send('Token inválido.');
      }

      if (allowedRoles && !allowedRoles.includes(user.rol)) {
        return res.status(403).send('No tienes permiso para realizar esta acción.');
      }

      req.user = user;
      next();
    });
  };
};

module.exports = authorize;