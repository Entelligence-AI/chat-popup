import axios, { AxiosError } from "axios";
import { apiUrl } from "@/utils/contants";
import { headerObject, Conversation } from "@/types";

const FETCH_CONVERSATION_LIST_URL = `${apiUrl}fetchConversationList/`;

const BASE_HEADERS: Record<string, string> = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const fetchConversationList = async (
      UserUUID: string,
      headerObj: headerObject
): Promise<Conversation[] | undefined> => {
      const headers = {
            ...BASE_HEADERS,
            ...headerObj,
      };

      const options = {
            method: "POST",
            url: FETCH_CONVERSATION_LIST_URL,
            headers,
            data: { UserUUID },
      };

      try {
            const response = await axios.request(options);
            return response.data.Conversations;
      } catch (error) {
            if (error instanceof AxiosError) {
                  console.error("Error fetching conversation list:", error.message);
            } else {
                  console.error("Unexpected error:", error);
            }
            return undefined;
      }
};

export default fetchConversationList;
