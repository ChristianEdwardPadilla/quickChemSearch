function getSmiles() {
  var saver = new chem.SmilesSaver();
  return saver.saveMolecule(ui.ctab, true);
}

function populateDOM(results) {
  //results should be a stringified JSON object
  results = JSON.parse(results);
  queryResultsDiv.innerHTML = '';
  for (let key of Object.keys(results)) {
    const entry = results[key];
    const element = document.createElement('div');
    element.innerText = `${key}: ${entry}` + '\n';
    queryResultsDiv.appendChild(element);
  }
}

const searchButton = document.querySelector('.searchButton');
const queryResultsDiv = document.querySelector('.query_results');

searchButton.addEventListener('click', () => {
  const smiles = getSmiles();
  let returnedData = null;
  // console.log("smiles being sent: ", smiles, typeof smiles);
  if (window.localStorage[smiles]) {
    //serve smiles directly from local storage, no need to contact server
    // console.log("local storage accessed: ", smiles, typeof smiles);
    returnedData = window.localStorage[smiles];
    populateDOM(returnedData);
  } else if (smiles) {
    fetch('http://localhost:3000/submitChem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ smiles: smiles }),
    })
      .then(stream => stream.json())
      .then(res => {
        // console.log("raw res after res.json(): ", res);
        // console.log("res after JSON.stringify: ", JSON.stringify(res));
        //localStorage only allows string/string key/value pairs
        localStorage.setItem(smiles, JSON.stringify(res));
        returnedData = JSON.stringify(res);
        populateDOM(returnedData);
      });
  }
});
