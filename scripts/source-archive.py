"""Create a sanitized, redistributable source archive without local state."""
from pathlib import Path
import json, zipfile
root=Path(__file__).resolve().parent.parent
out=root/'public/openquiz-source.zip'
include=['app','build','components','db','drizzle','hooks','lib','public','scripts','tests','vendor']
files=[p for d in include for p in (root/d).rglob('*') if p.is_file() and p!=out and '__pycache__' not in str(p)]
files += [p for p in root.iterdir() if p.is_file() and p.name not in ['.DS_Store'] and not p.name.startswith('.env')]
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(set(files)):
  z.write(p,'openquiz/'+str(p.relative_to(root)))
 z.writestr('openquiz/.openai/hosting.json',json.dumps({'d1':'DB','r2':None},indent=2)+'\n')
print(f'Created {out.name}: {out.stat().st_size:,} bytes, {len(files)+1} files')
