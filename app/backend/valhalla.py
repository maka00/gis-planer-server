import geojson
import logging
import json
import http.client

from flask_injector import request


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
        data = self.call_valhalla_rest_api(request)
        json_data = json.loads(data)
        transport_table = json_data['sources_to_targets']
        # create a list of dictionaries with from -> to -> distance
        distance_matrix = []
        for row in transport_table:
            columns = []
            for column in row:
                columns.append(column['distance'])
            distance_matrix.append(columns)
        return distance_matrix

    def get_shortest_path(self, features: geojson.FeatureCollection):
        stations = []
        for feature in features['features']:
            station = feature['geometry']['coordinates']
            stations.append(self.create_location(station[1], station[0]))
        request = {"locations": stations ,"costing":"auto","units":"km"}
        data = self.call_valhalla_routing_api(request)
        return data

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
    def call_valhalla_routing_api(self, locations) -> bytes:
        """
        Call Valhalla REST API.
        :param locations:
        :return:
        """
        conn = http.client.HTTPConnection("localhost", 8002)
        headers = {'Content-type': 'application/json'}
        payload = json.dumps(locations)
        conn.request("GET", "/optimized_route", payload, headers)
        res = conn.getresponse()
        data = res.read()
        return data
