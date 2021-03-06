import React from "react";
import PropTypes from 'prop-types';
import {connect} from 'react-redux'
import {Wallet} from "oip-hdmw";
import _ from 'lodash'
import {setActiveCoin} from '../../redux/actions/Interface/creators'
import {createInitialCoinStates} from '../../redux/actions/Interface/thunks'
import {updateBalances} from '../../redux/actions/HDMW/thunks'
import {initializeExplorerUrls, displayCoin} from '../../redux/actions/Settings/thunks'

import InterfaceWrapper from "../views/wrappers/InterfaceWrapper";

class InterfaceContainer extends React.Component {
	constructor(props) {
		super(props)
		console.log('InterfaceContainer.constructor')
		
		//loadFromLocalStorage
		this.Wallet = props.HDMW.mnemonic ? new Wallet(props.HDMW.mnemonic, {discover: false}) : undefined
		
	}
	
	componentDidMount() {
		console.log('InterfaceContainer.componentDidMount')
		console.log('this.props.Settings.includeTestnetCoins', this.props.Settings.includeTestnetCoins)
		//initialize wallet
		if (this.props.Settings.includeTestnetCoins) {
			this.Wallet.addTestnetCoins()
		}
		
		//if custom networks add coins --ToDo much later
		
		//if custom coin api urls, set
		if (_.isEmpty(this.props.Settings.explorerUrls)) { //toDo: test
			//set coin network apis from wallet with defaults
			this.props.initializeExplorerUrls(this.Wallet)
		} else {
			//set wallet with coinNetworkApis
			this.Wallet.setExplorerUrls(this.props.Settings.explorerUrls)
		}
		
		//initialize interface
		this.props.createInitialCoinStates(this.Wallet)
		
		//if display coins haven't already been set, set them to default wallet coins
		if (this.props.Settings.displayCoins.length === 0) {
			for (let coin of Object.keys(this.Wallet.getCoins())) {
				this.props.displayCoin(coin)
			}
		}
		
		//if custom coin states, override initial states
		//todo: override initial coin states if custom Interface settings
		
		if (!this.props.Settings.displayCoins.includes(this.props.Interface.activeCoin)) {
			if (this.props.Settings.displayCoins.length > 0) {
				this.props.setActiveCoin(this.props.Settings.displayCoins[0])
			}
		}
		
		//fetch balances for all only the displayed coins if available, else all default coins
		if (this.props.Settings.displayCoins.length > 0) {
			this.props.updateBalances(this.Wallet, this.props.Settings.displayCoins)
		} else {
			this.props.updateBalances(this.Wallet)
		}
	}
	
	componentDidUpdate(prevProps, prevState, snapshot) {
		console.log('InterfaceContainer.componentDidUpdate')
		if (prevProps.Settings.explorerUrls !== this.props.Settings.explorerUrls) {
			this.Wallet.setExplorerUrls(this.props.Settings.explorerUrls)
		}
		
		if (prevProps.Settings.displayCoins !== this.props.Settings.displayCoins) {
			if (!this.props.Settings.displayCoins.includes(this.props.Interface.activeCoin)) {
				this.props.setActiveCoin(this.props.Settings.displayCoins[0] || 'flo')
			}
		}
		
		if (this.props.Settings.displayCoins.length > prevProps.Settings.displayCoins.length) {
			//update balances when added coin
			let addedCoins = []
			for (let coin of this.props.Settings.displayCoins) {
				let match = false
				for (let oldCoin of prevProps.Settings.displayCoins) {
					if (coin === oldCoin) {
						match = true
						break
					}
				}
				if (!match) {
					addedCoins.push(coin)
				}
			}
			this.props.updateBalances(this.Wallet, addedCoins)
		}
	}
	
	render() {
		console.log('WalletContainer.render')
		const {Interface, setActiveCoin, updateBalances, HDMW, Settings} = this.props;
		
		return <InterfaceWrapper
			//hdmw
			Wallet={this.Wallet}
			//states
			activeCoin={Interface.activeCoin}
			displayCoins={Settings.displayCoins}
			balances={HDMW.balances}
			totalBalance={HDMW.totalBalance}
			exchangeRates={HDMW.exchangeRates}
			balanceAsyncState={HDMW.balanceAsyncState}
			displayBalances={Settings.displayBalances}
			//actions
			setActiveCoin={setActiveCoin}
			updateBalances={updateBalances}
		/>
	}
}

const mapDispatchToProps = {
	setActiveCoin,
	updateBalances,
	initializeExplorerUrls,
	createInitialCoinStates,
	displayCoin
}

const mapStateToProps = (state) => {
	return {
		Interface: state.Interface,
		Settings: state.Settings,
		HDMW: state.HDMW,
	}
}

InterfaceContainer.propTypes = {
	//store
	Interface: PropTypes.object.isRequired,
	Settings: PropTypes.object.isRequired,
	HDMW: PropTypes.object.isRequired,
	//actions
	setActiveCoin: PropTypes.func.isRequired,
	initializeExplorerUrls: PropTypes.func.isRequired,
	createInitialCoinStates: PropTypes.func.isRequired,
	displayCoin: PropTypes.func.isRequired,
	updateBalances: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(InterfaceContainer)
