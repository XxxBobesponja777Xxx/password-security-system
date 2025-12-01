const forge = require('node-forge');

/**
 * Generar certificado TLS autofirmado en memoria
 * Solo para desarrollo - NO usar en producción
 */
function generateSelfSignedCert() {
  console.log('🔧 Generando certificado autofirmado temporal...');
  
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'Development'
  }, {
    name: 'localityName',
    value: 'Dev'
  }, {
    name: 'organizationName',
    value: 'Password Security System'
  }, {
    shortName: 'OU',
    value: 'Development'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey);
  
  const pem = {
    cert: forge.pki.certificateToPem(cert),
    key: forge.pki.privateKeyToPem(keys.privateKey)
  };
  
  console.log('✅ Certificado temporal generado');
  
  return pem;
}

module.exports = {
  generateSelfSignedCert
};
