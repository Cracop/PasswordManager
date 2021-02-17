const { app, Menu, BrowserWindow } = require('electron')
//const {BrowserWindow} = require('electron').remote
const path = require('path')
const url = require("url")


let MainWindow;

//Funcion que crea una ventana
function createWindow() {
  //Defino la página principal
  MainWindow = new BrowserWindow({
    title: "gestor_contraseñas",
    width: 775,
    height: 790,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  })
  //Cargo un archivo en la ventana
  MainWindow.loadFile("app/index.html")

  //Creo un menu
  var menu = Menu.buildFromTemplate([
    {
      label: "opciones",
      submenu: [
        {
          label: "Salir",
          click: () => {
            //app.quit();
            MainWindow.loadFile("app/index.html")
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
}

app.allowRendererProcessReuse = true



//Comienzo la aplicación
app.whenReady().then(createWindow)

//Si 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

//Si activo el app y no hay ventanas abiertas, creo una
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

