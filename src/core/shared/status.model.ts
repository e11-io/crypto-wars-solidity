export class Status {
  error: string;
  loading: boolean;

  constructor(data: any = initialStatus) {
    this.error = data.error;
    this.loading = data.loading;
  }

}

export const initialStatus: Status = {
  error:   '',
  loading: false,
};
