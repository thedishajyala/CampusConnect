const svg2 = '<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.15)"/></svg>';
console.log(Buffer.from(svg2).toString('base64'));
