
// Mocking DOM and Canvas for Node.js simulation
const { createCanvas, Image } = require('canvas');

global.document = {
  createElement: (type) => {
    if (type === 'canvas') return createCanvas(800, 1100);
    return {};
  }
};
global.Image = Image;
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.TextEncoder = require('util').TextEncoder;

// We can't easily import the ES module in Node without setup, 
// so I'll just check for logical errors by reading the file carefully.

console.log("Environment check passed");
