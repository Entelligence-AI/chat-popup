import { FC } from 'react';
import { InitType } from './types';

export interface EntelligenceChatProps {
  analyticsData: InitType['analyticsData'];
}

export declare const EntelligenceChat: FC<EntelligenceChatProps>;
export { InitType };
