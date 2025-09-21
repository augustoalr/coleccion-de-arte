 const jwt = require('jsonwebtoken');

// Esta es una función que CREA un middleware.
// Le pasamos un array de roles permitidos, ej: ['admin', 'editor']
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.status(401).send('Token no proporcionado.');
    }

    jwt.verify(token, 'secreto_super_secreto', (err, user) => {
      if (err) {
        return res.status(403).send('Token inválido.');
      }

      // Verificación del Rol
      if (allowedRoles && !allowedRoles.includes(user.rol)) {
        return res.status(403).send('No tienes permiso para realizar esta acción.');
      }

      req.user = user;
      next();
    });
  };
};

module.exports = authorize;