//Variables Globales
var Tabulator = require('tabulator-tables');//Se usa para la tabla de info
const fs = require("fs");//Para modificar el JSON
const path = require('path');//Para obtener la ruta
let { PythonShell } = require('python-shell')//Python shell que utilizo para correr python
const pth = path.join(__dirname, '../Data/data.json');//La ruta donde está el JSON
var datos;//El array donde van todos los objetos JSON
var key;// Variable que guarda el hash de la contraseña maestra
var table;//variable que contiene la tabla para visualizar las cuentas
//Variables de los inputs
const sitioInput = document.getElementById("Sitio");
const cuentaInput = document.getElementById("Cuenta");
const passwdInput = document.getElementById("Contraseña");
const masterInput = document.getElementById("ContraseñaMaestra");
//Variables botones
const btnAgregar = document.getElementById("Agregar");
const btnCambiar = document.getElementById("Cambiar");
const btnDescifrar = document.getElementById("Descifrar");
const btnEliminar = document.getElementById("Eliminar");
const btnGenerar = document.getElementById("Generar");
const btnGuardar = document.getElementById("Guardar");
const btnModificar = document.getElementById("Modificar");
const btnAcceder = document.getElementById("Acceder");

//---------------------------------------------------------------------
//"Menu Principal",
//para acceder a una cuenta en especifico la selecciono en la tabla
bloquearInputs(); //Bloqueo todos los inputs
//Permito que el usuario solo pueda escribir en el input de la contraseña maestra
ModificarMasterInput("", "Escribe tu Contraseña Maestra", false, "password")
//Deshabilito todos los botones, excepto el de acceder
DeshabilitarBotones(true, true, true, true, true, true, true, false);
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//Función que se encarga de modificar los datos cada vez que hay un cambio
async function UpdateDatos() {
  await cifrarJSON(key) //Paso lo que tenga en la variable datos al archivo
  await descifrarJSON(key)//Leo lo que hay en el archivo y lo paso a la variable
  //Deshabilito todos los botones menos el de "Cambiar Contraseña Maestra" y "Agregar"
  DeshabilitarBotones(false, false, true, true, true, true, true, true);
  table.replaceData(datos); //Reemplazo los datos de la tabla
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//Que sucede cuando presiono el botón de acceder
async function acceder() {
  //checo si key es nullo
  if (key == null) {//Acabo de prender la aplicación
    //Saco el hash de la contraseña que di
    await hashear(masterInput.value)
    //Intento descifrar el archivo con el hash
    await descifrarJSON(key)
    try {//Intento crear la tabla 
      crearTabla()//Creo la tabla, 
      accederPorPrimeraVez();//Desbloquea el "menu principal" al acceder
      //Desaparezco el aviso
      document.getElementById("Aviso").innerHTML = "";
    } catch {//si truena es que no di la contraseña correcta
      document.getElementById("Aviso").innerHTML = "Contraseña Incorrecta";
    }
  } else {//Ya tengo un hash anterior
    await hashear(masterInput.value);//Saco el hash
    //Descifro el archivo de nuevo
    await descifrarJSON(key)//Vuelvo a descifrar en el caso de que haya puesto una contraseña incorrecta y luego una correcta
    try {
      crearTabla() //Creo la tabla, si truena di una contraseña incorrecta
      document.getElementById("Aviso").style.color = "greenyellow"
      document.getElementById("Aviso").innerHTML = "Contraseña Exitosa";
      //Habilito los botones de "agregar" y "cambiar"
      DeshabilitarBotones(false, false, true, true, true, true, true, true);
      //Limpio el input de la contraseña maestra
      ModificarMasterInput("", "", true, "password");
      //Cifro los datos con la nueva llave
      await cifrarJSON(key);
      //Descifro los datos con el nuevo archivo
      await descifrarJSON(key)
      document.getElementById("Aviso").innerHTML = "";
    } catch {
      //No hago nada, pero no se pudo descifrar la llave
    }
  }
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//Con esta función creo la tabla, y su data source es la variable datos
function crearTabla() {
  table = new Tabulator("#tabla-datos", {
    height: 380, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
    data: datos, //assign data to table
    layout: "fitColumns", //fit columns to width of table (optional)
    selectable: 1, //make rows selectable
    columns: [ //Define Table Columns
      { title: "Sitio", field: "Sitio" },
      { title: "Cuenta", field: "Cuenta" },

    ],
    rowClick: function (e, row) { //Lo que sucede cuando le hago click a una hilera
      ModificarSitioInput(row.getData().Sitio, "cuentaYaExiste", true);
      ModificarCuentaInput(row.getData().Cuenta, "", true);
      ModificarPasswdInput(row.getData().Contraseña, "", true, "password");
      ModificarMasterInput("", "", true, "password");
      DeshabilitarBotones(false, false, false, false, true, true, true, true);
    },
  });
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//Función que checa que el input sea algo válido
function accederPorPrimeraVez() {
  if (masterInput.value !== "") {
    //Habilito los botones de agregar y cambiar
    DeshabilitarBotones(false, false, true, true, true, true, true, true);
    ModificarMasterInput("", "", true, "password");
  }
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
//Esto sucede cuando le pico el botón de guardar
async function guardarDatos() {
  var update;//La nueva cuenta que voy a agregar 
  let sitio, cuenta, passwd;
  sitio = sitioInput.value;
  cuenta = cuentaInput.value;
  passwd = passwdInput.value;

  if (cuenta !== "" && sitio !== "" && passwd !== "") {//Si todos los campos tienen algo escrito
    //Update es un objeto JSON
    update = { Sitio: sitio, Cuenta: cuenta, Contraseña: passwd }

    if (sitioInput.placeholder === "cuentaYaExiste") {//Si modifiqué una cuenta existente
      const index = datos.findIndex(x => ((x.Sitio === sitio && x.Cuenta === cuenta))); //Encuentro el index de la cuenta
      if (index !== undefined) datos.splice(index, 1);//Quito ese objeto json del array
    }
    datos.push(update)//Agrego a datos la actualización
  }
  activarMenu("Guardar");//Regreso al menu anterior
  UpdateDatos();//Actualizo los datos
}
//------------------------------------------------------------------

//----------------------------------------------------------------------
function hashear(contraseñaMaestra) {
  //le paso a python eso
  //Opciones para utilizar el python-shell
  let options = {
    mode: 'text',
    pythonPath: path.join(__dirname, '../py/env/Scripts/python.exe'),//'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: path.join(__dirname, '../py'),//'path/to/my/scripts',
    args: [contraseñaMaestra]
  };
  return new Promise((resolve, reject) => {//Con esto obligo al codigo a esperarse a que python termine
    try {
      PythonShell.run('generateKey.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        key = results[0];
        resolve();
      });
    }
    catch {
      console.log('error running python code')
      reject();
    }
  })
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
function generarContraseña() {
  //Opciones para utilizar el python-shell
  let options = {
    mode: 'text',
    pythonPath: path.join(__dirname, '../py/env/Scripts/python.exe'),//'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: path.join(__dirname, '../py'),//'path/to/my/scripts',
  };
  //Limpio el input de contraseña de cuenta y permito modificarla
  ModificarPasswdInput("", "", false, "text");

  PythonShell.run('GenerarPasswd.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    passwdInput.value = results;
  });
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
function descrifrarContraseña() {
  //Hago visible la contraseña en el input
  let passwd = passwdInput.value;
  ModificarPasswdInput(passwd, "", true, "text");
  DeshabilitarBotones(true, false, true, true, true, true, false, true);

}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
function eliminarCuenta() {
  let sitio;
  sitio = sitioInput.value;
  const index = datos.findIndex(x => x.Sitio === sitio);
  //Encuentro el index del elemento que sea del mismo sitio y lo elimino
  if (index !== undefined) datos.splice(index, 1);
  activarMenu("EliminarCuenta");
  UpdateDatos();
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
function agregarCuenta() {
  //Activo el menu para agregar una cuenta
  activarMenu("AgregarCuenta");
}

function modificar() {
  //Permito la edición del campo de contraseña
  ModificarPasswdInput(passwdInput.value, "", false, "text");
  //Habilito el botón de "generar contraseña" y "guardar"
  DeshabilitarBotones(true, true, true, true, false, false, true, true);
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
function cifrarJSON(param) {
  //Le paso la llave y cifro lo que tenga guardado en la variable datos, 
  //asumo que el archivo a donde voy a sobreescribir ya existe
  let options = {
    mode: 'text',
    pythonPath: path.join(__dirname, '../py/env/Scripts/python.exe'),//'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: path.join(__dirname, '../py'),//'path/to/my/scripts',
    args: [key, JSON.stringify(datos)]
  };

  return new Promise((resolve, reject) => {//Asi obligo a esperar a que termine python

    try {
      PythonShell.run('cifrarJson.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        resolve();
      });
    }
    catch {
      console.log('error running python code')
      reject();
    }
  })

}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
function descifrarJSON(param) {
  //Python
  //Este lo llamo cuando la llave y se encarga de leer el archivo si existe o crearlo si no existe
  //si no hay archivo lo crea y me regresa uno arreglo vació. 
  let options = {
    mode: 'text',
    pythonPath: path.join(__dirname, '../py/env/Scripts/python.exe'),//'path/to/python',
    pythonOptions: ['-u'], // get print results in real-time
    scriptPath: path.join(__dirname, '../py'),//'path/to/my/scripts',
    args: [key]
  };

  return new Promise((resolve, reject) => {
    try {
      PythonShell.run('descifrarJson.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        try {//Si esto truena es que no pudo descifrar i.e. contraseña incorrecta
          datos = JSON.parse(results);
          resolve();
        } catch {
          resolve();
        }
      });
    }
    catch {
      console.log('error running python code')
      reject();
    }
  })
}
//----------------------------------------------------------------------

//----------------------------------------------------------------------
function cambiarPasswdMaestra() {
  //pido la nueva nueva llave, solo es cambiar la variable key y volver a llamar cifrarJSON() y descifrarJSON()
  DeshabilitarBotones(true, true, true, true, true, true, true, false);
  bloquearInputs();
  ModificarMasterInput("", "Nueva Contraseña Maestra", false, "password");
}

//----------------------------------------------------------------------

//FUNCIONES DE UTILIDAD (No hacen más que reducir el número de lineas)
//----------------------------------------------------------------------
//Esta función bloquea los inputs, se llama después de cada cambio, 
//es una manera de "regresar" al menu principal
function bloquearInputs() {
  ModificarSitioInput("", "", true);
  ModificarCuentaInput("", "", true);
  ModificarPasswdInput("", "", true, "text");
  ModificarMasterInput("", "", true, "text");
}

//Esta función desbloquea inputs y coloca placeholders de acuerdo a lo que vas a hacer
function activarMenu(opcion) {
  switch (String(opcion)) {
    case "AgregarCuenta":
      ModificarSitioInput("", "Nuevo Sitio", false);
      ModificarCuentaInput("", "Nueva Cuenta", false);
      ModificarPasswdInput("", "Nueva Contraseña", false, "text");
      DeshabilitarBotones(true, true, true, true, false, false, true, true);
      break;

    case "CambiarContraseña":
      ModificarSitioInput("", "", true);
      ModificarCuentaInput("", "", true);
      ModificarPasswdInput("", "Escribe la nueva contraseña", false);
      DeshabilitarBotones(true, true, true, true, false, false, true, true);
      break;

    case "EliminarCuenta":
      bloquearInputs();
      DeshabilitarBotones(false, false, true, true, true, true, true, true);
      break;

    case "Guardar":
      bloquearInputs();
      DeshabilitarBotones(false, false, true, true, true, true, true, true);
      break;
    default:
      console.log("La estás pidiendo con algo mal compa")
  }
}

//Estas tres funciones modifican los inputs de acuerdo a los parametros que les pase
//valor (string): Que ya van a tener escrito
//placeholder (string): La "guía" que van a mostrar
//readOnly (Boolean): Si se pueden modificar o no.
function ModificarSitioInput(valor, placeholder, readOnly) {
  sitioInput.value = valor;
  sitioInput.placeholder = placeholder;
  sitioInput.readOnly = readOnly;
}
function ModificarCuentaInput(valor, placeholder, readOnly) {
  cuentaInput.value = valor;
  cuentaInput.placeholder = placeholder;
  cuentaInput.readOnly = readOnly;
}
function ModificarPasswdInput(valor, placeholder, readOnly, type) {
  passwdInput.value = valor;
  passwdInput.placeholder = placeholder;
  passwdInput.readOnly = readOnly;
  passwdInput.type = type;
}

function ModificarMasterInput(valor, placeholder, readOnly, type) {
  masterInput.value = valor;
  masterInput.placeholder = placeholder;
  masterInput.readOnly = readOnly;
  masterInput.type = type;
}

//Esta funcion activa y desactiva según lo que yo le diga
//Todos sus parametros son booleans
function DeshabilitarBotones(agregar, cambiar, descifrar, eliminar, generar, guardar, modificar, acceder) {
  btnAgregar.disabled = agregar;
  btnCambiar.disabled = cambiar;
  btnDescifrar.disabled = descifrar;
  btnEliminar.disabled = eliminar;
  btnGenerar.disabled = generar
  btnGuardar.disabled = guardar;
  btnModificar.disabled = modificar;
  btnAcceder.disabled = acceder;
}

//----------------------------------------------------------------------