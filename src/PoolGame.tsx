import { useCallback, useEffect, useRef, useState } from "react";
import "./PoolGame.scss"
export function PoolGame() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);


    const ballRadius = 20;
    const minVel = 5;
    const dragEquation = (speedVector) => {
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
    const poolBalls = ["white", "red", "blue", "green", "yellow", "purple", "orange", "black"];

    const ballPosRef = useRef<number[][]>([]);
    const ballVelRef = useRef<number[][]>([]);

    const pottedRef = useRef<boolean[]>([]);
    const areBallsMoving = useRef(true);

    const reset = useCallback(() => {
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
    const drawPoolBall = (ctx, color, x, y,) => {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }


    function addWhiteVel(event: React.MouseEvent<HTMLCanvasElement>) {
        if (areBallsMoving.current)
            return;
        if (pottedRef.current[0]) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = (canvas as HTMLCanvasElement).getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
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
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

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

    function isCollideX(x) {
        if (x < 40 || x > 1360)
            return true;
        return false;
    }
    function isCollideY(y) {
        if (y < 40 || y > 660)
            return true;
        return false;
    }

    function ballsCollsion(x1, y1, x2, y2) {
        const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return (distance <= 2 * ballRadius);

    }
    function ballsAngle(x1, y1, x2, y2) {
        const angle = Math.atan((y2 - y1) / (x2 - x1));
        return angle;
    }
    function isInPocket(x, y) {
        if (x < 50 && y < 50)
            return true;
        if (x > 1350 && y < 50)
            return true;
        if (x > 1350 && y > 650)
            return true;
        if (x < 50 && y > 650)
            return true;
        if (675 < x && x < 725 && y > 650)
            return true;
        if (675 < x && x < 725 && y < 50)
            return true;
        return false;
    }
    function between(x1, x2, x) {
        return ((x1 < x && x < x2) || (x2 < x && x < x1))
    }
    function getGhostCoordinates(mouseX, mouseY) {
        // non-working code
        return;
        const whiteX = ballPosRef.current[0][0];
        const whiteY = ballPosRef.current[0][1];
        const gradient = (mouseY - whiteY) / (mouseX - whiteX);
        const intersect = mouseY - gradient * mouseX;
        let ghostX = 0;
        let ghostY = 0;
        for (let i = 1; i < poolBalls.length; i++) {
            const targetX = ballPosRef.current[i][0];
            const targetY = ballPosRef.current[i][1];
            if (between(whiteX, mouseX, targetX)) {
                if (between(targetY - 2 * ballRadius, targetY + 2 * ballRadius, gradient * targetX + intersect)) {
                    const phi = Math.atan(gradient);
                    const k = gradient * targetX + intersect - targetY;
                    const d = k * Math.sin(Math.PI / 2 - phi);
                    const theta = Math.asin(d / (2 * ballRadius));
                    const angle = theta - phi;
                    if (targetX < mouseX) {
                        ghostX = targetX + 2 * ballRadius * Math.sin(angle - Math.PI / 2);
                        ghostY = targetY + 2 * ballRadius * Math.cos(angle - Math.PI / 2);
                    }
                    else {
                        ghostX = targetX - 2 * ballRadius * Math.sin(-angle - Math.PI / 2);
                        ghostY = targetY - 2 * ballRadius * Math.cos(-angle - Math.PI / 2);
                    }
                }
            }
        }
        return [ghostX, ghostY];
    }
    useEffect(() => {
        reset();
        const canvas = canvasRef.current;
        let mouseX = 0;
        let mouseY = 0;
        if (!canvas) return;
        const ctx = (canvas as HTMLCanvasElement).getContext("2d");
        const updateMousePosition = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = event.clientX - rect.left;
            mouseY = event.clientY - rect.top;
        };

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
                    if (isInPocket(ballPosRef.current[i][0], ballPosRef.current[i][1]))
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
                        ballVelRef.current[i][0] *= -1;
                    }
                    if (isCollideY(ballPosRef.current[i][1])) {
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
        </div >
    );

}