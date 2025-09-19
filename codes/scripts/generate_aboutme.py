import yaml
from jinja2 import Environment, FileSystemLoader

# Load data from YAML file
with open("../data/aboutme.yml", "r") as file:
    data = yaml.safe_load(file)

# Set up Jinja2 environment
env = Environment(loader=FileSystemLoader("../templates/"))

# Load the template file
template = env.get_template("aboutme.html")

# Render the template with data
output = template.render(data)

# Write the rendered HTML to a file
with open("../../pages/aboutme.html", "w") as file:
    file.write(output)

print("Webpage generated successfully as 'output.html'.")
