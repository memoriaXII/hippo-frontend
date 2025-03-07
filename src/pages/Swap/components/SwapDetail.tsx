import { IApiRouteAndQuote } from '@manahippo/hippo-sdk/dist/aggregator/types';
import classNames from 'classnames';
import Button from 'components/Button';
import { useFormikContext } from 'formik';
import useTokenAmountFormatter from 'hooks/useTokenAmountFormatter';
import { useState } from 'react';
import { ExchangeIcon } from 'resources/icons';
import { ISwapSettings } from '../types';
import { RawCoinInfo as CoinInfo } from '@manahippo/coin-list';

const SwapDetail = ({
  routeAndQuote,
  fromToken,
  toToken,
  className = ''
}: {
  routeAndQuote: IApiRouteAndQuote | null | undefined;
  fromToken: CoinInfo;
  toToken: CoinInfo;
  className?: string;
}) => {
  const { values: swapSettings } = useFormikContext<ISwapSettings>();
  const [isPriceYToX, setIsPriceYToX] = useState(true);
  const [tokenAmountFormatter] = useTokenAmountFormatter();

  let rate: string = '-';
  let output: string = '-';
  let minimum: string = '-';
  let priceImpact: string = '-';
  if (routeAndQuote) {
    const outputUiAmt = routeAndQuote.quote.outputUiAmt;
    output = `${tokenAmountFormatter(outputUiAmt, toToken)} ${toToken.symbol}`;
    minimum = `${tokenAmountFormatter(
      outputUiAmt * (1 - swapSettings.slipTolerance / 100),
      toToken
    )} ${toToken.symbol}`;
    priceImpact =
      (routeAndQuote.quote.priceImpact || 0) >= 0.0001
        ? `${((routeAndQuote.quote.priceImpact || 0) * 100).toFixed(2)}%`
        : '<0.01%';

    const avgPrice = routeAndQuote.quote.outputUiAmt / routeAndQuote.quote.inputUiAmt;
    rate =
      !avgPrice || avgPrice === Infinity
        ? 'n/a'
        : isPriceYToX
        ? `1 ${fromToken.symbol} ≈ ${tokenAmountFormatter(avgPrice, toToken)} ${toToken.symbol}`
        : `1 ${toToken.symbol} ≈ ${tokenAmountFormatter(1 / avgPrice, fromToken)} ${
            fromToken.symbol
          }`;
  }

  const details = [
    {
      label: 'Rate',
      value: (
        <div
          className="flex items-center cursor-pointer"
          onClick={() => setIsPriceYToX(!isPriceYToX)}>
          <span className="mr-1">{rate}</span>
          <Button variant="icon" className="mobile:hidden">
            <ExchangeIcon className="font-icon body-regular" />
          </Button>
        </div>
      )
    },
    {
      label: 'Expected Output',
      value: output
    },
    {
      label: 'Minimum Received',
      value: minimum
    },
    {
      label: 'Price Impact',
      value: priceImpact
    },
    {
      label: 'Slippage Tolerance',
      value: `${swapSettings.slipTolerance} %`
    },
    {
      label: 'Max Gas Fee',
      value: `${swapSettings.maxGasFee} Gas Units`
    }
  ];

  return (
    <div className={classNames('flex flex-col gap-1 mt-6 px-2', className)}>
      {details.map((detail) => (
        <div className="flex justify-between" key={detail.label}>
          <div className="text-grey-500 label-large-bold laptop:label-small-bold">
            {detail.label}
          </div>
          <div className="label-large-bold text-grey-700 mobile:flex mobile:justify-end mobile:label-small-bold">
            {detail.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwapDetail;
