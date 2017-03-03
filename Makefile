OVERPASS_URL = http://api.openstreetmap.fr/oapi/interpreter?data=[out:json];
all:
	@wget '${OVERPASS_URL}node[%22type:RATP%22~%22metro%22][%22station%22~%22subway%22];out;%3E;out%20skel;' -O stations.json -q
	@wget '${OVERPASS_URL}relation[%22network%22~%22RATP%22][%22line%22~%22subway%22][%22route%22~%22subway%22];out;%3E;out%20skel;' -O lines.json -q
	@node index.js
