import axios, { AxiosError } from "axios";
import { apiUrl } from "@/utils/contants";
import { headerObject } from "@/types";

const STORE_CONVERSATION_URL = `${apiUrl}storeConversationHistory/`;

const BASE_HEADERS: Record<string, string> = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
};

interface StoreConversationProps {
      UserUUID: string;
      ConversationUUID: string;
      question: string;
      answer: string;
      timestamp: string;
      headerObj: headerObject;
}

const storeConversation = async ({
      UserUUID,
      ConversationUUID,
      question,
      answer,
      timestamp,
      headerObj
}: StoreConversationProps): Promise<any> => {
      const headers = {
            ...BASE_HEADERS,
            ...headerObj,
      };

      const data = {
            UserUUID,
            ConversationUUID,
            Question: question,
            Answer: answer,
            Timestamp: timestamp,
            Source: "Chat",
      };

      try {
            const response = await axios.post(STORE_CONVERSATION_URL, data, { headers });
            return response.data;
      } catch (error) {
            if (error instanceof AxiosError) {
                  console.error("Error storing conversation:", error.message);
                  throw new Error(`Failed to store conversation: ${error.message}`);
            }
            console.error("Unexpected error:", error);
            throw error;
      }
};

export default storeConversation;
