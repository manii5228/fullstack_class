rain = true
if (rain){
    console.log("rain coat take ra guudu")
}
else{
    console.log("no rain")
}

function traffic_ligth(){
    let tl="red"
    if (tl=="red"){
    console.log("stop")

}
else if(tl=="yellow"){
    console.log("go slow")

}
else if(tl=="green"){
    console.log("go")
}

}

traffic_ligth()

function makrs(mark){
    if (mark<50){
        console.log("imporve")
    }
    else if(mark>=50 & mark<70){
        console.log("hm")
    }
    else if(mark>=70){
        console.log("okay")
    }
}

makrs(56)