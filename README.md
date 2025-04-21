How this all works:

telnet.js - Makes use of node-telnet-client to connect to a device, given params, and send a command.
extron_hdmi_switch.js - Functions tailored to the Extron SWX line of HDMI switchers
extron_crosspoint_matrix.js - Functions tailored to the Extron Crosspoint HVA line of RGB matrix switchers
server.js - Loads data from extron.json about the types of devices used and what I/O exists.
Provides endpoints for triggering device functions.
Also serves Remote.html.

Remote.html - Renders buttons to a webpage for choosing inputs, muting, and other tasks.
Those buttons hit the endpoints on server.js to trigger new behavior.
/img - Directory of images used for the webpage.


Next work: Add an HTML page with the following:
For every game console, a button that is a href to /inputs/:input_id/select for that button's ID
And add a setInterval that fetches and renders key data in the HTML.