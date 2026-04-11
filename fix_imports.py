import os
import re

def fix_imports(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                # Regex to find relative imports without extensions
                # It looks for: from './something' or from '../something'
                # and ensures it doesn't already have an extension like .js, .css, .scss, .json
                new_content = re.sub(
                    r"from '(\.\.?\/[^']+)(?<!\.js)(?<!\.css)(?<!\.scss)(?<!\.json)'",
                    r"from '\1.js'",
                    content
                )
                
                if new_content != content:
                    with open(path, 'w') as f:
                        f.write(new_content)
                    print(f"Fixed imports in {path}")

if __name__ == "__main__":
    fix_imports('src')
    # Also fix server.ts if it has relative imports
    if os.path.exists('server.ts'):
        with open('server.ts', 'r') as f:
            content = f.read()
        new_content = re.sub(
            r"from '(\.\.?\/[^']+)(?<!\.js)(?<!\.css)(?<!\.scss)(?<!\.json)'",
            r"from '\1.js'",
            content
        )
        if new_content != content:
            with open('server.ts', 'w') as f:
                f.write(new_content)
            print(f"Fixed imports in server.ts")
