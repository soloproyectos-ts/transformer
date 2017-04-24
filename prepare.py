#!/usr/bin/env python
import subprocess

print 'Intalling Type Definition files...'
sources = ['github:soloproyectos-ts/matrix2/dist/matrix2.d.ts#0.0.1']
for source in sources:
    subprocess.call(['typings', 'install', source])
