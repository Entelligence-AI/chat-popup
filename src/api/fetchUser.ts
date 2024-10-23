import axios from 'axios';
import apiUrl from './api';
import headerObject from '@/types/headerObj';
import User from '@/types/userType';
        
const localHost = apiUrl;

const endPoint = 'fetchUser/';
const url = localHost + endPoint;

let headers: any = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

const fetchUser = async (UserUUID: string, headerObj: headerObject) => {
  headers = {
    ...headers,
    ...headerObj,
  };

  if (!UserUUID) return undefined;

  const options = {
    method: 'POST',
    url: url,
    headers: headers,
    data: {
      UserUUID: UserUUID,
    },
  };
  try {
    const res = await axios.request(options);
    const data = JSON.parse(res.data);
    return data.User;
  } catch (err) {
    console.error(err);
  }
};

export const fetchUserByEmail = async (
  Email: string,
  headerObj: headerObject = {} as any
): Promise<User | undefined> => {
  headers = {
    ...headers,
    ...headerObj,
  };

  if (!Email) return undefined;

  const options = {
    method: 'POST',
    url: url,
    headers: headers,
    data: {
      Email: Email,
    },
  };
  try {
    const res = await axios.request(options);
    const data = JSON.parse(res.data);

    return data.User;
  } catch (err) {
    console.error(err);
  }
};

export default fetchUser;
