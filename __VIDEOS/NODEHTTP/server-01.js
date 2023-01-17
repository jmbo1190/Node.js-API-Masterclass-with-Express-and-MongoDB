const http = require('http');  // core node module - no npm install needed
const { exec } = require("child_process");

// utility funtion to execute shell command and log the outputs
const shellCommand = (cmd => {
    console.log("Executing command: ", cmd);
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr:\n${stderr}`);
            return;
        }
        console.log(`stdout:\n${stdout}`);
    });
});
// shellCommand("ls -la");


const todos = [
    {id:1, text: "TODO One"},
    {id:2, text: "TODO Two"},
    {id:3, text: "TODO Three"},
]

const server = http.createServer((req, res) => {
    const { headers, url, method } = req;
    console.log(headers, url, method);

    let body = [];

    req.on("data", (chunk) => {
        body.push(chunk);
    }).on("end", () => {
        body = Buffer.concat(body).toString();
        console.log("body:\n", body);
    })



    let ok = true;  // change the type of response
    let ctnt;
    if (["/html", "/text", "/json"].indexOf(url) !== -1) { 
        ctnt = url.slice(1);
        ok = true;
    } else {
        ok = false;
        ctnt = "json";
    }
    if (ok) {
        // Return default status 200 - OK
        res.setHeader('X-Powered-By', 'Node.js');
        if (ctnt === "html") {
            res.setHeader('Content-Type', 'text/html'); // make the browser render html tags
            res.write("<h1>Hello</h1>");
            res.write("<h2>Hello Again</h2>");
            res.end();  // send a response to avoid client hanging 

        } else if (ctnt === "text") {
            res.setHeader('Content-Type', 'text/plain'); // make the browser display html tags as text
            res.write("<h1>Hello</h1>");
            res.write("<h2>Hello Again</h2>");
            res.end();  // send a response to avoid client hanging 

        } else if (ctnt === "json") {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                success: true,
                data: todos, 
            }));  // send a response to avoid client hanging     
        }

    } else {
        if (url === "/protected"){
            if (req.headers.authorization) {
                console.log("req.headers.authorization:\n", req.headers.authorization);
                res.end();
            } else {
                // Return 401 Status - Unauthorized
                res.writeHead(401, {
                    'X-Powered-By': 'Node.js',
                    'Content-Type': 'application/json',
                });
                res.end(JSON.stringify({
                    success: false,
                    error: "Not authorized",
                    data: null, 
                }));  // send a response to avoid client hanging 

            }
            
        } else if (url.match(/^\/register/)){
            if (url.match(/^\/register\?(.+\&)?email=\w+@(\w+\.)+\w+/)) {
                // Return 204 - Successfull, no content
                res.writeHead(204, {
                    'X-Powered-By': 'Node.js',
                    'Content-Type': 'application/json',
                });
                res.end();

            } else {
                // Return 400 Status - Bad request
                res.writeHead(400, {
                    'X-Powered-By': 'Node.js',
                    'Content-Type': 'application/json',
                });
                res.end(JSON.stringify({
                    success: false,
                    error: "Please provide valid e-mail",
                    data: null, 
                }));  // send a response to avoid client hanging 

            }
        } else {
            // Return 404 Status - resource not found
            /*
            // basic way to set headers
            res.statusCode = 404;
            res.setHeader('X-Powered-By', 'Node.js');
            res.setHeader('Content-Type', 'application/json');
            */
            // alternative to the above
            res.writeHead(404, {
                'X-Powered-By': 'Node.js',
                'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({
                success: false,
                error: "Not found",
                data: null, 
            }));  // send a response to avoid client hanging 

        }
        
    }
    
    
});


// Error handling for http server
server.on('error', function (e) {
    console.log("HTTP Server Error:");
    //console.log(e);
    if (e.code && e.port){
        console.log(e.code, " port:", e.port);
        if (e.code === "EADDRINUSE") {
            console.log(`  looking for process using port ${e.port}:`);
            shellCommand(`sudo lsof -nP -iTCP:${e.port} | grep LISTEN`);
        }
    } else {
        console.log(e);
    }
});



const PORT = 3000;  // typically would be in a config file


// start http server
server.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
})


