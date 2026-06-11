const svg1 = '<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><path d="M30.5 0l.5.5.5.5v58l-.5.5-.5.5v-60z" fill="rgba(130, 130, 130, 0.03)"/><transform><scale x="1" y="1"/></transform></svg>';
console.log(Buffer.from(svg1).toString('base64'));
