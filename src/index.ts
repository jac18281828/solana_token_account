import * as dotenv from 'dotenv';
import { Solana } from './solana';

dotenv.config();
(async () => {
  const netName: string | undefined = process.env.NETWORK;

  if (!netName) {
    throw new Error('please visit .env for environment configuration');
  }

  const sol = new Solana(netName ? netName : 'devnet');

  sol.connect();

  sol.queryTokenAccount();
})();
