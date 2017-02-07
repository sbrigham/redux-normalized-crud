export default function CustomError(response) {
  this.name = 'ServerError';
  this.message = 'ServerError',
  this.response = response;
}
