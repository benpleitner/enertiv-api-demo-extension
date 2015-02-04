# Enertiv API Demo
Working example for using the Enertiv API.

## Requirements
The Enertiv API Demo is written in Python for the server-side and JavaScript for the client-side example. 
* For more info on installing Python `https://www.python.org/downloads/`.
* Python packages are managed with Pip, more info can be found here: `http://pip.readthedocs.org/en/latest/installing.html`.
* The web server is Flask `http://flask.pocoo.org/`
* Git is required for cloning the repository: `https://help.github.com/articles/set-up-git/`


## Getting Started
Run this code in your terminal or command prompt to get the environment ready.


```bash
git clone git@bitbucket.org:enertiv/enertiv_api_demo.git
cd enertiv_api_demo

# If not already present install virtualenv and virtualenvwrapper to your system
pip install virtualenv
pip install virtualenvwrapper  

# or for windows users 
pip install virtualenvwrapper-win

# fire up your virtual environment
$ mkvirtualenv api_demo

# Install requirements
pip install -r requirements.txt
```


## Running the web server

The example can be run with canned data, but will hit the API for live data:

`python app.py`

To run the service with with your Enertiv credentials (Requires Enertiv API Registration):

`python app.py SERVER_NAME SERVER_PASSWORD CLIENT_ID CLIENT_SECRET`

### Enertiv API Registration
To get your credentials for the Enertiv API and see live data: `http://bit.ly/1LMKTlm`

## Inspiration
This D3 code was borrowed from a couple fantastic examples: `http://www.jasondavies.com/coffee-wheel/` and `http://bl.ocks.org/kerryrodden/477c1bfb081b783f80ad`