"""Check PR-0 local Markdown links and immutable visual baseline."""
import hashlib
import re
from pathlib import Path
root = Path(__file__).resolve().parents[1]
errors = []
for path in root.rglob('*.md'):
    if '.git' in path.parts:
        continue
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', path.read_text()):
        if '://' in target or target.startswith('#'):
            continue
        if not (path.parent / target.split('#')[0]).exists():
            errors.append(f'{path.relative_to(root)}: missing {target}')
audit = (root / 'docs/PR0_AUDIT.md').read_text()
expected = re.search(r'SHA-256: `([a-f0-9]{64})`', audit).group(1)
actual = hashlib.sha256((root / 'reference/BAMAS-desain-aplikasi-donasi.html').read_bytes()).hexdigest()
if actual != expected:
    errors.append('Visual baseline checksum mismatch')
if errors:
    raise SystemExit('\n'.join(errors))
print('PASS: local Markdown links and visual baseline SHA-256')
