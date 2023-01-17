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
    console.log(method, url);

    let body = [];

    req.on("data", (chunk) => {
        body.push(chunk);
    }).on("end", () => {
        body = Buffer.concat(body).toString();
        //console.log("body:\n", body);

        let status = 404;
        const response = {
            success: false,
            data: null,
        }


        if (method === "GET" && url === "/todos") {
            status = 200;
            response.success = true;
            response.data = todos;
        } else if (method === "POST" && url === "/todos"){
            try{
                const { id, text } = JSON.parse(body);
                if (!id || !text) {
                    status = 400; // bad request
                    response.error = "Please specify both id and text";
                    console.log("response:\n", response);
                } else {
                    todos.push({ id, text });
                    status = 201; // created
                    response.success = true;
                    response.data = todos;
                }
            } catch(e){
                status = 400;
                response.error = e.message;
                console.log("response:\n", response);
            }
            
            
        }

        res.writeHead(status, {
            'X-Powered-By': 'Node.js',
            'Content-Type': 'application/json',
        });

        res.end(JSON.stringify(response));  // send a response to avoid client hanging 

    })
    
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


