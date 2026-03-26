exports.log = (msg)=>{

console.log(

new Date().toISOString(),
msg

);

};

exports.error = (err)=>{

console.error(

new Date().toISOString(),
err

);

};