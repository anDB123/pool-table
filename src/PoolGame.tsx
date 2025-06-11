import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./PoolGame.scss"
export function PoolGame() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [score, setScore] = useState(0);

    const ballRadius = 20;
    const minVel = 5;
    const dragEquation = (speedVector: number[]) => {
        let x = speedVector[0];
        let y = speedVector[1];
        if ((x ** 2 + y ** 2) ** 0.5 < 0.1)
            return [0, 0];
        let drag = 0.05;
        const angle = Math.atan(x / y);
        if (y < 0) {
            drag *= -1;
        }
        x *= 0.99;
        y *= 0.99;
        x -= drag * Math.sin(angle);
        y -= drag * Math.cos(angle);
        return [x, y];
    }
    const poolBalls = useMemo(() => ["white", "red", "blue", "green", "yellow", "purple", "orange", "black"], []);

    const ballPosRef = useRef<number[][]>([]);
    const ballVelRef = useRef<number[][]>([]);

    const pottedRef = useRef<boolean[]>([]);
    const areBallsMoving = useRef(true);

    const reset = useCallback(() => {
        setScore(0);
        pottedRef.current = Array(poolBalls.length).fill(false);
        ballPosRef.current = [];
        ballVelRef.current = [];
        areBallsMoving.current = true;
        for (let i = 0; i < poolBalls.length; i++) {
            let pass = true;
            const newCoords = [100 + 1000 * Math.random(), 100 + 500 * Math.random()];
            //check for overlap
            for (let j = 0; j < i; j++)
                if (ballsCollsion(newCoords[0], newCoords[1], ballPosRef.current[j][0], ballPosRef.current[j][1]))
                    pass = false;
            if (pass) {
                ballPosRef.current.push(newCoords);
                ballVelRef.current.push([0, 0]);
            }
            else
                i--;
        }
    }, [poolBalls]);
    const drawPoolBall = (ctx: CanvasRenderingContext2D, color: string, x: number, y: number,) => {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }


    function addWhiteVel(event: React.MouseEvent<HTMLCanvasElement>) {
        setScore(prev => prev - 1);
        if (areBallsMoving.current)
            return;
        if (pottedRef.current[0]) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const x = (event.clientX - rect.left) * scaleX;
                const y = (event.clientY - rect.top) * scaleY;
                ballPosRef.current[0][0] = x;
                ballPosRef.current[0][1] = y;
                ballVelRef.current[0][0] = 0;
                ballVelRef.current[0][1] = 0;
            }
            pottedRef.current[0] = false;
            return;
        }
        areBallsMoving.current = true;
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;

            const dx = (x - ballPosRef.current[0][0]) / 50;
            const dy = (y - ballPosRef.current[0][1]) / 50;
            const angle = Math.atan(dy / dx);
            let mag = (dx ** 2 + dy ** 2) ** 0.5 * 3;
            if (mag < 5)
                mag = 5;
            if (dx < 0)
                mag *= -1;
            ballVelRef.current[0][0] += mag * Math.cos(angle);
            ballVelRef.current[0][1] += mag * Math.sin(angle);
        }
    }

    function isCollideX(x: number) {
        if (x < 40)
            return 40;
        if (x > 1360)
            return 1360;
        return 0;
    }
    function isCollideY(y: number) {
        if (y < 40)
            return 40;
        if (y > 660)
            return 660;
        return 0;
    }

    function ballsCollsion(x1: number, y1: number, x2: number, y2: number) {
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return (distance <= 2 * ballRadius);

    }
    function ballsAngle(x1: number, y1: number, x2: number, y2: number) {
        const angle = Math.atan((y2 - y1) / (x2 - x1));
        return angle;
    }
    function isInPocket(i: number) {
        let value = 5;
        if (i == 0) {
            value = -5;
        }
        const x = ballPosRef.current[i][0];
        const y = ballPosRef.current[i][1];
        if (x < 50 && y < 50) {
            setScore(prev => prev + value);
            return true;
        }
        if (x > 1350 && y < 50) {
            setScore(prev => prev + value);
            return true;
        }
        if (x > 1350 && y > 650) {
            setScore(prev => prev + value);
            return true;
        }
        if (x < 50 && y > 650) {
            setScore(prev => prev + value);
            return true;
        }
        if (675 < x && x < 725 && y > 650) {
            setScore(prev => prev + value);
            return true;
        }
        if (675 < x && x < 725 && y < 50) {
            setScore(prev => prev + value);
            return true;
        }
        return false;
    }


    useEffect(() => {
        reset();
        const canvas = canvasRef.current;
        let mouseX = 0;
        let mouseY = 0;
        if (!canvas) return;
        const ctx = (canvas as HTMLCanvasElement).getContext("2d");
        let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        const updateMousePosition = (event: MouseEvent) => {
            mouseX = (event.clientX - rect.left) * scaleX;
            mouseY = (event.clientY - rect.top) * scaleY;
        };
        const updateRectAndScale = () => {
            if (!canvas) return;
            rect = canvas.getBoundingClientRect();
            scaleX = canvas.width / rect.width;
            scaleY = canvas.height / rect.height;
        };
        window.addEventListener('resize', updateRectAndScale);
        updateRectAndScale();
        canvas.addEventListener('mousemove', updateMousePosition);
        if (!ctx) return;
        let animationFrameId: number;
        const draw = () => {
            ctx.clearRect(0, 0, 1400, 700);
            if (!areBallsMoving.current && !pottedRef.current[0]) {
                ctx.beginPath();
                const whiteX = ballPosRef.current[0][0];
                const whiteY = ballPosRef.current[0][1];
                ctx.moveTo(whiteX, whiteY);
                ctx.lineTo(mouseX, mouseY);
                ctx.strokeStyle = "gray";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            }
            areBallsMoving.current = false;
            for (let i = 0; i < poolBalls.length; i++) {
                if (ballPosRef.current && ballVelRef.current) {
                    if (!pottedRef.current[i] && isInPocket(i))
                        pottedRef.current[i] = true;
                    if (pottedRef.current[i])
                        continue;
                    for (let j = i + 1; j < poolBalls.length; j++) {
                        if (pottedRef.current[j])
                            continue;
                        if (
                            ballsCollsion(ballPosRef.current[i][0], ballPosRef.current[i][1], ballPosRef.current[j][0], ballPosRef.current[j][1])) {
                            const angle = ballsAngle(ballPosRef.current[i][0], ballPosRef.current[i][1], ballPosRef.current[j][0], ballPosRef.current[j][1]);
                            const vx = ballVelRef.current[i][0] - ballVelRef.current[j][0];
                            const vy = ballVelRef.current[i][1] - ballVelRef.current[j][1];
                            let v = (vx ** 2 + vy ** 2) ** 0.5;
                            if (ballPosRef.current[i][0] < ballPosRef.current[j][0]) {
                                v *= -1
                            }
                            if (isNaN(v))
                                v = 1;
                            ballVelRef.current[i][0] += v * Math.cos(angle);
                            ballVelRef.current[i][1] += v * Math.sin(angle);
                            ballVelRef.current[j][0] -= v * Math.cos(angle);
                            ballVelRef.current[j][1] -= v * Math.sin(angle);
                        }
                    }

                    if (isCollideX(ballPosRef.current[i][0])) {
                        ballPosRef.current[i][0] = isCollideX(ballPosRef.current[i][0]);
                        ballVelRef.current[i][0] *= -1;
                    }
                    if (isCollideY(ballPosRef.current[i][1])) {
                        ballPosRef.current[i][1] = isCollideY(ballPosRef.current[i][1]);
                        ballVelRef.current[i][1] *= -1;
                    }

                    ballPosRef.current[i][0] += ballVelRef.current[i][0];
                    ballPosRef.current[i][1] += ballVelRef.current[i][1];
                    ballVelRef.current[i] = dragEquation(ballVelRef.current[i])
                    drawPoolBall(ctx, poolBalls[i], ballPosRef.current[i][0], ballPosRef.current[i][1]);
                }
                if (Math.abs(ballVelRef.current[i][0]) > minVel || Math.abs(ballVelRef.current[i][1]) > minVel)
                    areBallsMoving.current = true;
            }


            //if (areBallsMoving.current)
            animationFrameId = requestAnimationFrame(draw);
        }
        animationFrameId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animationFrameId);
    }, [poolBalls, reset])

    return (
        < div id="pool-game" >
            <canvas width="1400px" height="700px" ref={canvasRef} onClick={(event) => addWhiteVel(event)} />
            <button id="resetButton" onClick={reset}>Reset Game</button>
            <div id="score">{score}</div>
        </div >
    );

}