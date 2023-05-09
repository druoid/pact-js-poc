import axios, { AxiosPromise } from 'axios';

/* This code exports a class UserService that has a constructor and a single method getUser.
The constructor takes in a url parameter that is used as the base URL for any requests made with this instance of the UserService.
The getUser method takes in an id parameter and returns an AxiosPromise object. It makes a GET request to a URL constructed by appending 
the provided id to the end of the base URL set in the constructor, /users/${id}, with the Accept header set to 'application/json'.

The axios.request method is used to make the actual HTTP request. It returns a promise that will resolve with an AxiosResponse \
object containing the response data when the request completes. */

export class UserService {
  constructor(private url: string) {}

  public getUser = (id: number): AxiosPromise => {
    return axios.request({
      baseURL: this.url,
      headers: { Accept: 'application/json' },
      method: 'GET',
      url: `/users/${id}`,
    });
  };
}


