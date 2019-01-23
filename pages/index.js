import React from 'react'
import Head from 'next/head';
import PropTypes from 'prop-types';
import {Wallet} from 'oip-hdmw'
import {connect} from 'react-redux'
import {withTheme, withStyles} from '@material-ui/core/styles';

//styles
import withLayout from '../lib/withLayout';
import IndexStyles from '../components/styles/IndexStyles'
//wallet
import RenderWallet from '../components/IndexPage/Wallet'
//actions/thunks
import {fetchAndSetBalances} from '../redux/actions/Interface'

class Index extends React.Component {
	constructor(props) {
		super(props)

		this.Wallet = new Wallet("abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about", {discover: false})

		this.state = {
			walletLoaded: true, //toDo set to false and wipe mnemonic above
			discover: false,

			activeCoinName: 'bitcoin',
			activeAccountIndex: 0,
			activeChainIndex: 0,
			activeAddressIndex: 0,

			activeCoin: this.Wallet ? this.Wallet.getCoin('bitcoin') : undefined,
			activeAccount: undefined,
			activeChain: undefined,
			activeAddress: undefined,

			numOfAccountsToShow: 1,
			numOfAddressesToShow: 1,
			
			detailsView: 'addresses',
		}
	}
	
	componentDidMount() {
		console.log('Index.componentDidMount')
		this.props.fetchAndSetBalances()
	}
	
	handleCoinCardClick = (coin) => {
		let Coin = this.Wallet.getCoin(coin)
		let resetAccountIndex = 0
		let Account = Coin.getAccount(resetAccountIndex)
		this.setState({
			activeCoinName: coin,
			activeCoin: Coin,
			activeAccountIndex: resetAccountIndex,
			activeAccount: Account,
		})
	}
	
	handleAccountClick = (Account, i) => {
		this.setState({
			activeAccountIndex: i,
			activeAccount: Account
		})
	}

	handleAddCoin = () => {
		console.log('this function is not yet available')
	}
	
	handleAddAccount = () => {
		if (this.state.numOfAccountsToShow === 12) {
			return
		}
		this.setState({numOfAccountsToShow: this.state.numOfAccountsToShow + 1})
	}

	loadWallet = (mnemonic) => {
		this.Wallet = new Wallet(mnemonic, {discover: false})
		this.setState({
			walletLoaded: true,
			activeCoinName: 'bitcoin',
			activeAccountIndex: 0,
			activeChainIndex: 0,
			activeAddressIndex: 0,
		})
	}
	
	setDetailsView =(view) => {
		if (view === 'addresses' || view === 'transactions') {
			this.setState({detailsView: view})
		} else {
			throw new Error(`Invalid string passed to setDetailsView`)
		}
	}
	
	renderWallet = (classes) => {
		let cops = {
			classes,
			wallet: this.Wallet,
			state: this.state,
			fn: {
				handleCoinCardClick: this.handleCoinCardClick,
				handleAccountClick: this.handleAccountClick,
				handleAddCoin: this.handleAddCoin,
				handleAddAccount: this.handleAddAccount,
				setDetailsView: this.setDetailsView,
			}
		}
		return <RenderWallet classes={cops.classes} wallet={cops.wallet} fn={cops.fn} state={cops.state}/>
	}

	render() {
		const {classes} = this.props
		return (
			<div className={classes.contentContainer}>
				<Head>
					<title>OIP-HDMW</title>
					<meta name="description" content="Open Index Protocol HD Multi Wallet"/>
				</Head>
				{this.renderWallet(classes)}
			</div>
		)
	}
}

const mapDispatchToProps = {
	fetchAndSetBalances
}

Index.getInitialProps = ({reduxStore, res}) => {
	console.log('Index.getInitialProps')
	const state = reduxStore.getState()
	const {Interface} = state //state.Wallet is a default property
	if (res && !Interface.wallet) {
		res.redirect('/load')
	}
	
	return {Interface}
}

Index.propTypes = {
	classes: PropTypes.object.isRequired,
};

let component = withStyles(IndexStyles)(Index) //jss-css
component = withTheme()(component) //jss-css
component = withLayout(component) //hoc
component = connect(undefined, mapDispatchToProps)(component) //redux

export default component