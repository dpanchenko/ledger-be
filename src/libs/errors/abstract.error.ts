export abstract class AbstractError extends Error {
  constructor(
    public message: string,
    public payload: any,
    public parent?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
