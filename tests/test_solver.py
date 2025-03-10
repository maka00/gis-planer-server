"""Test the HTTP server."""

from unittest.mock import MagicMock, PropertyMock
import pytest
from ortools.constraint_solver import pywrapcp, routing_enums_pb2

dm = [[0.0, 1.045, 1.093, 0.162, 0.322], [0.946, 0.0, 0.225, 1.561, 0.113], [0.871, 0.461, 0.0, 1.532, 0.575], [0.494, 0.883, 0.931, 0.0, 0.277], [0.833, 0.574, 0.112, 1.448, 0.0]]
dm = [[int(distance * 1000) for distance in row] for row in dm]

def print_solution(manager, routing, solution):
    """Prints solution on console."""
    print(f"Objective: {solution.ObjectiveValue()} miles")
    index = routing.Start(0)
    plan_output = "Route for vehicle 0:\n"
    route_distance = 0
    while not routing.IsEnd(index):
        plan_output += f" {manager.IndexToNode(index)} ->"
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        route_distance += routing.GetArcCostForVehicle(previous_index, index, 0)
    plan_output += f" {manager.IndexToNode(index)}\n"
    plan_output += f"Route distance: {route_distance}m\n"
    print(plan_output)

def test_traveling_salesman():
    """Test the dm"""
    manager = pywrapcp.RoutingIndexManager( len(dm), 1, 4)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        # Convert from routing variable Index to distance matrix NodeIndex.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return dm[from_node][to_node]
    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    solution = routing.SolveWithParameters(search_parameters)
    assert solution
    if solution:
        print_solution(manager, routing, solution)
        solution_list = []
        idx = routing.Start(0)
        while not routing.IsEnd(idx):
            solution_list.append(manager.IndexToNode(idx))
            idx = solution.Value(routing.NextVar(idx))
        assert solution_list == [4,2,1,0,3]

    assert True