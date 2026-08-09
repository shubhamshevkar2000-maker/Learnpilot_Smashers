import re
import sys

def clean_file(path, keep_ours=True):
    try:
        with open(path, 'r') as f:
            content = f.read()
    except:
        return
    pattern = re.compile(r'<<<<<<< ours\n(.*?)(?:\|\|\|\|\|\|\|.*?\n.*?)?=======\n(.*?)>>>>>>> theirs\n?', re.MULTILINE | re.DOTALL)
    def replacer(match):
        return match.group(1) if keep_ours else match.group(2)
    resolved = pattern.sub(replacer, content)
    with open(path, 'w') as f:
        f.write(resolved)

# keep ours (main branch)
clean_file('types/database.types.ts', True)
clean_file('lib/services/notes-service.ts', True)

# keep theirs (Phase 3.5)
ui_files = [
    'app/ai-coach/page.tsx', 
    'app/assessments/page.tsx', 
    'app/courses/page.tsx',
    'app/journey/page.tsx', 
    'app/progress/page.tsx', 
    'app/path/page.tsx'
]
for f in ui_files:
    clean_file(f, False)

print("Final clean complete")
