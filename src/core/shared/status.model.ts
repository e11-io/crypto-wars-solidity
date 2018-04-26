export class Status {
  error: string;
  loading: boolean;

  constructor(data: any = {}) {
    this.error = data.error;
    this.loading = data.loading;
  }

}

export const initialStatus: Status = {
  error:   '',
  loading: false,
};
