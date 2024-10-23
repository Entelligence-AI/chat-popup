import axios, { AxiosError } from "axios";
import { apiUrl } from "@/utils/contants";
import { headerObject } from "@/types";

const CREATE_USER_URL = `${apiUrl}createUser/`;

const BASE_HEADERS: Record<string, string> = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
};

interface CreateUserProps {
      headerObj: headerObject;
      Email: string;
}

const createUser = async ({ headerObj, Email }: CreateUserProps): Promise<any> => {
      const headers = {
            ...BASE_HEADERS,
            ...headerObj,
      };

      const data = {
            Email,
      };

      const response = await axios.post(CREATE_USER_URL, data, { headers });

      return response.data;
};

export default createUser;
