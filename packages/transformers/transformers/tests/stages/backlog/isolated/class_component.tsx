import { Component } from "react";

class ClassComponent extends Component {
  render() {
    return (
      <div>
        <p>Class Component: {this.props.message}</p>
      </div>
    );
  }
}

export default ClassComponent;
