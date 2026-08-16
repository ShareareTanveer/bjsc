import json

# File containing the NEW fields
new_fields_file = r"C:\Users\admin\Desktop\bjsc prep\clean_output_tagged.json"

# Original file containing options, answers, explanations, etc.
original_file = r"C:\Users\admin\Desktop\bjsc prep\output.json"

# Final merged file
output_file = r"C:\Users\admin\Desktop\bjsc prep\merged_output.json"


with open(new_fields_file, "r", encoding="utf-8") as f:
    new_data = json.load(f)

with open(original_file, "r", encoding="utf-8") as f:
    original_data = json.load(f)


# Create lookup:
# (exam, year, question id) -> new fields
new_lookup = {}

for exam in new_data:
    exam_name = exam.get("exam")
    year = exam.get("year")

    for question in exam.get("questions", []):
        question_id = question.get("id")

        if question_id is not None:
            new_lookup[(exam_name, year, question_id)] = question


# Merge new fields into original data
merged_count = 0
not_found = 0

for exam in original_data:
    exam_name = exam.get("exam")
    year = exam.get("year")

    for question in exam.get("questions", []):
        question_id = question.get("id")

        key = (exam_name, year, question_id)

        if key in new_lookup:
            new_question = new_lookup[key]

            # Add/update fields from the new file
            for field, value in new_question.items():
                if field not in ("id", "question"):
                    question[field] = value

            merged_count += 1
        else:
            not_found += 1


# Save merged file
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(
        original_data,
        f,
        ensure_ascii=False,
        indent=2
    )


print("Merge completed!")
print(f"Questions updated: {merged_count}")
print(f"Questions without matching new data: {not_found}")
print(f"Saved to: {output_file}")