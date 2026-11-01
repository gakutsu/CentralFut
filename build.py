#!/usr/bin/env python3
"""Gera o bundle clássico para abrir index.html por file://, sem dependências."""
from pathlib import Path
import re
import subprocess

root=Path(__file__).resolve().parent
p=root/'src'
engine=(p/'competition.js').read_text(encoding='utf-8')
app=(p/'app.js').read_text(encoding='utf-8')

# O import pode ocupar várias linhas. Seu identificador deve estar disponível
# em competition.js; não pode restar uma declaração de módulo no bundle clássico.
imports=re.findall(r"^import\s*\{[\s\S]*?\}\s*from\s*['\"][^'\"]+['\"]\s*;",app,flags=re.M)
if len(imports)!=1:
    raise SystemExit(f'Esperado um único import de módulos, encontrados {len(imports)}')
app=app.replace(imports[0], '', 1)
engine=re.sub(r'^export\s+', '', engine, flags=re.M)

bundle='/* CentralFut 2026 — bundle offline, gerado por build.py. */\n(()=>{\n\"use strict\";\n'+engine+'\n'+app+'\n})();\n'
if re.search(r'^\s*(?:import|export)\s',bundle,flags=re.M):
    raise SystemExit('O bundle não pode conter import/export: modo offline incompatível')
(p/'bundle.js').write_text(bundle,encoding='utf-8')
subprocess.run(['node','--check',str(p/'bundle.js')],check=True)
print(f'Bundle gerado e validado: {p/"bundle.js"} ({len(bundle):,} caracteres)')
