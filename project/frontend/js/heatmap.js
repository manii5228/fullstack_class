async function loadHeatmap(){

const data=
await apiRequest(
"/analytics/heatmap"
);

let html="";

data.forEach(d=>{

html+=`

<div
style="

width:20px;

height:20px;

background:rgba(
123,92,255,
${d.level/3}
);

display:inline-block;

margin:2px;

">
</div>

`;

});

document
.getElementById("heatmap")
.innerHTML=html;

}

loadHeatmap();