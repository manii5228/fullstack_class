function Car(props){
  const{carName, colour} = props;
  const carModel = `my name is ${carName} it is a ${colour}`;
  return <h2>i am a {carModel}</h2>
}
export default Car;
