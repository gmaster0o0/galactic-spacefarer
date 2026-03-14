const cds = require('@sap/cds');

module.exports = cds.service.impl(function () {
  this.on('READ', 'Spacefarers', async (req) => {
    console.info('[service] custom READ Spacefarers handler - returning static smoke data');
    return [
      {
        ID: 's1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
        name: 'Alara Voss',
      },
    ];
  });
});
