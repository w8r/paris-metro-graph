#!/usr/bin/env node
var fs = require('fs');

var data = JSON.parse(fs.readFileSync('stations.json'));
var linesData = JSON.parse(fs.readFileSync('lines.json'));

var stations = [], stationsMap = {};
var lines = {};

var checked = [123784,123917,123789,123802,123767,123674,123912,123652,2554093,123564,123782,123768,123792,123775,123799,123737];

data.elements.forEach((node) => {
  if (node.type === 'node' && node.tags) {
    if (node.tags['type:RATP'] === 'metro') {
      var station = {
        id: node.id,
        text: node.tags.name,
        size: 5,
        x: node.lon * 10000,
        y: -node.lat * 10000,
        longitude: node.lon,
        latitude: node.lat
      };
      stationsMap[station.id] = station;
      stations.push(station);
    }
  }
});

var elMap = linesData.elements.reduce((acc, el) => {
  acc[el.id] = el;
  return acc;
}, {});

var c = 0;
linesData.elements.filter((r) => {
  return r.type === 'relation' && checked.indexOf(r.id) !== -1;
}).forEach((line) => {
  var stops = line.members.filter(m => m.role === 'stop');
  var ways  = line.members.filter(m => m.type === 'way').map(w => elMap[w.ref]);
  var props = line.tags;

  console.log(line.tags.name, 'stops', stops.map(s => stationsMap[s.ref]).length, 'ways', ways.length, line.id);

  //if ([5456634, 123767, 123564, 3326844].indexOf(line.id) !== -1) return;

  var edge = {};
  line.members.forEach((m) => {
    var n = m.ref;
    var station = stationsMap[n];
    if (station) {
      console.log('\t', station.text);
      station.visited = true;
      if (!edge.source) {
        edge.source = n;
        edge.from = station.name;
      } else {
        edge.target = n;
        edge.to = station.name;
        //edge.data = props;
        edge.id = edge.source + '-' + edge.target;
        edge.text = line.tags.name;
        edge.line = line.tags.name;
        edge.color = line.tags.colour;

        if (!lines[edge.id] && !lines[edge.target + '-' + edge.source] &&
          [35, 36, 115, 117, 293, 294, 269].indexOf(c) === -1
        ) {
          lines[edge.id] = edge;
        }
        edge = {
          source: n,
          from: station.name
        };
        c++;
      }
    }
  });
});


lines = Object.keys(lines).map(id => lines[id]);

console.log('stations', stations.length, 'included', stations.filter(s => s.visited).length, 'lines', lines.length);
fs.writeFileSync('metro.json', JSON.stringify({
  nodes: stations,
  edges: lines
}, 0, 2));
