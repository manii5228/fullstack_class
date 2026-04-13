import Car from './car';
import Apple from './Apple';
const carinfo={carName: "audi", colour: "blue"};
const appleinfo={appleName: "red delicious", colour: "green apple"};
const carList=[
  {brand:"BMW",colour:"Red"},
  {brand:"Ford",colour:"Green"},
  {brand:"Tesla",colour:"Black"}
]
function Garage(){
  return (
    <><><Car {...carinfo} /> </>
    <><Apple {...appleinfo} /></></>
  )
}
export default Garage;