export class Transaction {
  hash: string;
  callback: any;
  constructor(hash, callback){
      this.hash = hash;
      this.callback = callback;
  }
}
