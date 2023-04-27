import * as React from "react";
import { useState, useEffect } from "react";
import './App.css';

type Color = 'white' | 'green' | 'brown';

type Tile = {
  color: Color;
};

const JITTER = 0.2;

const App = () => {
  const [whiteValue, setWhiteValue] = useState(0);
  const [greenValue, setGreenValue] = useState(0);
  const [brownValue, setBrownValue] = useState(0);
  const [pattern, setPatternValue] = useState<'grid' | 'offset-50' | 'offset-33' | 'offset-25'>('grid');
  const [strategy, setStrategyValue] = useState<'random' | 'deterministic' | 'converging'>('random')
  const [rotation, setRotationValue] = useState<'horizontal' | 'vertical'>('horizontal')
  const [tiles, setTiles] = useState([] as Tile[][]);

  const randomizeTiles = () => {
    const totalValue = whiteValue + greenValue + brownValue;
    const proportions = [
      whiteValue / totalValue,
      greenValue / totalValue,
      brownValue / totalValue,
    ];
    const newTiles: Tile[][] = [];
    for (let row = 0; row < 20; row++) {
      const rowTiles = []
      for (let col = 0; col < 10; col++) {
        const color = pickRandomColor(proportions);
        rowTiles.push({ color });
      }
      newTiles.push(rowTiles);
    }
    setTiles(newTiles);
  };

  const targettedRandom = () => {
    const totalValue = whiteValue + greenValue + brownValue;
    const whiteTarget = whiteValue / totalValue;
    const greenTarget = greenValue / totalValue;
    const brownTarget = brownValue / totalValue;
    const counts: Record<Color, number> = {
      white: 0,
      brown: 0,
      green: 0,
    };
    let totalCount = 0;
    const newTiles: Tile[][] = [];
    for (let row = 0; row < 20; row++) {
      const rowTiles = []
      for (let col = 0; col < 10; col++) {
        let color;
        if (totalCount == 0 || Math.random() < JITTER) {
          const proportions = [
            whiteValue / totalValue,
            greenValue / totalValue,
            brownValue / totalValue,
          ];
          color = pickRandomColor(proportions);
        } else {
          const whiteDiff = Math.max(0, whiteTarget - counts.white / totalCount);
          const greenDiff = Math.max(0, greenTarget - counts.green / totalCount);
          const brownDiff = Math.max(0, brownTarget - counts.brown / totalCount);

          const totalDiff = whiteDiff + greenDiff + brownDiff;

          if (totalDiff == 0) {
            const proportions = [
              whiteValue / totalValue,
              greenValue / totalValue,
              brownValue / totalValue,
            ];
            color = pickRandomColor(proportions);
          } else {
            const proportions = [
              whiteDiff / totalDiff,
              greenDiff / totalDiff,
              brownDiff / totalDiff,
            ];
            color = pickRandomColor(proportions);
          }
        }

        rowTiles.push({ color });
        counts[color]++;
        totalCount++;
      }
      newTiles.push(rowTiles);
    }
    setTiles(newTiles);
  };

  const deterministicTiles = () => {
    const totalValue = whiteValue + greenValue + brownValue;
    const whiteTarget = whiteValue / totalValue;
    const greenTarget = greenValue / totalValue;
    const brownTarget = brownValue / totalValue;
    let whiteCount = 0;
    let greenCount = 0;
    let brownCount = 0;
    let totalCount = 0;
    const newTiles: Tile[][] = [];
    for (let row = 0; row < 20; row++) {
      const rowTiles = []
      for (let col = 0; col < 10; col++) {
        if (totalCount == 0) {
          rowTiles.push({ color: 'green' });
          greenCount++;
        } else if (whiteCount / totalCount < whiteTarget) {
          rowTiles.push({ color: 'white' });
          whiteCount++;
        } else if (greenCount / totalCount < greenTarget) {
          rowTiles.push({ color: 'green' });
          greenCount++;
        } else if (brownCount / totalCount < brownTarget) {
          rowTiles.push({ color: 'brown' });
          brownCount++;
        }
        totalCount++;
      }
      newTiles.push(rowTiles);
    }
    setTiles(newTiles);
  };

  const generateTiles = () => {
    switch (strategy) {
      case 'random':
        randomizeTiles();
        break;
      case 'deterministic':
        deterministicTiles();
        break;
      case 'converging':
        targettedRandom();
        break;
    }
  }

  useEffect(generateTiles, [whiteValue, greenValue, brownValue, strategy]);

  const pickRandomColor = (proportions): Color => {
    const COLORS: Color[] = ["white" , "green" , "brown" ];
    const randomValue = Math.random();
    let sum = 0;
    for (let i = 0; i < proportions.length; i++) {
      sum += proportions[i];
      if (randomValue <= sum) {
        return COLORS[i];
      }
    }

    return "green";
  };

  const handleWhiteChange = (event) => {
    setWhiteValue(parseInt(event.target.value));
  };

  const handleGreenChange = (event) => {
    setGreenValue(parseInt(event.target.value));
  };

  const handleBrownChange = (event) => {
    setBrownValue(parseInt(event.target.value));
  };

  const handlePatternChange = (event) => {
    setPatternValue(event.target.value);
  };

  const handleStrategyChange = (event) => {
    setStrategyValue(event.target.value);
  };

  const handleRotationChange = (event) => {
    setRotationValue(event.target.value);
  };

  return (
    <div>
      <div>
        <label htmlFor="white">White:</label>
        <input type="number" id="white" value={whiteValue} onChange={handleWhiteChange} />
      </div>
      <div>
        <label htmlFor="green">Green:</label>
        <input type="number" id="green" value={greenValue} onChange={handleGreenChange} />
      </div>
      <div>
        <label htmlFor="brown">Brown:</label>
        <input type="number" id="brown" value={brownValue} onChange={handleBrownChange} />
      </div>
      <div>
        <label htmlFor="pattern">Pattern:</label>
        <select id="pattern" value={pattern} onChange={handlePatternChange}>
          <option value="grid">Grid</option>
          <option value="offset-50">50% Offset</option>
          <option value="offset-33">33% Offset</option>
          <option value="offset-25">25% Offset</option>
        </select>
      </div>
      <div>
        <label htmlFor="pattern">Orientation:</label>
        <select id="pattern" value={rotation} onChange={handleRotationChange}>
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>
      <div>
        <label htmlFor="strategy">Strategy:</label>
        <select id="strategy" value={strategy} onChange={handleStrategyChange}>
          <option value="random">Random</option>
          <option value="deterministic">Deterministic</option>
          <option value="converging">Converging</option>
        </select>
      </div>
      <div>
        <button onClick={generateTiles}>Regenerate</button>
      </div>
      <div className={`App-tiles App-tiles--${rotation}`}>
        {tiles.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`App-tileRow App-tileRow--${pattern}`}
          >
            {row.map((tile, colIndex) => (
              <div
                key={colIndex}
                className={`App-tile App-tile--${tile.color}`}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
