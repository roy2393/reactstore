import React from 'react';
import Header from './Header';
import Order from './Order';
import Inventory from './Inventory';
import sampleFishes from '../sample-fishes';
import Fish from './Fish';
import base from '../base';

class App extends React.Component{
	constructor(){
		super();
		this.state = {
			fishes: {},
			order: {}
		}

		this.addFish = this.addFish.bind(this);
		this.loadSamples = this.loadSamples.bind(this);
		this.addToOrder = this.addToOrder.bind(this);
		this.updateFish = this.updateFish.bind(this);
		this.removeFromOrder = this.removeFromOrder.bind(this);
	}

	componentWillMount(){
		//this runs right before App is rendered
		this.ref = base.syncState(`${this.props.params.storeId}/fishes`,
		{
			context: this,
			state: 'fishes'
		})

		const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);
		if(localStorageRef){
			// 	update our App component's order state
			this.setState({
				order: JSON.parse(localStorageRef)
			})
		}
	}

	componentWillUnMount(){
		base.removeBinding(this.ref);
	}

	componentWillUpdate(nextProps, nextState){
		localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
	}

	addFish(fish){
		const fishes = {...this.state.fishes};
		const timestamp = Date.now();
		fishes[`fish-${timestamp}`] = fish;

		this.setState({ fishes});
	}

	updateFish(fish, key){
		const fishes = {...this.state.fishes};
		fishes[key] = fish;

		this.setState({fishes});
	}
	loadSamples(){
		this.setState({
			fishes: sampleFishes
		})
	}

	addToOrder(key){
		const order = {...this.state.order};

		order[key] = order[key]+1 || 1;

		this.setState({
			order
		});
	}

	removeFromOrder(key){
		const order = {...this.state.order};
		order[key] = null;
		delete order[key];
		this.setState({order})

	}
	render(){
		return (
			<div className="catch-of-the-day">
				<div className="menu">
					<Header tagLine="Fresh Sea food market"/>
					<ul className="list-of-fishes">
						{Object
							.keys(this.state.fishes)
							.map(key => <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder}/>)
						}
					</ul>
				</div>

				<Order 
					fishes={this.state.fishes} 
					order={this.state.order} 
					params={this.props.params}
					removeFromOrder={this.removeFromOrder}/>
				<Inventory 
					addFish={this.addFish} 
					loadSamples={this.loadSamples}
					fishes={this.state.fishes}
					updateFish={this.updateFish}
					storeId={this.props.params.storeId}
					/>

			</div>
			);
	}
}

App.propTypes = {
	params : React.PropTypes.object.isRequired
}

export default App;