#%%Imports
import string
import random
import sys

#%%Variables que contienen todas las posibilidades
Letras = string.ascii_letters
Numeros = string.digits  
Simbolos = string.punctuation 

#%%Funciones que generan password
def generaPasswd(length=11):
    '''
    Genera un random passwd del largo especificado
    :length -> Tamaño del passwd que se va a generar. El default es 11 
        si nada se especifica.
    :regresa un string
    '''
    # Creo un string gigante con todos los caracteres posibles
    poblacion=Letras+Numeros+Simbolos

    # Convierto el string gigante en una lista y cambio los lugares aleatoriamente
    poblacion = list(poblacion)
    random.shuffle(poblacion)

    #Genero una contraseña random y lo convierto en un string
    #random.choices(universo, elementos a elegir)
    randomPasswd = random.choices(poblacion, k=length)
    randomPasswd = ''.join(randomPasswd)
    return randomPasswd

#%%Entrada a la aplicación
#if __name__ == '__main__':
    #print(generaPasswd())
print(generaPasswd())
sys.stdout.flush()