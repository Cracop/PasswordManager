# -*- coding: utf-8 -*-
"""
Created on Tue Feb 16 09:42:09 2021

@author: sanch
"""

from cryptography.fernet import Fernet, InvalidToken
import json
import sys

def decryptionJSON(key):
    input_file = 'db.encrypted'
    
    try:#Intento desencriptar
        with open(input_file, 'rb') as f:
            data = f.read() #Lee lo encriptado 
        fernet = Fernet(key)#crea el fernet con la llave
        try:#intento desencriptar
            decrypted = fernet.decrypt(data)#Lo desencripto
            s=str(decrypted,'utf-8')#Convierte lo desencriptado a str
            lst=json.loads(s)#convierte el str a una lst
            jsonStr=json.dumps(lst)#convierte la lista a json
            return jsonStr #regreso el objeto json
        except InvalidToken: #llave incorrecta
            print("Invalid Key - Unsuccessfully decrypted")
    except FileNotFoundError: #No existe el archivo
        jsonStr=[]
        return jsonStr

key = sys.argv[1]
print(decryptionJSON(key))
sys.stdout.flush()