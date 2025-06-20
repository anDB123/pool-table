import { useEffect } from 'react'
import './App.scss'
import { PoolGame } from './PoolGame'
function App() {

  useEffect(() => {
    const handleResize = () => {
      // Handle window resize logic here
      console.log('Window resized:', window.innerWidth, window.innerHeight);
      const backboard = document.getElementById('backboard');
      if (backboard) {
        const scale = window.innerWidth * 0.9 / backboard.offsetWidth;
        backboard.style.transform = `scale(${scale})`;
        backboard.style.transformOrigin = 'top left';
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <div id='pool-container'>
      <div id="backboard" >
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

    </div>
  )
}

export default App
