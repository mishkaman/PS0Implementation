import { Turtle, SimpleTurtle, Point, Color } from "./turtle";
import * as fs from "fs";
import { execSync } from "child_process";

export function drawSquare(turtle: Turtle, sideLength: number): void {
  for (let i = 0; i < 4; i++) {
    turtle.forward(sideLength);
    turtle.turn(90);
  }
}

export function chordLength(radius: number, angleInDegrees: number): number {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return Number((2 * radius * Math.sin(angleInRadians / 2)).toFixed(10));
}

export function drawApproximateCircle(
  turtle: Turtle,
  radius: number,
  numSides: number
): void {
  const segmentAngle = 360 / numSides;
  const segmentLength = chordLength(radius, segmentAngle);
  
  for (let i = 0; i < numSides; i++) {
    turtle.forward(segmentLength);
    turtle.turn(segmentAngle);
  }
}

export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function findPath(turtle: Turtle, points: Point[]): string[] {
  let instructions: string[] = [];
  let currentPos = turtle.getPosition();
  let heading = turtle.getHeading();

  for (const target of points) {
    const deltaX = target.x - currentPos.x;
    const deltaY = target.y - currentPos.y;
    const targetAngle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
    const turnAmount = (targetAngle - heading + 360) % 360;

    instructions.push(`turn ${turnAmount.toFixed(2)}`);
    instructions.push(`forward ${distance(currentPos, target).toFixed(2)}`);

    currentPos = target;
    heading = targetAngle;
  }

  return instructions;
}

export function drawPersonalArt(turtle: Turtle): void {
  const starVertices = 5;
  const sideLength = 200;
  const turnAngle = 144;

  for (let i = 0; i < starVertices; i++) {
    turtle.forward(sideLength);
    turtle.turn(turnAngle);
  }
}

function generateHTML(
  pathData: { start: Point; end: Point; color: Color }[]
): string {
  const width = 500;
  const height = 500;
  const scale = 1;
  const centerX = width / 2;
  const centerY = height / 2;

  let svgContent = "";
  for (const segment of pathData) {
    const x1 = segment.start.x * scale + centerX;
    const y1 = segment.start.y * scale + centerY;
    const x2 = segment.end.x * scale + centerX;
    const y2 = segment.end.y * scale + centerY;
    svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${segment.color}" stroke-width="2"/>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
    <title>Turtle Graphics</title>
    <style>
        body { margin: 0; }
    </style>
</head>
<body>
    <svg width="${width}" height="${height}" style="background-color:#f0f0f0;">
        ${svgContent}
    </svg>
</body>
</html>`;
}

function saveHTMLToFile(content: string, filename: string = "output.html"): void {
  fs.writeFileSync(filename, content);
  console.log(`File saved: ${filename}`);
}

function openHTML(filename: string = "output.html"): void {
  try {
    execSync(`open ${filename}`);
  } catch {
    try {
      execSync(`start ${filename}`);
    } catch {
      try {
        execSync(`xdg-open ${filename}`);
      } catch {
        console.log("Failed to open file automatically");
      }
    }
  }
}

export function main(): void {
  const turtle = new SimpleTurtle();

  drawSquare(turtle, 100);
  console.log("Chord length for radius 5, angle 60 degrees:", chordLength(5, 60));

  drawApproximateCircle(turtle, 100, 360);
  console.log("Distance between points (1,2) and (4,6):", distance({ x: 1, y: 2 }, { x: 4, y: 6 }));

  const pathInstructions = findPath(turtle, [
    { x: 20, y: 20 },
    { x: 80, y: 20 },
    { x: 80, y: 80 }
  ]);
  console.log("Path instructions:", pathInstructions);

  drawPersonalArt(turtle);

  const htmlOutput = generateHTML((turtle as SimpleTurtle).getPath());
  saveHTMLToFile(htmlOutput);
  openHTML();
}

if (require.main === module) {
  main();
}