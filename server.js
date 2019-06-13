const express = require('express');
const path = require('path');
const fs = require('fs');
const redis = require('redis');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const client = redis.createClient();

client.on('connect', () => {
  console.log('connected to Redis...');
});

app.use('/', express.static('client'));
app.use(bodyParser.json());

app.post('/submitChem', (req, res) => {
  console.log('post request recieved');

  //catch eroneous or potentially malicious post requests
  if (!req.body.smiles || typeof req.body.smiles !== 'string') {
    console.log('bad post request caught');
    res.send();
    return;
  }

  // now check if the incoming request is already in redis database
  client.hget('smilesHash', req.body.smiles, (err, result) => {
    if (err) {
      console.log('Redis hget error for req.body.smiles: ', req.body.smiles);
      queryAPI();
      return;
    } else if (!result) {
      console.log('No such redis entry: ', req.body.smiles);
      queryAPI();
      return;
    } else {
      console.log('Got redis entry for: ', req.body.smiles);
      res.send(result);
      return;
    }
  });

  function queryAPI() {
    //if the request has made it this far it should be a new smiles entry,
    //therefore we need to query the api and store the result in the redis client
    fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${req.body.smiles}/property/MolecularFormula,MolecularWeight,InChIKey/JSON`)
      .then(res => res.json())
      .then(data => {
        const pubchemResponse = data.PropertyTable.Properties[0];
        console.log('output from pubchem api fetch: ', pubchemResponse);
        res.send(pubchemResponse);
        client.hset('smilesHash', req.body.smiles, JSON.stringify(pubchemResponse));
      });
  }
});

app.listen(3000, () => {
  console.log('listening on port 3000');
});
