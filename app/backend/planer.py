from ortools.constraint_solver import pywrapcp, routing_enums_pb2

class Solver:
    def __init__(self):
        pass

    def solve(self, data: list[list[float]]) -> list:
        dm = [[int(distance * 1000) for distance in row] for row in data]
        manager = pywrapcp.RoutingIndexManager(len(dm), 1, len(dm) - 1)
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
        solution_list = []
        if solution:
            idx = routing.Start(0)
            while not routing.IsEnd(idx):
                solution_list.append(manager.IndexToNode(idx))
                idx = solution.Value(routing.NextVar(idx))
        return solution_list