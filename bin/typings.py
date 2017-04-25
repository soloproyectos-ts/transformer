#!/usr/bin/env python

"""Installs or updates type definition files"""

import subprocess

PACKAGES_DIR = '/home/gonzalo/Projects/soloproyectos/ts/packages'
DEF_TYPES = [
    {
        'source': 'file:' + PACKAGES_DIR + '/matrix2/build/matrix2.d.ts',
        'global': False
    }
]

def install_def_types():
    """Install definition types"""
    for i in DEF_TYPES:
        subprocess.call(
            ['typings', 'install', i['source']] + ['--global'] * i['global']
        )

print 'Installing type definition files...'
install_def_types()
