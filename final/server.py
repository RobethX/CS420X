from http.server import SimpleHTTPRequestHandler, HTTPServer
import ssl

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def send_response_only(self, code: int, message: str = None) -> None:
        super().send_response_only(code, message)
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate, post-check=0, pre-check=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
    

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain("cert.pem", "key.pem")

httpd = HTTPServer(("0.0.0.0", 4443), NoCacheHTTPRequestHandler)
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
httpd.serve_forever()