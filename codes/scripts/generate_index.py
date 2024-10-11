# This is a python script to generate index.html in root folder
import os
import yaml
from jinja2 import Environment, FileSystemLoader
# Load the configuration
with open("code_config.yml", "r") as file:
    config = yaml.safe_load(file)

root_path = config["root_path"]
css_path = config["css_path"]
templates_path = config["templates_path"]
template = "index.html"

# set up jinja2 environment
env = Environment(loader=FileSystemLoader(templates_path+template))
