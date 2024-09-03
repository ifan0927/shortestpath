import random
import heapq
node_num = 5
gird = grid = [[0 for _ in range(node_num)] for _ in range(node_num)]

def randomize(grid):
    for row in range(node_num):
        for column in range(node_num):
            if row == column:
                grid[row][column] = 0
            elif column > row:
                if random.randint(0,10) > 5:
                    grid[row][column] = random.randint(1,10)
                else:
                    grid[row][column] = -1
            else:
                grid[row][column] = grid[column][row]


def dijkstra(grid, start, end):
    n = len(grid)
    visited = [False] * n
    cost = [float('inf')] * n
    cost[start] = 0
    path = [-1] * n
    
    priority_queue = [(0, start)] 
    
    while priority_queue:
        current_cost, current_node = heapq.heappop(priority_queue)
        
        if visited[current_node]:
            continue
        
        visited[current_node] = True
        
        if current_node == end:
            break
        
        for neighbor in range(n):
            if grid[current_node][neighbor] != -1 and not visited[neighbor]:
                new_cost = current_cost + grid[current_node][neighbor]
                if new_cost < cost[neighbor]:
                    cost[neighbor] = new_cost
                    path[neighbor] = current_node
                    heapq.heappush(priority_queue, (new_cost, neighbor))
    
    
    shortest_path = []
    step = end
    while step != -1:
        shortest_path.append(step)
        step = path[step]
    shortest_path.reverse()

    return cost[end], shortest_path
