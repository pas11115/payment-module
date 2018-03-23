var bitcore = require('bitcore-lib');
var litecore = require('litecore-lib');
var env = process.env.NODE_ENV || 'development';

var config = {
    'development':{
        'port': process.env.PORT || '3000',
        'db': 'mongodb://test:test@ds221228.mlab.com:21228/cowpm',
        'api': 'v1',
        'apiKey': 'udsbcbckdncssuabucukdbksncnn',
        'btc': {
            'network': 'testnet', // testnet || livenet
            'testnet':{
                'apiBaseUrl': 'https://test-insight.bitpay.com',
                'network': bitcore.Networks.testnet
            },
            'livenet':{
                'apiBaseUrl': 'http://insight.coinbank.info/insight-api',
                'network': bitcore.Networks.livenet
            }
        },
        'ltc': {
            'network': 'testnet', // testnet || livenet
            'testnet':{
                'apiBaseUrl': 'https://testnet.litecore.io/api',
                'network': litecore.Networks.testnet
            },
            'livenet':{
                'apiBaseUrl': 'https://insight.litecore.io/api',
                'network': litecore.Networks.livenet
            }
        },
        'web3Provider': 'http://13.250.15.1',
        'ethersNetwork': require('ethers').providers.networks.ropsten
    },
    'production':{
        'port': process.env.PORT,
        'db': process.env.MONGO_URI,
        'api': 'v1',
        'apiKey': process.env.API_KEY,
        'btc': {
            'network': 'livenet', // testnet || livenet
            'testnet':{
                'apiBaseUrl': 'https://test-insight.bitpay.com'
            },
            'livenet':{
                'apiBaseUrl': 'http://insight.coinbank.info/insight-api'
            }
        },
        'web3Provider': 'https://geth.loveblock.io',
        'ethersNetwork': require('ethers').providers.networks.homestead
    }

};

module.exports = config[env];
