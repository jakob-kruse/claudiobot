export interface ResponseOrError<T> {
  response?: T;
  error?: string;
}
