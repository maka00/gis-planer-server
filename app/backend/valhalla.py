import geojson
import logging
import json
import http.client

class Valhalla:
    def __init__(self):
        pass

    def get_transport_matrix(self, features: geojson.FeatureCollection) -> list[list[float]]:
        """
        Get transport matrix for given features.
        :param features:
        :return:
        """

        locations = self.generate_destinations(features)
        request = {"sources": locations, "targets": locations, "costing": "auto", "units": "km"}
        print(json.dumps(request))
        data = self.call_valhalla_rest_api(request)
        json_data = json.loads(data)
        transport_table = json_data['sources_to_targets']
        print(transport_table)
        # create a list of dictionaries with from -> to -> distance
        distance_matrix = []
        for row in transport_table:
            columns = []
            for column in row:
                print(f"From: {column['from_index']} To: {column['to_index']} Distance: {column['distance']}")
                columns.append(column['distance'])
            distance_matrix.append(columns)
        print(distance_matrix)
        return distance_matrix

    def generate_destinations(self, features) -> list:
        locations = []
        for feature in features['features']:
            location = feature['geometry']['coordinates']
            locations.append(self.create_location(location[1], location[0]))
        return locations

    def create_location(self, lat: float, lon:float):
        """
        Create location object.
        :param lat:
        :param lon:
        :return:
        """
        return {"lat": lat, "lon": lon}

    def call_valhalla_rest_api(self, locations) -> bytes:
        """
        Call Valhalla REST API.
        :param locations:
        :return:
        """
        conn = http.client.HTTPConnection("localhost", 8002)
        headers = {'Content-type': 'application/json'}
        payload = json.dumps(locations)
        conn.request("GET", "/sources_to_targets", payload, headers)
        res = conn.getresponse()
        data = res.read()
        return data
