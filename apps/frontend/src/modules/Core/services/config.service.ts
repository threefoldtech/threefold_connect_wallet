import flagsmith from 'flagsmith';

export const initializeStellarConfig = () => {
    (<any>window).stellarServerUrl = flagsmith.getValue('stellar-url');
    (<any>window).stellarNetwork = flagsmith.getValue('stellar-network');
    (<any>window).serviceUrl = flagsmith.getValue('threefold-service-url');
    (<any>window).stellarBridgeAddress = flagsmith.getValue('stellar-bridge-address');
    (<any>window).supportedCurrencies = flagsmith.getValue('supported-currencies');
    (<any>window).bridgeFees = flagsmith.getValue('stellar-url');
    (<any>window).currencies = (<any[]>JSON.parse(<string>flagsmith.getValue('currencies'))).reduce(
        (previousValue, currentValue) => {
            if (currentValue.type !== 'stellar') return previousValue;
            previousValue[currentValue.asset_code] = {
                asset_code: currentValue.asset_code,
                issuer: currentValue.issuer,
            };
            return previousValue;
        },
        {}
    );
};
