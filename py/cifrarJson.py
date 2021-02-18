# -*- coding: utf-8 -*-
"""
Created on Tue Feb 16 09:38:16 2021

@author: sanch
"""

import json
import os
import sys
from cryptography.fernet import Fernet

#El metodo recibe una lista de diccionarios o JSONs
#Si esta vacía, crea el archivo JSON
#Si no esta vacia, solo cifra 
def encryptionJSON(key, lista):
    output_file = 'db.encrypted'
    input_file = "db.json"
    
    if len(lista)==0:#Si la lista que me pasan está vacía significa que no hay ningún dato
        os.remove("db.encrypted")#Borro el archivo entonces
        output_file = 'db.json'
        with open(output_file, 'wb') as f:#Lo creo vacio
            pass
    else: 
        with open(input_file, "w") as outfile:  
            json.dump(lista, outfile)#Agarra lo de lista y lo tiro en el json
        with open(input_file, 'rb') as f:
            data=f.read() #aquí leo el json
        fernet = Fernet(key) #Crea lo que cifra
        encrypted = fernet.encrypt(data)#aquí encripta data
        with open(output_file, 'wb') as f:
            f.write(encrypted) #tira el encriptado en un nuevo archivo
    try:
        os.remove("db.json")#quito el desencriptado
    except:
        

key = sys.argv[1] #tomo el hash
lst = json.loads(sys.argv[2]) #Paso de string a json

encryptionJSON(key, lst)
sys.stdout.flush()