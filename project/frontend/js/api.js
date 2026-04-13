async function apiRequest(

url,
method="GET",
data=null

){

const token=
localStorage.getItem("token");

const res=
await fetch(

CONFIG.API_BASE_URL+url,

{

method,

headers:{

"Content-Type":"application/json",

Authorization:
token?
"Bearer "+token
:null

},

body:
data?
JSON.stringify(data)
:null

}

);

const json = await res.json();
if(!res.ok) throw new Error(json.message || "API request failed");
return json;

}