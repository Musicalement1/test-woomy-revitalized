const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const server = http.createServer((req, res) => {
  // Construct the file path relative to the script's directory (__dirname)
  const requestedUrl = decodeURIComponent(req.url);
  // If the requested URL is '/', serve index.html or default file
  const filePath = path.join(__dirname, requestedUrl === '/' ? 'index.html' : requestedUrl);

  // Basic security check: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden\n');
      return;
  }

  // Read the file from the determined path
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found\n');
        console.log(filePath)
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Internal Server Error: ${err.message}\n`);
      }
    } else {
      // Determine Content-Type based on file extension
      const ext = path.extname(filePath);
      let contentType = 'text/plain'; // Default
      switch (ext) {
        case '.html': contentType = 'text/html'; break;
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.gif': contentType = 'image/gif'; break;
        // Add more cases for other file types as needed
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
  console.log(`Serving files from: ${__dirname}`); // Confirms the directory being served
});
