

var StudiesModel = function() {

  "use strict"

  this.base_url = BASE_URL;

  this.studies = [];



  return this;
}

StudiesModel.prototype.getStudyValue = function getStudyValue(study, key) {
  if (!study.mapValues) return;
  for (let i=0; i<study.mapValues.length; i++){
    let kv = study.mapValues[i];
    if (kv[0] === key) {
      return kv[1];
    }
  }
}

StudiesModel.prototype.getKeyValueAutoComplete = function getKeyValueAutoComplete(key, inputText) {
  inputText = inputText.toLowerCase();
  // Get values for key from each study
  let values = this.studies.map(study => {
    let v = this.getStudyValue(study, key);
    if (v) return v;
    console.log("No value found for study for key", key, study);
    return "";
  });
  // We want values that match inputText
  // Except for "Publication Authors", where we want words
  // Create dict of {lowercaseValue: origCaseValue}
  let matchCounts = values.reduce((prev, value) => {
    let matches = [];
    if (key == "Publication Authors") {
      // Split surnames, ignoring AN initials.
      let names = value.match(/\b([A-Z][a-z]\w+)\b/g) || [];
      matches = names.filter(name => name.toLowerCase().indexOf(inputText) > -1);
    } else if (value.toLowerCase().indexOf(inputText) > -1) {
      matches.push(value);
    }
    matches.forEach(match => {
      if (!prev[match.toLowerCase()]) {
        // key is lowercase, value is original case
        prev[match.toLowerCase()] = {value: match, count: 0};
      }
      // also keep count of matches
      prev[match.toLowerCase()].count++;
    });

    return prev;
  }, {});

  // Make into list and sort by:
  // match at start of phrase > match at start of word > other match
  let matchList = [];
  for (key in matchCounts) {
    let matchScore = 1;
    if (key.indexOf(inputText) == 0) {
      // best match if our text STARTS WITH inputText
      matchScore = 3;
    } else if (key.indexOf(" " + inputText) > -1) {
      // next best if a WORD starts with inputText
      matchScore = 2;
    }
    // Make a list of sort score, orig text (NOT lowercase keys) and count
    matchList.push([matchScore,
                    matchCounts[key].value,
                    matchCounts[key].count]);
  }

  // Sort by the matchScore
  matchList.sort(function(a, b) {
    return (a[0] < b[0] ? 1 :
      a[0] > b[0] ? -1 : 0)
  });

  // Return the matches
  return matchList
    .map(m => {
      // Auto-complete uses {label: 'X (n)', value: 'X'}
      return {label: `${ m[1] } (${ m[2] })`, value: m[1]}
    })
    .filter(m => m.value.length > 0);
}


StudiesModel.prototype.loadStudies = function loadStudies(filter, callback) {

  // Load Projects AND Screens, sort them and render...
  Promise.all([
    fetch(this.base_url + "/api/v0/m/projects/"),
    fetch(this.base_url + "/api/v0/m/screens/"),
  ]).then(responses =>
      Promise.all(responses.map(res => res.json()))
  ).then(([projects, screens]) => {
      this.studies = projects.data;
      this.studies = this.studies.concat(screens.data);

      // Filter by tissues/cells
      if (filter) {
        this.studies = filter(this.studies);
      }

      // sort by name, reverse
      this.studies.sort(function(a, b) {
        var nameA = a.Name.toUpperCase();
        var nameB = b.Name.toUpperCase();
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });

      // load Map Anns for Studies...
      this.loadStudiesMapAnnotations(callback);

  }).catch((err) => {
    console.error(err);
  });
}


StudiesModel.prototype.loadStudiesMapAnnotations = function loadStudiesMapAnnotations(callback) {
  let url = this.base_url + "/webclient/api/annotations/?type=map";
  let data = this.studies
    .map(study => `${ study['@type'].split('#')[1].toLowerCase() }=${ study['@id'] }`)
    .join("&");
  url += '&' + data;
  // Cache-buster. See https://trello.com/c/GpXEHzjV/519-cors-access-control-allow-origin-cached
  url += '&_=' + Math.random();
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // populate the studies array...
      // dict of {'project-1' : key-values}
      let annsByParentId = {};
      data.annotations.forEach(ann => {
        let key = ann.link.parent.class;  // 'ProjectI'
        key = key.substr(0, key.length-1).toLowerCase();
        key += '-' + ann.link.parent.id;  // project-1
        if (!annsByParentId[key]) {
          annsByParentId[key] = [];
        }
        annsByParentId[key] = annsByParentId[key].concat(ann.values);
      });
      // Add mapValues to studies...
      this.studies = this.studies.map(study => {
        let values = annsByParentId[`${ study['@type'].split('#')[1].toLowerCase() }-${ study['@id'] }`];
        if (values) {
          study.mapValues = values;
          return study;
        }
      });

      if (callback) {
        callback();
      };
    })
}