# Enertiv API Demo

Working example for using the Enertiv API.

## Requirements

The Enertiv API Demo is written in Python for the web server and JavaScript for the example. For more info on installing Python `https://www.python.org/downloads/`.  Python packages are managed with Pip, more info can be found here: `http://pip.readthedocs.org/en/latest/installing.html`.  Git is required for cloning the repository: `https://help.github.com/articles/set-up-git/`


## Getting Started
Run the code to the right of the `$` in your terminal or command prompt.  The (api_demo) indicates that your command prompt is in the api_demo virtual environment.

### Enertiv API Registration
To get your credentials for the Enertiv API and see live data: `http://bit.ly/1LMKTlm`

`bash`

    $ git clone git@bitbucket.org:enertiv/enertiv_api_demo.git
    $ cd enertiv_api_demo
    # If not already present install virtualenv and virtualenvwrapper to your system
    $ pip install virtualenv
    $ pip install virtualenvwrapper  
    # or for windows users 
    $ pip install virtualenvwrapper-win


    # fire up your virtual environment
    $ mkvirtualenv api_demo

    # Install requirements
    (api_demo)$ pip install -r requirements.txt

    # Run the proxy server
    # With canned data:
    (api_demo)$ python app.py

    # With Enertiv Credentials
    (api_demo)$ python app.py SERVER_NAME SERVER_PASSWORD CLIENT_ID CLIENT_SECRET

## Inspiration

This D3 code was borrowed from a couple fantastic examples: `http://www.jasondavies.com/coffee-wheel/` and `http://bl.ocks.org/kerryrodden/477c1bfb081b783f80ad`