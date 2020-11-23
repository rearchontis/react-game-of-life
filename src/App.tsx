import React, { useCallback, useRef, useState } from 'react';
import produce from "immer";
import "./App.css";

const NUM_ROWS = 25;
const NUM_COLS = 25;

// neighbors
const operations = [
  [ -1, -1 ],  [ -1, 0 ],   [ -1,  1 ],
  [  0, -1 ], /*[ 0, 0 ],*/ [  0,  1 ],
  [  1, -1 ],   [ 1, 0 ],   [  1,  1 ],
];

const generateEmptyGrid = () => {
  const rows = [];

  for (let i = 0; i < NUM_ROWS; i++) {
    /**
     * here it could be another way to create such array:
     * 
     *   rows.push(new Array(NUM_COLS).fill(0));
     * 
     * but it still mutable, it could be better -> rows.push(new Array(NUM_COLS).fill(0))
     * make it more predictable...
     * 
     *   const row = new Array(NUM_COLS).fill(0);
     *   return new Array(NUM_ROWS).fill(row);
    */
    rows.push(Array.from(Array(NUM_COLS), () => 0));
  }

  return rows;
}


function App() {
  /**
   * Callback that used as an argument of useState, 
   * will be called once (when it will be necessary to init state)
  */
  const [grid, setGrid] = useState(generateEmptyGrid());

  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid((g) => {
      return produce(g, (gridCopy) => {
        for (let i = 0; i < NUM_ROWS; i++) {
          for (let k = 0; k < NUM_COLS; k++) {
            let neighbors = 0;
            
            operations.forEach(([x, y]) => {
              const newI = i + x;
              const newK = k + y;

              if (newI >= 0 && newI < NUM_ROWS && newK >= 0 && newK < NUM_ROWS) {
                neighbors +=g[newI][newK];
              }
            });

            if (neighbors < 2 || neighbors > 3) {
              gridCopy[i][k] = 0;
            } else if (g[i][k] === 0 && neighbors === 3) {
              gridCopy[i][k] = 1;
            }
          }
        }
      })
    })

    setTimeout(runSimulation, 250)
  }, [])

  return (
    <div className="App">
      <div>
        <button 
          className={`btn ${running ? 'stop' : 'start'}`}
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              runSimulation();
            }
          }}>
            {running ? 'Stop' : 'Start'}
        </button>
        <button
          className={"btn clear"}
          onClick={() => setGrid(generateEmptyGrid())}>
          Clear
        </button>
        <button
          className={"btn random"}
          onClick={() => {
            const rows = [];

            for (let i = 0; i < NUM_ROWS; i++) {
              rows.push(Array.from(Array(NUM_COLS), () => Math.random() > 0.75 ? 1 : 0));
            }
          
            setGrid(rows);
          }}>
          Random
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${NUM_COLS}, 20px)`,
      }}>
        {
          grid.map((rows, i) => {
            return rows.map((col, k) => (
              <div 
                key={`${i}-${k}`}
                onClick={() => {
                  const newGrid = produce(grid, gridCopy => {
                    gridCopy[i][k] = grid[i][k] ? 0: 1;
                  })
                  setGrid(newGrid);
                }}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: grid[i][k] ? "#fff" : undefined,
                  boxSizing: "border-box",
                }}>
              </div>
            ));
          })
        }
      </div>
    </div>
  );
}

export default App;
