import os

lambda_dir = "c:/Users/akhan/Downloads/MaatriSahayak/lambda_functions"
for root, dirs, files in os.walk(lambda_dir):
    for file in files:
        if file == "constants.py":
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            if "'ASSESS_RISK': 'maatrisahayak-assess-risk'" in content:
                content = content.replace(
                    "'ASSESS_RISK': 'maatrisahayak-assess-risk'", 
                    "'ASSESS_RISK': 'maatrisahayak-assess-risk-v2'"
                )
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {filepath}")
