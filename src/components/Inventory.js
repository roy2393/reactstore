import React from 'react';
import AddFishForm from './AddFishForm';
import base from '../base';

class Inventory extends React.Component{

    constructor(){
        super();
        this.renderInventory = this.renderInventory.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.authenticate = this.authenticate.bind(this);
        this.authHandler = this.authHandler.bind(this);
        this.logout = this.logout.bind(this);

        this.state = {
            uid: null,
            owner: null
        }
    }

    componentDidMount(){
        base.onAuth((user) => {
            if(user){
                this.authHandler(null, {user});
            }
        })
    }
    handleUpdate(e, key){
        const fish = this.props.fishes[key];
        const updatedFish = {
            ...fish,
            [e.target.name] : e.target.value
        };

        this.props.updateFish(updatedFish, key);
    }

    authenticate(provider){
        console.log(`Trying to login with ${provider}`);
        console.log(base);
        base.authWithOAuthPopup(provider, this.authHandler);
    }

    logout(){
        base.unauth();
        this.setState({
            uid: null
        })
    }
    authHandler(err, authData){
        console.log(authData);
        if(err){
            console.error(err);
            return;
        }

        // grab the store info
        const storeRef =  base.database().ref(this.props.storeId);

        // query the firebase once for the store data
        storeRef.once('value', (snapshot) => {
            const data = snapshot.val() || {};

            // claim it as our own if there is no owner already
            if(!data.owner){
                storeRef.set({
                    owner: authData.user.uid
                });
            }

            this.setState({
                uid: authData.user.uid,
                owner: data.owner || authData.user.uid
            });
        })
    }
    renderLogin(){
        return(
                <nav className="login">
                    <h2>Inventory</h2>
                    <p>Sign in to manage your store's Inventory</p>
                    <button className="github" onClick={() => this.authenticate('github')}>
                        Login with Github
                    </button>
                    <button className="facebook" onClick={() => this.authenticate('facebook')}>
                        Login with Facebook
                    </button>
                    <button className="twitter" onClick={() => this.authenticate('twitter')}>
                        Login with Twitter
                    </button>

                </nav>
            )
    }
    renderInventory(key){
        const fish = this.props.fishes[key];
        return (
                <div className="fish-edit" key={key}>
                    <input
                        type="text"  
                        name="name" 
                        value={fish.name} 
                        placeholder="Fish Name"
                        onChange={(e) => this.handleUpdate(e, key)} />  
                    
                    <input ref={(input) => this.price = input} 
                        type="text" 
                        name="price" 
                        value={fish.price} 
                        placeholder="Fish Price"
                        onChange={(e) => this.handleUpdate(e, key)} />
                    <select 
                        ref={(input) => this.status = input} 
                        name="status" 
                        value={fish.status}
                        onChange={(e) => this.handleUpdate(e, key)}>
                        <option value="available">Fresh</option>
                        <option value="unavailable">Sold Out</option>
                    </select>
                    <textarea 
                        ref={(input) => this.description = input}  
                        name="description"  
                        placeholder="Fish Description"
                        onChange={(e) => this.handleUpdate(e, key)}
                    >{fish.description}</textarea>
                    <input ref={(input) => this.image = input} 
                        type="text" 
                        name="image"  
                        value={fish.image}
                        placeholder="Fish Image" 
                        onChange={(e) => this.handleUpdate(e, key)}/>
                </div>
            );
    }

    render(){
        const logout = <button onClick={this.logout}>Logout</button>;
        // Check if they are not logged in at all
        if(!this.state.uid){
            return <div>{this.renderLogin()}</div>
        }

        if(this.state.uid !== this.state.owner){
            return (
                <div>
                    <p>Sorry you aren't the owner of this store!</p>
                    {logout}
                </div>
                )
        }
        return (
            <div>
                <h2>Inventory</h2>
                {logout}
                {Object.keys(this.props.fishes).map(this.renderInventory)}
                <AddFishForm addFish={this.props.addFish}/>
                <button onClick={this.props.loadSamples}>Load Sample Fish</button>
            </div>
            );
    }
}

Inventory.propTypes = {
    fishes: React.PropTypes.object.isRequired,
    addFish: React.PropTypes.func.isRequired,
    loadSamples: React.PropTypes.func.isRequired,
    updateFish: React.PropTypes.func.isRequired,
    storeId: React.PropTypes.string.isRequired
}

export default Inventory;