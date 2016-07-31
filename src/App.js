/*jshint esversion: 6 */
import React, { Component } from 'react';
import socket from 'socket.io-client';
import './App.css';

class App extends Component {
  constructor() {
    super();

    this.state = {
      name: '',
      nameOfFriend: null,
      whoLetGo: null,
      isRegistered: false,
      isSearching: false,
      isHolding: false,
      connectionNumber: 0
    };

    this.connection = socket();
    this.connection.on('hold-has-started', (data) => this.setState({
      nameOfFriend: data.name,
      isSearching: false,
      isHolding: true
    }));

    this.connection.on('hold-has-ended', (data) => this.setState({
      isSearching: false,
      isHolding: false,
      whoLetGo: this.state.nameOfFriend,
      nameOfFriend: null,
      connectionNumber: this.state.connectionNumber + 1
    }));
  }

  _updateName(e) {
    let updatedState = {};
    updatedState[e.target.name] = e.target.value;
    this.setState(updatedState);
  }
  _submitName(e) {
    e.preventDefault();
    this.setState({
      isRegistered: true
    });
  }
  _onHold() {
    this.connection.emit('start-hold', {name: this.state.name});
    this.setState({
      isSearching: true
    });
  }
  _onUnhold() {
    this.setState({
      isSearching: false,
      isHolding: false,
      whoLetGo: this.state.nameOfFriend ? this.state.name : null,
      nameOfFriend: null,
      connectionNumber: this.state.connectionNumber + 1
    }, () => this.connection.emit('end-hold', {name: this.state.name}));
  }
  render() {
    let events = {
      onTouchStart: this._onHold.bind(this),
      onTouchEnd: this._onUnhold.bind(this),
      onMouseDown: this._onHold.bind(this),
      onMouseUp: this._onUnhold.bind(this)
    };
    return (
      <div className="app">
        <p>
        {
          !this.state.isRegistered ?
            'What\'s your name?' :
            this.state.isSearching ? 'Searching for a friend...' :
            this.state.isHolding ? 'Holding hands with ' + this.state.nameOfFriend + '...' :
            this.state.whoLetGo ? (this.state.whoLetGo === this.state.name ? 'You' : this.state.whoLetGo) + ' let go. Press and hold the button to find a new friend.' :
            'Press and hold the button below to hold hands with somebody. Hold on for as long as you want.'
        }
        </p>
        {!this.state.isRegistered &&
          <form onSubmit={this._submitName.bind(this)}>
            <input type="text" name="name" value={this.state.name} onChange={this._updateName.bind(this)} />
            <button>That's Me</button>
          </form>
        }
        {this.state.isRegistered &&
          <div className='main-button' key={this.state.connectionNumber} {...events}></div>
        }
      </div>
    );
  }
}

export default App;
