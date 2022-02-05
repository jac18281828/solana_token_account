import { Connection, PublicKey, Cluster, clusterApiUrl } from '@solana/web3.js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { metadata } from '@metaplex/js/lib/utils'

export const TOKEN_PROGRAM_ID: PublicKey = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export class Solana {
  network: string
  connection: Connection = {} as Connection

  constructor(network: string) {
    this.network = network
  }

  connect(): void {
    const apiUrl = clusterApiUrl(this.network as Cluster)
    this.connection = new Connection(apiUrl, 'confirmed')
  }

  /// @throws (Error)
  async queryTokenAccount() {
    if (this.connection) {
      const walletPrefix = 'aa'
      const accountList = await this.connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
        encoding: 'base64',
        dataSlice: {
          length: 0,
          offset: 0,
        },
        filters: [
          {
            dataSize: 165,
          },
          {
            memcmp: {
              offset: 32,
              bytes: walletPrefix,
            },
          },
        ],
      })

      console.log(`${accountList.length} accounts found for ${walletPrefix}`)
      for (let i = 0; i < accountList.length; i++) {
        const account = accountList[i]
        console.log(`account address: ${account.pubkey.toBase58()}`)
        const accountInfo = await this.connection.getParsedAccountInfo(account.pubkey)
        const infoStruct = accountInfo.value?.data['parsed']['info']
        const mintAddress = infoStruct['mint']
        const tokenAmount = infoStruct.tokenAmount
        // check for an nft decimals 0 and only one token
        if (tokenAmount.decimals === 0 && parseInt(tokenAmount.amount) === 1) {
          console.log(`nft mint: ${mintAddress}`)
          try {
            const metadataPDA = await Metadata.getPDA(new PublicKey(mintAddress))
            const tokenMeta = await Metadata.load(this.connection, metadataPDA)
            const metadataData = tokenMeta.data
            console.log(`must be verified: ${metadataData.collection?.verified}`)
            console.log(`must not be mutable: ${!metadataData.isMutable}`)
            const metadatadatadata = metadataData.data
            console.log(`name: ${metadatadatadata.name}`)
            console.log(`creators: ${metadatadatadata.creators}`)
            console.log(`external uri: ${metadatadatadata.uri}`)
            console.log(`symbol: ${metadatadatadata.symbol}`)
            console.log(`seller fee bps: ${metadatadatadata.sellerFeeBasisPoints}`)
          } catch (error) {
            console.log(`unexpected error ${mintAddress}: ${error}`)
          }
        } else {
          console.log(`token mint ${mintAddress} does not store an nft`)
        }
      }
    } else {
      throw new Error('Not connected')
    }
  }
}
