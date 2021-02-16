# -*- coding: utf-8 -*-
"""
Created on Tue Feb 16 09:36:24 2021

@author: sanch
"""
import base64
import sys
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


def generateKey(pswd):
    password = pswd.encode()  
    salt = b'\x94+\x19\x0bF1\x10\xe0\xe0#\x16\xcd\x7f\x86pg'
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))  
    return key



print(generateKey(sys.argv[0]).decode("utf-8"))
sys.stdout.flush()
