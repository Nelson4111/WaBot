import os
import shutil
import zipfile

def build_mod_jar():
    compiled_dir = 'compiled_classes'
    printer_src = 'printer_src'
    mixins_json = os.path.join('decompiled_printer', 'litematica-printer.mixins.json')
    target_jar = r'C:\Users\aqana\AppData\Roaming\.minecraft\mods\litematica-printer-26.2-3.2.2.jar'
    backup_jar = r'C:\Users\aqana\AppData\Roaming\.minecraft\mods\litematica-printer-26.2-3.2.2.jar.bak'

    print("Copying compiled classes into printer_src...")
    shutil.copytree(compiled_dir, printer_src, dirs_exist_ok=True)

    print("Copying mixin configuration...")
    shutil.copy(mixins_json, os.path.join(printer_src, 'litematica-printer.mixins.json'))

    if not os.path.exists(backup_jar):
        print(f"Creating backup of original jar: {backup_jar}")
        shutil.copy(target_jar, backup_jar)

    print(f"Packaging new JAR to: {target_jar}")
    with zipfile.ZipFile(target_jar, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(printer_src):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, printer_src)
                z.write(filepath, arcname)

    print("JAR package build complete successfully!")

if __name__ == '__main__':
    build_mod_jar()
