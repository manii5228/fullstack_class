import React from 'react';

class Apple extends React.Component {
    render()
     {
        const {appleName, colour} = this.props;
        const appleModel = `my name is ${appleName} it is a ${colour}`;
        return (
            <h1>{appleModel}</h1>
        )
    }
}

export default Apple;