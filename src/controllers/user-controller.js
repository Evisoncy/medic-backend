const Discapacidad = require("../model/Discapacidad");
const Rol = require("../model/Rol");
const User = require("../model/User");
// const jwt = require('jsonwebtoken')

const createUser = async (req, res) => {
  const {
    codigo,
    nombres,
    apellidos,
    dni,
    email,
    password,
    direccion,
    telefono,
    sexo,
    rol,
    discapacidad,
  } = req.body;
  const newUser = new User({
    codigo,
    nombres,
    apellidos,
    dni,
    email,
    password: await User.encryptPassword(password),
    direccion,
    telefono,
    sexo,
  });
  //si al usuario se le asignó algún rol
  //se verifica con el esquema de roles
  //para obtener su id y guardarlos en el esquema de usuarios
  if (rol) {
    const foundRol = await Rol.findOne({ name: rol });
    newUser.rol = foundRol._id;
  } else {
    //si no se le asigna un rol
    //asignar el rol de "user"
    const role = await Rol.findOne({ name: "USUARIO" }); //buscar la info del rol "user"
    newUser.rol = role._id; //GUARDAR EL ID
  }

  //si el usuario tiene alguna discapacidad
  if (discapacidad) {
    const discapacidadId = await Discapacidad.findOne({ name: discapacidad });
    newUser.discapacidad = discapacidadId._id;
  }

  //guardar el usuario en la bd
  const savedUser = await newUser.save();

  // const secret = process.env.SECRET
  //creación de token
  // const token = jwt.sign({ id: savedUser._id }, secret, {
  //     expiresIn: 86400
  // })
  //devolver el mensaje de confirmación
  res.status(200).json({
    error: false,
    message: "El usuario " + nombres + " fue creado correctamente",
  });
};

const getUsers = async (req, res) => {
  const users = await User.find()
    .sort({ apellidos: 1, nombres: 1 })
    .populate("rol")
    .populate("fichaMedica")
    .populate("incidencia")
    .populate("discapacidad");
  if (users) {
    res.status(200).json({ error: false, users });
  } else {
    return res.status(400).json({
      error: true,
      message: "No hay usuarios registrados en el sistema",
    });
  }
};

const getUserByCodigo = async (req, res) => {
  const user = await await User.findOne({ dni: req.params.dniuser })
    .populate("rol")
    .populate("fichaMedica")
    .populate("incidencia")
    .populate("discapacidad");
  console.log(user);
  if (!user) {
    return res.status(404).json({
      error: true,
      message: `El N° de DNI ${req.params.dniuser} no es válido`,
    });
  } else {
    return res.status(200).json({ user });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserByCodigo,
};
