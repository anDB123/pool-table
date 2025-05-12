import './App.scss'
import { PoolGame } from './poolGame'
function App() {
  return (
    <>
      <div id="backboard">
        <div id="cloth">
          {PoolGame()}
          <div id="pocket1"></div>
          <div id="pocket2"></div>
          <div id="pocket3"></div>
          <div id="pocket4"></div>
          <div id="pocket5"></div>
          <div id="pocket6"></div>

          <div id="cushion1"></div>
          <div id="cushion2"></div>
          <div id="cushion3"></div>
          <div id="cushion4"></div>
          <div id="cushion5"></div>
          <div id="cushion6"></div>
          <div id='topPips'>
            <div className="pip"></div>
            <div className="pip"></div>
            <div className="pip"></div>
            <div className="pip"></div>
          </div>
          <div id='botPips'>
            <div className="pip"></div>
            <div className="pip"></div>
            <div className="pip"></div>
            <div className="pip"></div>
          </div>
          <div id='leftPips'>
            <div className="pip"></div>
            <div className="pip"></div>
          </div>
          <div id='rightPips'>
            <div className="pip"></div>
            <div className="pip"></div>
          </div>
        </div >
      </div >

    </>
  )
}

export default App
