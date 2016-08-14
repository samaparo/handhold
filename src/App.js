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
      isHolding: false
    };

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
    }), () => this.connection.emit('disconnect'));
    this.connection.emit('start-hold', {name: this.state.name});

    this.setState({
      isSearching: true
    });
  }
  _onUnhold() {
    if(this.state.isSearching || this.state.isHolding) {
      this.setState({
        isSearching: false,
        isHolding: false,
        whoLetGo: this.state.nameOfFriend ? this.state.name : null,
        nameOfFriend: null
      }, () => {
        this.connection.emit('end-hold', {name: this.state.name});
        this.connection.emit('disconnect');
      });
    }
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
        {!this.state.isRegistered &&
          <h1>What's your name?</h1>
        }
        {!this.state.isRegistered &&
          <form onSubmit={this._submitName.bind(this)}>
            <input type="text" name="name" value={this.state.name} onChange={this._updateName.bind(this)} />
            <button>GO</button>
          </form>
        }
        {this.state.isRegistered &&
          <div className={'main-button ' + (this.state.isSearching ? 'spinning' : this.state.isHolding ? 'breathing' : '')} {...events}></div>
        }
        {this.state.isRegistered &&
          <p>
            {
              this.state.isSearching ? 'Searching for a friend...' :
              this.state.isHolding ? 'Holding hands with ' + this.state.nameOfFriend + '...' :
              this.state.whoLetGo ? (this.state.whoLetGo === this.state.name ? 'You' : this.state.whoLetGo) + ' let go. Press and hold the button to find a new friend.' :
              'Press and hold the button to hold hands with somebody. Hold on for as long as you want.'
            }
          </p>
        }
      </div>
    );
  }
}

export default App;
