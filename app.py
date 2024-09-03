from flask import Flask , render_template, request, jsonify
from algorithm import dijkstra
app = Flask(__name__)

@app.route("/")
@app.route("/hello")
def hello():
    return render_template('canvas.html', title='Welcome', message='Hello, world!')

@app.route('/process-grid', methods=['POST'])
def process_grid():
    data = request.json
    grid = data.get('grid')
    circles = data.get('circles')
    edges = data.get('edges')
    check = data.get('check')

    for edge in edges:
        edge['color'] = 'black'

    if check[0] != -1 and check[1] != -1:
        answer = dijkstra(grid,check[0],check[1])
        for i in range(len(answer[1]) - 1):
            for edge in edges:
                if edge['start_circle'] == answer[1][i] and edge['end_circle'] == answer[1][i + 1]:
                    edge['color'] = 'orange'
    response_data = {
        'edges': edges,
        'grid': grid,
        'circles': circles,
        'check': check
        }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    #app.run(debug=True)