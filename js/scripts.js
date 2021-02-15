//Variables Globales
var Tabulator = require('tabulator-tables');//Se usa para la tabla de info
const fs = require("fs");//Para modificar el JSON
const path = require('path');//Para obtener la ruta
let {PythonShell} = require('python-shell')//Python shell que utilizo para correr python
const pth = path.join(__dirname, '../Data/data.json');//La ruta donde está el JSON

var changedPassword = ""; //Con esto evito volver a guardar los datos si solo quería ver la contraseña
var datos = [];//El array donde van todos los objetos JSON
var rawdata; //Los datos del JSON sin parsear
var hasPreviousPasswd; //Bandera que me dice si ya tengo elementos cifrados
var key;
var table;
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

//----------------------------------------------------------------------------
//Trato de leer el archivo que contiene las contraseñas, sino existe lo creo
try{
  rawdata = fs.readFileSync(pth, "");
  datos = JSON.parse(rawdata);
  hasPreviousPasswd=true;
}catch{
  console.log("Existe el archivo pero está vacio");
  hasPreviousPasswd=false;
  fs.writeFileSync(pth, "")
};
//Inicio con Inputs Bloqueados AKA Menú Principal

bloquearInputs();
ModificarMasterInput("", "Escribe tu Contraseña Maestra", false, "password")
//Inicialmente solo puedo cambiar la contraseña maestra o agregar una nueva cuenta,
//para acceder a una cuenta en especifico la selecciono en la tabla
DeshabilitarBotones(true, true, true, true, true, true, true, false);
//------------------------------------------------------------------------------
//Funcion que voy a llamar cada vez haga una modificación
function UpdateDatos(){
  datos = JSON.stringify(datos);
  fs.writeFileSync(pth, datos)
  try{
    rawdata = fs.readFileSync(pth, "");
    datos = JSON.parse(rawdata);
    hasPreviousPasswd=true;
  }catch{
    hasPreviousPasswd=false;
    datos=[];
  }
  DeshabilitarBotones(false, !hasPreviousPasswd, true, true, true, true, true, true);

  //Checo si ya hay una contraseña pasada
  if (datos.length===0){
    hasPreviousPasswd=false;
    btnCambiar.disabled=true;
  }else{
    hasPreviousPasswd=true; //Ya hay datos cifrados previamente y tengo que pedir esa contraseña para 
    btnCambiar.disabled=false;
}
  table.replaceData(datos);
}


//create Tabulator on DOM element with id "tabla-datos"


function cambiarContraseñaMaestra(){   
  activarMenu("CambiarContraseña")
}

function acceder(){
  if (masterInput.value!==""){
    DeshabilitarBotones(false, !hasPreviousPasswd, true, true, true, true, true, true);

      table = new Tabulator("#tabla-datos", {
      height:380, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
      data:datos, //assign data to table
      layout:"fitColumns", //fit columns to width of table (optional)
      selectable:1, //make rows selectable
      columns:[ //Define Table Columns
        {title:"Sitio", field:"Sitio"},
        {title:"Cuenta", field:"Cuenta"},
        
      ],
      rowClick:function(e, row){ //trigger an alert message when the row is clicked
        //alert("Row " + row.getData().Contraseña + " Clicked!!!!");
        ModificarSitioInput(row.getData().Sitio, "cuentaYaExiste", true);
        ModificarCuentaInput(row.getData().Cuenta, "", true);
        ModificarPasswdInput(row.getData().Contraseña, "", true, "password");
        ModificarMasterInput("","",true, "password");
        DeshabilitarBotones(false, true, false, false, true, true, true, true);
      },
    });
  }
}
function guardarDatos(){
  var update;
  let sitio, cuenta, passwd;
  sitio = sitioInput.value;
  cuenta= cuentaInput.value;
  passwd=passwdInput.value;
  
  if (cuentaInput.placeholder==="Introduce la Contraseña Maestra anterior" && sitioInput.placeholder==="Introduce la nueva Contraseña Maestra"){
    //Aqui llamo a la función que vuelve a cifrar todo
    console.log("Tengo que cifrar todo")
  } else{
    if (cuenta!=="" && sitio!=="" && passwd!==""){
      update = {Sitio: sitio, Cuenta: cuenta, Contraseña: passwd}
      console.log(changedPassword, passwd);
      if (sitioInput.placeholder==="cuentaYaExiste" && changedPassword!==passwd){
        const index = datos.findIndex(x => ((x.Sitio === sitio && x.Cuenta === cuenta))); 
        if (index !== undefined) datos.splice(index, 1);
        datos.push(update);
       }else{
        if(changedPassword!==passwd) datos.push(update);
       }
     
      }
    table.replaceData(datos);
  }
  activarMenu("Guardar");
  UpdateDatos();
  changedPassword="";
}

function hashear(clave){
  let hash;
  return hash;
}

function generarContraseña(){
  //Opciones para utilizar el python-shell
  let options = {
  mode: 'text',
  pythonPath: path.join(__dirname, '../py/env/Scripts/python.exe'),//'path/to/python',
  pythonOptions: ['-u'], // get print results in real-time
  scriptPath: path.join(__dirname, '../py'),//'path/to/my/scripts',
  //args: ['value1', 'value2', 'value3']
  };
  //Genero una contraseña y la coloco (python)
  console.log("Genero una nueva contraseña")
  ModificarPasswdInput("", "", false, "text");

  PythonShell.run('GenerarPasswd.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    passwdInput.value=results;
  });
}

function descrifrarContraseña(){
  //Leo la contraseña y la descifro (python)
  let passwd=passwdInput.value;
  changedPassword = passwd;
  if (key!==""){
    //passwd = descifrar(passwd, key);//Aqui llamo a python para descifrar
    ModificarPasswdInput(passwd, "", true, "text");
    DeshabilitarBotones(true, true, true, true, true, true, false, true);
  }
  
}

function eliminarCuenta(){
  //Uso js para eliminar del json
  let sitio;
  sitio = sitioInput.value;
  
  const index = datos.findIndex(x => x.Sitio === sitio); //Encuentro el index del elemento que sea del mismo sitio
  if (index !== undefined) datos.splice(index, 1);
  console.log("After removal:", datos);
  activarMenu("EliminarCuenta");
  UpdateDatos();
}


function agregarCuenta(){
  //Modifico inputs
  activarMenu("AgregarCuenta");

}

function modificar(){
  ModificarPasswdInput(passwdInput.value, "", false, "text");
  DeshabilitarBotones(true, true, true, true, false, false, false, true);
}

//Esta función bloquea los inputs, se llama después de cada cambio, 
//es una manera de "regresar" al menu principal
function bloquearInputs(){
  ModificarSitioInput("", "", true);
  ModificarCuentaInput("", "", true);
  ModificarPasswdInput("", "", true, "text");
  ModificarMasterInput("","",true, "text");
}

//Esta función desbloquea inputs y coloca placeholders de acuerdo a lo que vas a hacer
function activarMenu(opcion){
  switch (String(opcion)){
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

    case "DescrifarContraseña":
      break;
    case "EliminarCuenta":
      bloquearInputs();
      DeshabilitarBotones(false, false, true, true, true, true, true, true);
      break;
    case "GenerarContraseña":
      break;
    case "Guardar":
      bloquearInputs();
      DeshabilitarBotones(false, false, true, true, true, true, true, true);
      break;
    default:
      console.log("La estás pidiendo con algo mal compa")
  }
}

function pedirPasswdMaestra(){

}

function descrifrar(mensaje, key){

}

function cifrar(mensaje, key){

}

//Estas tres funciones modifican los inputs de acuerdo a los parametros que les pase
//valor (string): Que ya van a tener escrito
//placeholder (string): La "guía" que van a mostrar
//readOnly (Boolean): Si se pueden modificar o no.
function ModificarSitioInput(valor, placeholder, readOnly){
  sitioInput.value=valor;
  sitioInput.placeholder=placeholder;
  sitioInput.readOnly = readOnly;
}
function ModificarCuentaInput(valor, placeholder, readOnly){
  cuentaInput.value=valor;
  cuentaInput.placeholder=placeholder;
  cuentaInput.readOnly = readOnly;
}
function ModificarPasswdInput(valor, placeholder, readOnly, type){
  passwdInput.value=valor;
  passwdInput.placeholder=placeholder;
  passwdInput.readOnly = readOnly;
  passwdInput.type = type;
}

function ModificarMasterInput(valor, placeholder, readOnly, type){
  masterInput.value=valor;
  masterInput.placeholder=placeholder;
  masterInput.readOnly = readOnly;
  masterInput.type = type;
}

//Esta funcion activa y desactiva según lo que yo le diga
//Todos sus parametros son booleans
function DeshabilitarBotones(agregar, cambiar, descifrar, eliminar, generar, guardar, modificar, acceder){
  btnAgregar.disabled=agregar;
  btnCambiar.disabled=cambiar;
  btnDescifrar.disabled=descifrar;
  btnEliminar.disabled=eliminar;
  btnGenerar.disabled=generar
  btnGuardar.disabled=guardar;
  btnModificar.disabled=modificar;
  btnAcceder.disabled=acceder;
}