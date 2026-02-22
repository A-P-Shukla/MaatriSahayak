import yaml
from pathlib import Path

yaml_file = 'c:/Users/akhan/Downloads/MaatriSahayak/infrastructure/template.yaml'
with open(yaml_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_globals = False

for line in lines:
    if line.strip() == 'Globals:':
        in_globals = True
    elif in_globals and line.startswith('Resources:'):
        in_globals = False

    if in_globals and line.strip() == 'Runtime: python3.12':
        # Skip this global runtime rule
        continue
    
    new_lines.append(line)
    
    # Inject Runtime into individual zipped Lambda functions
    if line.strip().startswith('Handler:') or line.strip().startswith('CodeUri:'):
        # Let's just insert Runtime right after PackageType (if missing) or Handler
        pass # Better way: we'll match Handler: handler.lambda_handler and insert Runtime below it

final_lines = []
for line in new_lines:
    final_lines.append(line)
    if 'Handler: handler.lambda_handler' in line:
        indent = line[:len(line) - len(line.lstrip())]
        final_lines.append(f"{indent}Runtime: python3.12\n")

with open(yaml_file, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)
print("Updated template.yaml")
