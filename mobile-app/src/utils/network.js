export function validateIP(ipaddress) {
    const ipv4Pattern =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    return ipv4Pattern.test(ipaddress);
}

export function generateSubnetIps(baseIp) {
    const subnet = baseIp.replace(/^(\d+\.\d+\.\d+)\.\d+$/, '$1');
    return Array.from({ length: 256 }, (_, i) => `${subnet}.${i}`);
}

export function getIpFromUrl(url) {
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    const ipAddress = url.match(ipPattern);
    return ipAddress[0];
}