use std::net::TcpListener;

const DEFAULT_PORTS: [u16; 4] = [3000, 3001, 5173, 8080];

pub fn is_port_available(port: u16) -> bool {
    TcpListener::bind(("127.0.0.1", port)).is_ok()
}

pub fn find_available_port(preferred: u16) -> u16 {
    if is_port_available(preferred) {
        return preferred;
    }

    for port in DEFAULT_PORTS {
        if port != preferred && is_port_available(port) {
            return port;
        }
    }

    (3000..9000)
        .find(|&p| is_port_available(p))
        .unwrap_or(3000)
}
