import axios, { AxiosError } from "axios";
import { apiUrl } from "@/utils/contants";
import { ConversationReqRepository, headerObject } from "@/types";

const BASE_HEADERS = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const CREATE_CONVERSATION_URL = `${apiUrl}createConversation/`;

const createConversationForRepository = async (
      req: ConversationReqRepository,
      headerObj: headerObject
): Promise<string | undefined> => {
      const headers = {
            ...BASE_HEADERS,
            ...headerObj,
      };

      const options = {
            method: "POST",
            url: CREATE_CONVERSATION_URL,
            headers,
            data: req,
      };

      try {
            const res = await axios.request(options);
            const data = JSON.parse(res.data);
            return data.ConversationUUID;
      } catch (err) {
            console.error("Error creating conversation:", err instanceof AxiosError ? err.message : err);
            return undefined;
      }
};

export default createConversationForRepository;
