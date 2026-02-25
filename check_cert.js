const tls = require('tls');

const options = {
    host: 'novelexporters.com',
    port: 443,
    servername: 'novelexporters.com',
    rejectUnauthorized: false
};

const socket = tls.connect(options, () => {
    const cert = socket.getPeerCertificate();
    console.log('Certificate Details:');
    console.log('Subject:', cert.subject);
    console.log('Issuer:', cert.issuer);
    console.log('Valid From:', cert.valid_from);
    console.log('Valid To:', cert.valid_to);
    console.log('Fingerprint:', cert.fingerprint);
    socket.end();
});

socket.on('error', (err) => {
    console.error('TLS Error:', err.message);
});
