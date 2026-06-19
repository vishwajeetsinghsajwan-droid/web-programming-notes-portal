import http.server
import socketserver
import urllib.parse
import os

PORT = int(os.environ.get('PORT', 8080))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class UploadHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Serve from the current directory containing index.html, style.css, script.js
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/upload':
            # Parse parameters
            query = urllib.parse.parse_qs(parsed_path.query)
            module_id = query.get('module', [None])[0]
            ext = query.get('ext', ['pdf'])[0]
            
            if not module_id or module_id not in ['1', '2', '3', '4', '5']:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Invalid module ID. Must be between 1 and 5.")
                return

            # Validate extension
            ext = ext.lower().strip('.')
            if ext not in ['pdf', 'ppt', 'pptx']:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Invalid file extension. Only PDF, PPT, and PPTX are allowed.")
                return
            
            # Read content length and file data
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Empty file upload.")
                return

            file_data = self.rfile.read(content_length)
            
            # Create pdfs directory if not exists
            pdfs_dir = os.path.join(DIRECTORY, 'pdfs')
            os.makedirs(pdfs_dir, exist_ok=True)
            
            # Target filename
            filename = f"module{module_id}.{ext}"
            filepath = os.path.join(pdfs_dir, filename)
            
            try:
                # If there is a file with a different extension (e.g. replacing module1.pdf with module1.pptx)
                # clean up the old file to prevent conflicts.
                for possible_ext in ['pdf', 'ppt', 'pptx']:
                    old_path = os.path.join(pdfs_dir, f"module{module_id}.{possible_ext}")
                    if old_path != filepath and os.path.exists(old_path):
                        os.remove(old_path)

                with open(filepath, 'wb') as f:
                    f.write(file_data)
                
                # Send JSON success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'{"success": true}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()

# Start Server
if __name__ == '__main__':
    # Use ThreadingTCPServer or just TCPServer
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), UploadHTTPRequestHandler) as httpd:
        print(f"Notes Portal Upload Server running at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopping server.")
